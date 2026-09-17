/**
 * stage0 (启蒙课) 单词点读增强器
 *
 * Decorates lesson tables under /course/stage0/ with 🔊 play buttons:
 * for every English token in a table cell that exists in the pre-generated
 * audio manifest (docs/public/audio/stage0/manifest.json, produced offline
 * by scripts/generate_audio.py via edge-tts), a `.jaudio-btn` is appended
 * right after the token. Clicking plays the corresponding MP3.
 *
 * Rules (kept in sync with scripts/generate_audio.py):
 *   - token regex [A-Za-z][A-Za-z'-]+ plus single letters — tokens of
 *     length >= 2 are checked against manifest `words`; single letters are
 *     checked against `letters` and ONLY inside tables whose header text
 *     contains 大写 / 小写 / 字母 (the alphabet and letter-sound tables).
 *   - tokens overlapping an IPA span (slash-delimited phonetic notation)
 *     are skipped so "/tiː/" never produces a button, while "cat /kæt/ 猫"
 *     still gets one on "cat".
 *
 * SSR-safe: all DOM work happens inside onMounted / route-changed callbacks.
 * Wired up in Layout.vue: setupAudioEnhancer(useRouter()).
 */
import { nextTick, onMounted } from 'vue'
import { withBase } from 'vitepress'
import type { Router } from 'vitepress'

interface AudioManifest {
  words: string[]
  letters: string[]
}

// docs/public/audio/stage0/phonemes.json — ipa -> isolated phoneme wav
interface PhonemeFiles {
  [ipa: string]: string
}

interface ManifestSets {
  words: Set<string>
  letters: Set<string>
  phonemes: Record<string, string>
}

// Keep in sync with scripts/generate_audio.py (TOKEN_RE / IPA_SPAN_RE)
const TOKEN_RE = /[A-Za-z][A-Za-z'-]*/g
const IPA_SPAN_RE = /\/[^/]*?\//g
const LETTER_TABLE_HEADER_RE = /大写|小写|字母/

// 48 phonemes → reference exemplar word (audio reused from the word corpus).
// Isolated phonemes cannot be synthesized by word-level TTS, so clicking a
// phoneme plays its canonical example word from the course's own tables.
const PHONEME_REF: Record<string, string> = {
  '/ɪ/': 'sit', '/e/': 'bed', '/æ/': 'cat', '/ɒ/': 'dog', '/ʊ/': 'book',
  '/ʌ/': 'cup', '/ə/': 'about',
  '/iː/': 'see', '/ɑː/': 'car', '/ɔː/': 'ball', '/uː/': 'food', '/ɜː/': 'bird',
  '/eɪ/': 'name', '/aɪ/': 'time', '/ɔɪ/': 'boy', '/oʊ/': 'go', '/aʊ/': 'now',
  '/ɪr/': 'here', '/er/': 'hair', '/ʊr/': 'tour',
  '/p/': 'pen', '/b/': 'bag', '/t/': 'ten', '/d/': 'dog', '/k/': 'key',
  '/g/': 'girl', '/f/': 'fish', '/v/': 'very', '/θ/': 'think', '/ð/': 'this',
  '/s/': 'sun', '/z/': 'zoo', '/ʃ/': 'she', '/ʒ/': 'usually', '/h/': 'hand',
  '/r/': 'red',
  '/tʃ/': 'chair', '/dʒ/': 'jump', '/tr/': 'tree', '/dr/': 'dream',
  '/ts/': 'cats', '/dz/': 'friends',
  '/m/': 'mother', '/n/': 'nose', '/ŋ/': 'sing', '/l/': 'look',
  '/w/': 'water', '/j/': 'yes'
}

// Sections whose tables get 🔊 buttons; audio lives at /audio/<section>/
// Keep in sync with scripts/generate_audio.py SECTIONS
const AUDIO_SECTIONS = ['stage0', 'roots', 'pos'] as const
type AudioSection = (typeof AUDIO_SECTIONS)[number]

let manifestCache = new Map<AudioSection, Promise<ManifestSets | null>>()
let currentAudio: HTMLAudioElement | null = null
let loading = false
let clickListenerBound = false

function currentSection(): AudioSection | null {
  if (typeof window === 'undefined') return null
  const p = window.location.pathname
  for (const s of AUDIO_SECTIONS) {
    if (p.includes(`/course/${s}/`)) return s
  }
  return null
}

function loadManifest(section: AudioSection): Promise<ManifestSets | null> {
  let cached = manifestCache.get(section)
  if (!cached) {
    cached = Promise.all([
      fetch(withBase(`/audio/${section}/manifest.json`)).then((res) => {
        if (!res.ok) throw new Error(`manifest HTTP ${res.status}`)
        return res.json() as Promise<AudioManifest>
      }),
      section === 'stage0'
        ? fetch(withBase('/audio/stage0/phonemes.json'))
            .then((res) => (res.ok ? (res.json() as Promise<PhonemeFiles>) : {}))
            .catch(() => ({}))
        : Promise.resolve({})
    ])
      .then(([m, ph]) => ({
        words: new Set((m.words ?? []).map((w) => w.toLowerCase())),
        letters: new Set((m.letters ?? []).map((l) => l.toLowerCase())),
        phonemes: ph ?? {}
      }))
      .catch((err) => {
        console.warn('[audio] manifest unavailable:', err)
        manifestCache.delete(section) // allow retry on next navigation
        return null
      })
    manifestCache.set(section, cached)
  }
  return cached
}

function makeButton(word: string): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'jaudio-btn'
  btn.dataset.word = word
  btn.setAttribute('aria-label', `播放 ${word} 发音`)
  btn.textContent = '🔊'
  return btn
}

