"""Energy-check the phoneme WAVs: every file must contain a real audible sound.

A WAV passes if its non-silent portion (10ms windows with RMS above threshold)
lasts at least 40ms. This catches silence/empty failures that whisper cannot
reliably judge for isolated phonemes.
"""
import json
import struct
import sys
import wave
from pathlib import Path

D = Path("docs/public/audio/stage0")
manifest = json.loads((D / "phonemes.json").read_text(encoding="utf-8"))

WIN = 220  # 10ms @ 22050Hz
THRESH = 300  # int16 RMS threshold


def windows(frames: bytes):
    for i in range(0, len(frames) - WIN * 2 + 1, WIN * 2):
        chunk = struct.unpack(f"<{WIN}h", frames[i : i + WIN * 2])
        rms = (sum(x * x for x in chunk) / WIN) ** 0.5
        yield rms


bad = []
for ipa, fn in sorted(manifest.items()):
    f = D / fn
    with wave.open(str(f), "rb") as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2
        frames = w.readframes(w.getnframes())
    loud = [r for r in windows(frames) if r > THRESH]
    dur_loud = len(loud) * 10  # ms
    dur_total = len(frames) // 2 / 22050 * 1000
    ok = dur_loud >= 40
    if not ok:
        bad.append((ipa, fn, dur_loud))
    print(
        f"{ipa:6} {fn:14} total={dur_total:5.0f}ms  audible={dur_loud:4d}ms  "
        f"peak={max(windows(frames)) if frames else 0:6.0f}  {'OK' if ok else '<-- SILENT?'}"
    )

print()
print("SILENT/FAILED:", bad if bad else "none — all phonemes audible")
sys.exit(1 if bad else 0)
