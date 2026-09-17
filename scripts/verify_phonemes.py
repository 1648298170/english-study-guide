"""Whisper-verify the 48 phoneme WAVs against accepted orthographic renderings."""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

D = Path("docs/public/audio/stage0")
manifest = json.loads((D / "phonemes.json").read_text(encoding="utf-8"))

# accepted whisper renderings per phoneme (fuzzy; fricatives/nasals vary)
ACC = {
    "/ɪ/": {"i", "it", "ih", "e", "in", "is"},
    "/e/": {"e", "eh", "ed", "et", "a"},
    "/æ/": {"a", "at", "ah", "ad"},
    "/ɒ/": {"o", "oh", "aw", "ot"},
    "/ʊ/": {"u", "oo", "book", "ou"},
    "/ʌ/": {"u", "uh", "up", "ut"},
    "/ə/": {"u", "uh", "a", "ah"},
    "/iː/": {"e", "ee", "ea", "y", "i"},
    "/ɑː/": {"ah", "ar", "a", "o"},
    "/ɔː/": {"aw", "or", "o", "all"},
    "/uː/": {"oo", "o", "u", "who"},
    "/ɜː/": {"er", "ir", "ur", "erh"},
    "/eɪ/": {"ay", "hey", "a", "eh", "ei"},
    "/aɪ/": {"i", "eye", "aye", "ay", "hi", "my"},
    "/ɔɪ/": {"oy", "oi", "oyster"},
    "/oʊ/": {"oh", "o", "ow", "owe"},
    "/aʊ/": {"ow", "au", "out", "ouch"},
    "/ɪr/": {"ear", "eer", "ere", "ir"},
    "/er/": {"air", "are", "ere", "er"},
    "/ʊr/": {"oor", "ur", "ure", "or"},
    "/p/": {"p", "pee", "p." },
    "/b/": {"b", "bee", "be"},
    "/t/": {"t", "tee", "te"},
    "/d/": {"d", "dee", "de"},
    "/k/": {"k", "key", "kay"},
    "/g/": {"g", "gee", "gay"},
    "/f/": {"f", "eff", "if"},
    "/v/": {"v", "vee", "ve"},
    "/θ/": {"th", "thh", "the"},
    "/ð/": {"th", "the", "thee"},
    "/s/": {"s", "es", "ss"},
    "/z/": {"z", "zee", "ze"},
    "/ʃ/": {"sh", "shh", "she", "you"},
    "/ʒ/": {"zh", "ge", "si", "you", "z"},
    "/h/": {"h", "huh", "ha", "a"},
    "/r/": {"r", "ar", "er", "are"},
    "/tʃ/": {"ch", "chi", "che", "tch"},
    "/dʒ/": {"j", "jay", "gee", "j."},
    "/tr/": {"tr", "chr", "tree", "tr."},
    "/dr/": {"dr", "dre", "dry"},
    "/ts/": {"ts", "its", "s"},
    "/dz/": {"dz", "z", "ds"},
    "/m/": {"m", "em", "mm", "um"},
    "/n/": {"n", "en", "in", "un"},
    "/ŋ/": {"ng", "ing", "n"},
    "/l/": {"l", "el", "ell", "luh"},
    "/w/": {"w", "double", "woo"},
    "/j/": {"y", "ye", "why"},
}

model = WhisperModel("small", device="cpu", compute_type="int8")
bad = []
for ipa, fn in manifest.items():
    f = D / fn
    segs, _ = model.transcribe(str(f), language="en", beam_size=5)
    text = " ".join(s.text.strip() for s in segs).strip()
    acc = ACC.get(ipa, set())
    ok = not text or any(a.lower() == text.lower() or a.lower() in text.lower() for a in acc)
    if not text:
        ok = False
    if not ok:
        bad.append((ipa, text))
    print(f"{ipa:6} {fn:14} heard={text!r:14} {'OK' if ok else '<-- CHECK'}")

print()
if bad:
    print("NEED REVIEW:", ", ".join(f"{i}({t!r})" for i, t in bad))
else:
    print("ALL PHONEMES PLAUSIBLE")