function makePhonemeButton(
  ipa: string,
  refWord: string,
  wavFile?: string
): HTMLButtonElement {
  const btn = makeButton(refWord)
  btn.className = 'jaudio-btn jaudio-ph'
  if (wavFile) {
    btn.dataset.audio = withBase(`/audio/stage0/${wavFile}`)
    btn.setAttribute('aria-label', `听 ${ipa} 的音素发音`)
    btn.setAttribute(
      'title',
      `音素 ${ipa}（合成音色）· 旁边 🔊 是示范词 ${refWord}`
    )
  } else {
    btn.setAttribute('aria-label', `听 ${ipa} 的示范发音（${refWord}）`)
    btn.setAttribute('title', `播放示范词：${refWord}`)
  }
  btn.textContent = '▶'
  return btn
}

interface DecorateAction {
  start: number
  end: number
  kind: 'word' | 'ph'
  token: string
  ipa?: string
  file?: string
}

function decorateTextNode(
  node: Text,
  manifest: ManifestSets,
  allowLetters: boolean,
  allowPhonemes: boolean
): void {
  const text = node.nodeValue ?? ''
  if (!text) return
  if (!/[A-Za-z/]/.test(text)) return

  // compute IPA spans so tokens inside /.../ are ignored
  const spans: Array<[number, number, string]> = []
  for (const m of text.matchAll(IPA_SPAN_RE)) {
    spans.push([m.index ?? 0, (m.index ?? 0) + m[0].length, m[0]])
  }
  const inIpa = (start: number, end: number) =>
    spans.some(([a, b]) => start < b && end > a)

  const actions: DecorateAction[] = []
  for (const m of text.matchAll(TOKEN_RE)) {
    const token = m[0]
    const start = m.index ?? 0
    const end = start + token.length
    if (inIpa(start, end)) continue
    const lower = token.toLowerCase()
    const hit =
      token.length >= 2
        ? manifest.words.has(lower)
        : allowLetters && manifest.letters.has(lower)
    if (hit) actions.push({ start, end, kind: 'word', token })
  }
  // phoneme spans (exact match like "/æ/") get a zero-width insertion button
  // placed right AFTER the span
  if (allowPhonemes) {
    for (const [a, b, raw] of spans) {
      const ref = PHONEME_REF[raw]
      if (ref && manifest.words.has(ref)) {
        actions.push({
          start: b,
          end: b,
          kind: 'ph',
          token: ref,
          ipa: raw,
          file: manifest.phonemes[raw]
        })
      }
    }
  }
  if (!actions.length) return
  actions.sort((x, y) => x.start - y.start || x.end - y.end)

  const frag = document.createDocumentFragment()
  let last = 0
  let added = false
  for (const act of actions) {
    if (act.start < last) continue // overlap guard
    frag.append(text.slice(last, act.start))
    if (act.kind === 'word') {
      frag.append(act.token) // keep the visible word/letter itself
      frag.append(makeButton(act.token))
    } else {
      frag.append(makePhonemeButton(act.ipa ?? '', act.token, act.file))
    }
    last = Math.max(last, act.end)
    added = true
  }
  if (!added) return
  frag.append(text.slice(last))
  node.replaceWith(frag)
}

