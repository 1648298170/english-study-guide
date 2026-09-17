#!/usr/bin/env python3
"""
Generate click-to-play pronunciation MP3s for the stage0 (启蒙课) lessons.

WHAT IT DOES
  1. Parses the 9 lesson files under docs/course/stage0/ (0*.md — index.md is
     NOT scanned; 09-review.md IS scanned) and extracts every English token
     found in TABLE CELLS via the regex [A-Za-z][A-Za-z'-]* (length >= 2).
     - Covers 单词表 first columns, 词对 cells like "ship / sheep" (both words),
       拼读表 word columns, and cells like "cat /kæt/ 猫".
     - Tokens inside IPA spans (/.../) are stripped first, so "/tiː/" does NOT
     - produce the junk token "ti". Slash-separated cells ("ship / sheep") are
       unaffected because they contain no closing-pair IPA group.
     - 2-letter spelling combos ("ch", "oo", "er" ...) and hyphenated syllable
       splits ("hap-py") are intentionally kept — they are pronounceable units.
  2. Adds the 26 single letters a-z (for the alphabet table in 01-alphabet.md;
     TTS receives the UPPERCASE form so isolated letters are read as letter
     names, e.g. "a" -> "A" -> /eɪ/).
  3. Synthesizes one MP3 per entry with edge-tts (en-US-AriaNeural, -12% rate),
     Semaphore(8) concurrency, 3 retries per entry.
  4. Writes docs/public/audio/stage0/manifest.json
     {"words": [...], "letters": ["a", ..., "z"]}
     consumed by docs/.vitepress/theme/audio.ts to decorate lesson tables.

RESUMABLE
  An existing MP3 > 1 KB is considered done and skipped, so you can re-run
  this script after an interruption and it only fetches what's missing.

EXTENDING
  To cover future lessons (a1, a2, ...), adjust STAGE0_DIR / LESSON_GLOB or add
  more (dir, glob) pairs in extract_words(). Keep the manifest + audio.ts
  token rules in sync with TOKEN_RE / IPA_SPAN_RE below.

USAGE
  python scripts/generate_audio.py
  (exit code 0 on success, 1 if any entry failed after retries)
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
STAGE0_DIR = REPO_ROOT / "docs" / "course" / "stage0"
OUT_DIR = REPO_ROOT / "docs" / "public" / "audio" / "stage0"
MANIFEST_PATH = OUT_DIR / "manifest.json"

LESSON_GLOB = "0*.md"  # 01-... through 09-...; excludes index.md

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


def extract_words() -> tuple[set[str], list[str]]:
    """Return (unique lowercase words from table cells, 26 letters)."""
    token_re = re.compile(TOKEN_RE)
    sep_re = re.compile(SEP_CELL_RE)

    words: set[str] = set()
    lesson_files = sorted(STAGE0_DIR.glob(LESSON_GLOB))
    if not lesson_files:
        raise SystemExit(f"no lesson files matched {STAGE0_DIR / LESSON_GLOB}")

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
                for tok in token_re.findall(strip_ipa(cell)):
                    if len(tok) >= 2:
                        words.add(tok.lower())
                        file_words.add(tok.lower())
        print(f"  {path.name}: {len(file_words)} unique words")

    letters = list(string.ascii_lowercase)
    return words, letters


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


async def main() -> int:
    t0 = time.time()
    print(f"[1/3] extracting words from {STAGE0_DIR / LESSON_GLOB}")
    words, letters = extract_words()
    print(f"      total unique words: {len(words)}  letters: {len(letters)}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # (tts_text, output_path) — letters are spoken via their UPPERCASE form
    # (isolated uppercase letters are read as letter names: "A" → /eɪ/)
    jobs = [(w, OUT_DIR / f"{w}.mp3") for w in sorted(words)]
    jobs += [(ch.upper(), OUT_DIR / f"{ch}.mp3") for ch in letters]

    print(f"[2/3] synthesizing {len(jobs)} MP3s (voice={VOICE} rate={RATE}, "
          f"concurrency={CONCURRENCY}, retries={RETRIES})")
    sem = asyncio.Semaphore(CONCURRENCY)
    results = await asyncio.gather(*(synth_entry(t, p, sem) for t, p in jobs))

    generated = results.count("ok")
    skipped = results.count("skip")
    failures = [p.stem for (t, p), r in zip(jobs, results) if r == "fail"]

    print(f"[3/3] writing manifest -> {MANIFEST_PATH}")
    manifest = {
        "words": sorted(words),
        "letters": letters,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    mp3_count = len(list(OUT_DIR.glob("*.mp3")))
    total_kb = sum(p.stat().st_size for p in OUT_DIR.glob("*.mp3")) // 1024
    print("-" * 56)
    print(f"words in manifest : {len(words)}")
    print(f"letters in manifest: {len(letters)}")
    print(f"generated this run: {generated}")
    print(f"skipped (cached)  : {skipped}")
    print(f"failures          : {len(failures)}{'' if not failures else ' -> ' + ', '.join(failures)}")
    print(f"mp3 files on disk : {mp3_count} ({total_kb} KB total)")
    print(f"elapsed           : {time.time() - t0:.1f}s")

    if failures or mp3_count != len(words) + len(letters):
        return 1
    return 0


if __name__ == "__main__":
    if sys.platform == "win32":
        # aiohttp + ProactorEventLoop prints spurious "Event loop is closed"
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    sys.exit(asyncio.run(main()))
