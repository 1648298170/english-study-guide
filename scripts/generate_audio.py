#!/usr/bin/env python3
"""
Generate click-to-play pronunciation MP3s for course lessons (multi-section).

WHAT IT DOES
  For each section below, parses the lesson tables, extracts English tokens,
  synthesizes one MP3 per token with edge-tts, and writes a per-section
  manifest consumed by docs/.vitepress/theme/audio.ts.

SECTIONS
  stage0 : docs/course/stage0/0*.md    -> docs/public/audio/stage0/
           (+ 26 single letters for the alphabet table; TTS receives the
            UPPERCASE form so isolated letters are read as letter names)
  roots  : docs/course/roots/unit-*.md -> docs/public/audio/roots/
           (词根词缀课派生词; no letters)

EXTRACTION RULES (keep in sync with audio.ts TOKEN_RE / IPA_SPAN_RE)
  - tokens match [A-Za-z][A-Za-z'-]* with length >= 2
  - IPA spans (/.../) are stripped first, so "/tiː/" produces no junk token
  - only markdown table rows (lines starting with "|") are scanned

RESUMABLE
  An existing MP3 > 1 KB is considered done and skipped.

USAGE
  python scripts/generate_audio.py            # all sections
  python scripts/generate_audio.py roots      # one section only
"""

from __future__ import annotations

import asyncio
import json
import re
import string
import sys
import time
from pathlib import Path

import edge_tts

REPO_ROOT = Path(__file__).resolve().parent.parent

SECTIONS: dict[str, dict] = {
    "stage0": {
        "lesson_dir": REPO_ROOT / "docs" / "course" / "stage0",
        "lesson_glob": "0*.md",
        "out_dir": REPO_ROOT / "docs" / "public" / "audio" / "stage0",
        "letters": True,
        # scan every token in every table cell (单词表 + 词对 + 拼读表)
        "whole_cell_only": False,
    },
    "roots": {
        "lesson_dir": REPO_ROOT / "docs" / "course" / "roots",
        "lesson_glob": "unit-*.md",
        "out_dir": REPO_ROOT / "docs" / "public" / "audio" / "roots",
        "letters": False,
        # only cells that contain EXACTLY one English word (the derived-word
        # column). 拆解 cells like "in-(向内)+spect(看)" and in-cell example
        # sentences must NOT get audio — their fragments are not words.
        "whole_cell_only": True,
    },
    "pos": {
        "lesson_dir": REPO_ROOT / "docs" / "course" / "pos",
        "lesson_glob": "unit-*.md",
        "out_dir": REPO_ROOT / "docs" / "public" / "audio" / "pos",
        "letters": False,
        # same rule as roots: only whole-cell single English words (生词表
        # first column); in-cell example sentences stay clean
        "whole_cell_only": True,
    },
}

VOICE = "en-US-AriaNeural"
RATE = "-12%"
CONCURRENCY = 8
RETRIES = 3
SKIP_MIN_BYTES = 1024  # resumable: existing file must be at least this big

# Must stay in sync with docs/.vitepress/theme/audio.ts
TOKEN_RE = r"[A-Za-z][A-Za-z'-]*"
IPA_SPAN_RE = r"/[^/]*?/"  # non-greedy /.../ pair — strips /kæt/, /eɪ/ etc.
SEP_CELL_RE = r"^:?-{3,}:?$"  # markdown table separator row cell like ---


def strip_ipa(cell: str) -> str:
    return re.sub(IPA_SPAN_RE, "", cell)


def extract_words(
    lesson_dir: Path, lesson_glob: str, whole_cell_only: bool = False
) -> set[str]:
    """Return unique lowercase words from table cells of the section lessons."""
    token_re = re.compile(TOKEN_RE)
    sep_re = re.compile(SEP_CELL_RE)
    whole_re = re.compile(rf"^{TOKEN_RE}$")

    words: set[str] = set()
    lesson_files = sorted(lesson_dir.glob(lesson_glob))
    if not lesson_files:
        raise SystemExit(f"no lesson files matched {lesson_dir / lesson_glob}")

    for path in lesson_files:
        file_words: set[str] = set()
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line.startswith("|"):
                continue  # only table rows
            cells = [c.strip() for c in line.strip("|").split("|")]
            # skip separator rows (|---|---|)
            if cells and all(sep_re.match(c) for c in cells if c):
                continue
            for cell in cells:
                stripped = strip_ipa(cell).strip()
                if whole_cell_only:
                    # cell must be exactly one English word (nothing else)
                    m = whole_re.match(stripped)
                    if m and len(m.group(0)) >= 2:
                        words.add(m.group(0).lower())
                        file_words.add(m.group(0).lower())
                    continue
                for tok in token_re.findall(stripped):
                    if len(tok) >= 2:
                        words.add(tok.lower())
                        file_words.add(tok.lower())
        print(f"  {path.name}: {len(file_words)} unique words")

    return words