function decorateCell(td: HTMLElement, manifest: ManifestSets): void {
  if (td.dataset.audioDone) return
  td.dataset.audioDone = '1'

  const table = td.closest('table')
  const headerText = table?.querySelector('thead')?.textContent ?? ''
  const allowLetters = LETTER_TABLE_HEADER_RE.test(headerText)
  const allowPhonemes = currentSection() === 'stage0'

  // roots/pos sections: only whole-cell single English words get a button —
  // 拆解 fragments ("in-(向内)+spect(看)") and in-cell example sentences stay clean
  const section = currentSection()
  if (section === 'roots' || section === 'pos') {
    const stripped = (td.textContent ?? '')
      .replace(IPA_SPAN_RE, '')
      .trim()
    if (!/^[A-Za-z][A-Za-z'-]*$/.test(stripped)) return
  }

  const walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    textNodes.push(n as Text)
  }
  for (const node of textNodes) {
    decorateTextNode(node, manifest, allowLetters, allowPhonemes)
  }
}

function decoratePage(manifest: ManifestSets): void {
  document
    .querySelectorAll<HTMLElement>('.vp-doc table td')
    .forEach((td) => decorateCell(td, manifest))

  // stage0 headings like "## /ɪ/：松弛短促的「衣」" get a phoneme button too
  if (currentSection() === 'stage0') {
    document
      .querySelectorAll<HTMLElement>('.vp-doc h2, .vp-doc h3')
      .forEach((h) => {
        if (h.dataset.audioDone) return
        h.dataset.audioDone = '1'
        const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT)
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          decorateTextNode(n as Text, manifest, false, true)
        }
      })
  }
}

async function enhance(): Promise<void> {
  const section = currentSection()
  if (!section) return
  const manifest = await loadManifest(section)
  if (!manifest) return
  // let VitePress finish rendering the route before scanning the DOM
  await nextTick()
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  )
  decoratePage(manifest)
}

function stopCurrent(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  document
    .querySelectorAll('.jaudio-btn.playing')
    .forEach((b) => b.classList.remove('playing'))
}

function play(word: string, btn: HTMLElement): void {
  if (loading) return // guard double-taps while an audio is loading
  const section = currentSection()
  if (!section) return
  stopCurrent()

  // explicit source (phoneme wav) wins; fall back to the exemplar word mp3
  // if it fails to load
  const fallback = withBase(
    `/audio/${section}/${encodeURIComponent(word.toLowerCase())}.mp3`
  )
  const src = btn.dataset.audio || fallback
  const audio = new Audio(src)
  currentAudio = audio
  loading = true
  btn.classList.add('playing')

  const unlock = () => {
    loading = false
  }
  const finish = () => {
    unlock()
    btn.classList.remove('playing')
  }
  audio.addEventListener('playing', unlock)
  audio.addEventListener('ended', finish)
  audio.addEventListener('error', () => {
    if (src !== fallback) {
      // phoneme wav missing -> retry with the exemplar word
      try {
        audio.pause()
      } catch {
        /* noop */
      }
      const retry = new Audio(fallback)
      currentAudio = retry
      retry.addEventListener('ended', finish)
      retry.addEventListener('error', finish)
      retry.play().catch(finish)
      return
    }
    finish()
  })
  audio.play().catch(() => {
    stopCurrent()
    finish()
  })
  setTimeout(unlock, 4000) // safety: never stay locked on a stuck load
}

function bindClickListener(): void {
  if (clickListenerBound) return
  clickListenerBound = true
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null
    const btn = target?.closest?.('.jaudio-btn')
    if (!btn) return
    const word = (btn as HTMLElement).dataset.word
    if (word) play(word, btn as HTMLElement)
  })
}

/**
 * Register the stage0 audio enhancer. Call once from Layout.vue:
 *   setupAudioEnhancer(useRouter())
 */
export function setupAudioEnhancer(router: Router): void {
  onMounted(() => {
    bindClickListener()
    void enhance()
  })
  router.onAfterRouteChanged = () => {
    void enhance()
  }
}
