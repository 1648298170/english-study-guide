// Generate true isolated-phoneme WAVs for the 48 phonemes via mespeak (eSpeak).
// Verified against espeak-ng phoneme mnemonics extracted from probe words.
// Output: docs/public/audio/stage0/ph-{slug}.wav + phonemes.json manifest.
// Run: node scripts/generate_phonemes.js
const fs = require('fs')
const path = require('path')
const meSpeak = require('mespeak')

const REPO = path.resolve(__dirname, '..')
const OUT_DIR = path.join(REPO, 'docs', 'public', 'audio', 'stage0')

// ipa -> [unique ascii slug, candidate espeak codes (first that passes
// the energy check wins). Pure voiced consonants often render silent in
// isolation, so their last-resort candidate is consonant+schwa ("buh" style,
// the classic phonics form).]
const { execFileSync } = require('child_process')

const PHONEMES = {
  '/ɪ/': ['ih', ['I', 'i', "'I", 'I#']],
  '/e/': ['eh', ['E', 'e']],
  '/æ/': ['ae', ['a', 'A', "'a"]],
  '/ɒ/': ['o', ['0', 'Q', 'A']],
  '/ʊ/': ['uu', ['U', 'u', 'U#']],
  '/ʌ/': ['uh', ['V', 'V#', 'A']],
  '/ə/': ['schwa', ['@', "'@", '@#', '_@']],
  '/iː/': ['ee', ['i:']],
  '/ɑː/': ['ah', ['A:', 'A:']],
  '/ɔː/': ['aw', ['O:']],
  '/uː/': ['oo', ['u:']],
  '/ɜː/': ['er', ['3:', '3:@']],
  '/eɪ/': ['ay', ['eI']],
  '/aɪ/': ['ai', ['aI']],
  '/ɔɪ/': ['oy', ['OI']],
  '/oʊ/': ['oh', ['oU', '@U']],
  '/aʊ/': ['ow', ['aU']],
  '/ɪr/': ['ear', ['i@3', 'I@', 'ir']],
  '/er/': ['air', ['e@', 'er']],
  '/ʊr/': ['oor', ['U@', 'ur']],
  '/p/': ['p', ['p', 'p@']],
  '/b/': ['b', ['b', 'b@', 'bV']],
  '/t/': ['t', ['t', 't@']],
  '/d/': ['d', ['d', 'd@', 'dV']],
  '/k/': ['k', ['k', 'k@']],
  '/g/': ['g', ['g', 'g@', 'gV']],
  '/f/': ['f', ['f', 'f@', 'ff']],
  '/v/': ['v', ['v', 'v@']],
  '/θ/': ['th', ['T', 'T@']],
  '/ð/': ['dh', ['D', 'D@']],
  '/s/': ['s', ['s', 's@', 'ss']],
  '/z/': ['z', ['z', 'z@']],
  '/ʃ/': ['sh', ['S', 'S@', 'SS']],
  '/ʒ/': ['zh', ['Z', 'Z@']],
  '/h/': ['h', ['h', 'h@']],
  '/r/': ['r', ['r', 'r@', 'rV', 'R']],
  '/tʃ/': ['ch', ['tS', 'tS@']],
  '/dʒ/': ['j', ['dZ', 'dZ@', 'dZV']],
  '/tr/': ['tr', ['tr', 'tr@']],
  '/dr/': ['dr', ['dr', 'dr@', 'drV', 'dru', 'drU', 'drR', 'd3r']],
  '/ts/': ['ts', ['ts', 'ts@']],
  '/dz/': ['dz', ['dz', 'dz@']],
  '/m/': ['m', ['m', 'm@', 'mm']],
  '/n/': ['n', ['n', 'n@', 'nn']],
  '/ŋ/': ['ng', ['N', 'N@', 'IN']],
  '/l/': ['l', ['l', 'l@', 'll']],
  '/w/': ['w', ['w', 'w@']],
  '/j/': ['y', ['j', 'j@']],
}

const WIN = 220
const THRESH = 300

function audibleMs(buf) {
  // skip 44-byte wav header, 16-bit mono
  const frames = buf.subarray(44)
  let loud = 0
  for (let i = 0; i + WIN * 2 <= frames.length; i += WIN * 2) {
    let sum = 0
    for (let j = 0; j < WIN; j++) {
      const v = frames.readInt16LE(i + j * 2)
      sum += v * v
    }
    if (Math.sqrt(sum / WIN) > THRESH) loud++
  }
  return loud * 10
}

meSpeak.loadConfig(require('mespeak/src/mespeak_config.json'))
meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'))

fs.mkdirSync(OUT_DIR, { recursive: true })

const manifest = {}
const report = []
const failed = []
for (const [ipa, [s, codes]] of Object.entries(PHONEMES)) {
  let picked = null
  let pickedBuf = null
  for (const code of codes) {
    const buf = meSpeak.speak(`[[${code}]]`, { rawdata: 'buffer', speed: 130 })
    if (buf && buf.length > 500 && audibleMs(buf) >= 40) {
      picked = code
      pickedBuf = buf
      break
    }
  }
  const file = `ph-${s}.wav`
  if (pickedBuf) {
    fs.writeFileSync(path.join(OUT_DIR, file), pickedBuf)
    manifest[ipa] = file
    report.push(`${ipa} -> ${picked}`)
  } else {
    failed.push(ipa)
    report.push(`${ipa} -> FAILED (tried ${codes.join(' ')})`)
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true })

fs.writeFileSync(
  path.join(OUT_DIR, 'phonemes.json'),
  JSON.stringify(manifest, null, 2) + '\n'
)

console.log(report.join('\n'))
console.log(`generated: ${Object.keys(manifest).length} / ${Object.keys(PHONEMES).length}`)
if (failed.length) {
  console.log('FAILED:', failed.join(', '))
  process.exit(1)
}