async def synth_entry(text: str, dest: Path, sem: asyncio.Semaphore) -> str:
    """Synthesize one MP3. Returns 'ok' | 'skip' | 'fail'."""
    if dest.exists() and dest.stat().st_size > SKIP_MIN_BYTES:
        return "skip"

    tmp = dest.with_name(dest.name + ".part")
    for attempt in range(1, RETRIES + 1):
        try:
            async with sem:
                tts = edge_tts.Communicate(text, VOICE, rate=RATE)
                await tts.save(str(tmp))
            if tmp.exists() and tmp.stat().st_size > 0:
                tmp.replace(dest)
                return "ok"
            raise RuntimeError("empty output file")
        except Exception as exc:  # noqa: BLE001 — want to survive any per-word error
            print(f"    [retry {attempt}/{RETRIES}] {dest.stem}: {exc}")
            await asyncio.sleep(1.0 * attempt)
    tmp.unlink(missing_ok=True)
    return "fail"


async def run_section(name: str, cfg: dict, sem: asyncio.Semaphore) -> int:
    t0 = time.time()
    print(f"[{name}] extracting words from {cfg['lesson_dir'] / cfg['lesson_glob']}")
    words = extract_words(
        cfg["lesson_dir"], cfg["lesson_glob"], cfg.get("whole_cell_only", False)
    )
    letters = list(string.ascii_lowercase) if cfg["letters"] else []
    print(f"      total unique words: {len(words)}  letters: {len(letters)}")

    out_dir: Path = cfg["out_dir"]
    out_dir.mkdir(parents=True, exist_ok=True)

    # (tts_text, output_path) — letters are spoken via their UPPERCASE form
    # (isolated uppercase letters are read as letter names: "A" → /eɪ/)
    jobs = [(w, out_dir / f"{w}.mp3") for w in sorted(words)]
    jobs += [(ch.upper(), out_dir / f"{ch}.mp3") for ch in letters]

    print(f"[{name}] synthesizing {len(jobs)} MP3s (voice={VOICE} rate={RATE})")
    results = await asyncio.gather(*(synth_entry(t, p, sem) for t, p in jobs))

    generated = results.count("ok")
    skipped = results.count("skip")
    failures = [p.stem for (t, p), r in zip(jobs, results) if r == "fail"]

    manifest_path = out_dir / "manifest.json"
    manifest = {"words": sorted(words)}
    if letters:
        manifest["letters"] = letters
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    mp3_count = len(list(out_dir.glob("*.mp3")))
    total_kb = sum(p.stat().st_size for p in out_dir.glob("*.mp3")) // 1024
    print(f"[{name}] manifest words={len(words)} letters={len(letters)}")
    print(f"[{name}] generated={generated} skipped={skipped} failures={len(failures)}"
          f"{'' if not failures else ' -> ' + ', '.join(failures)}")
    print(f"[{name}] mp3 files on disk: {mp3_count} ({total_kb} KB) "
          f"elapsed {time.time() - t0:.1f}s")

    if failures or mp3_count != len(words) + len(letters):
        return 1
    return 0


async def main() -> int:
    wanted = [a for a in sys.argv[1:] if a in SECTIONS]
    unknown = [a for a in sys.argv[1:] if a not in SECTIONS]
    if unknown:
        print(f"unknown section(s): {', '.join(unknown)}; known: {', '.join(SECTIONS)}")
        return 2
    sections = wanted or list(SECTIONS)

    sem = asyncio.Semaphore(CONCURRENCY)
    exit_codes = []
    for name in sections:
        exit_codes.append(await run_section(name, SECTIONS[name], sem))
    return max(exit_codes)


if __name__ == "__main__":
    if sys.platform == "win32":
        # aiohttp + ProactorEventLoop prints spurious "Event loop is closed"
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    sys.exit(asyncio.run(main()))
