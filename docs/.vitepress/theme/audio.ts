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

interface ManifestSets {
  words: Set<string>
  letters: Set<string>
}

// Keep in sync with scripts/generate_audio.py (TOKEN_RE / IPA_SPAN_RE)
const TOKEN_RE = /[A-Za-z][A-Za-z'-]*/g
const IPA_SPAN_RE = /\/[^/]*?\//g
const LETTER_TABLE_HEADER_RE = /大写|小写|字母/

let manifestCache: Promise<ManifestSets | null> | null = null
let currentAudio: HTMLAudioElement | null = null
let loading = false
let clickListenerBound = false

function isStage0Page(): boolean {
  return typeof window !== 'undefined'
    ? window.location.pathname.includes('/course/stage0/')
    : false
}

function loadManifest(): Promise<ManifestSets | null> {
  if (!manifestCache) {
    manifestCache = fetch(withBase('/audio/stage0/manifest.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`manifest HTTP ${res.status}`)
        return res.json() as Promise<AudioManifest>
      })
      .then((m) => ({
        words: new Set((m.words ?? []).map((w) => w.toLowerCase())),
        letters: new Set((m.letters ?? []).map((l) => l.toLowerCase()))
      }))
      .catch((err) => {
        console.warn('[audio] manifest unavailable:', err)
        manifestCache = null // allow retry on next navigation
        return null
      })
  }
  return manifestCache
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

function decorateTextNode(
  node: Text,
  manifest: ManifestSets,
  allowLetters: boolean
): void {
  const text = node.nodeValue ?? ''
  if (!/[A-Za-z]/.test(text)) return

  // compute IPA spans so tokens inside /.../ are ignored
  const spans: Array<[number, number]> = []
  for (const m of text.matchAll(IPA_SPAN_RE)) {
    spans.push([m.index ?? 0, (m.index ?? 0) + m[0].length])
  }
  const inIpa = (start: number, end: number) =>
    spans.some(([a, b]) => start < b && end > a)

  const frag = document.createDocumentFragment()
  let last = 0
  let added = false
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
    if (!hit) continue
    frag.append(text.slice(last, start))
    frag.append(token) // keep the visible word/letter itself
    frag.append(makeButton(token))
    last = end
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

  const walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    textNodes.push(n as Text)
  }
  for (const node of textNodes) {
    decorateTextNode(node, manifest, allowLetters)
  }
}

function decoratePage(manifest: ManifestSets): void {
  document
    .querySelectorAll<HTMLElement>('.vp-doc table td')
    .forEach((td) => decorateCell(td, manifest))
}

async function enhance(): Promise<void> {
  if (!isStage0Page()) return
  const manifest = await loadManifest()
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
  stopCurrent()

  const audio = new Audio(
    withBase(`/audio/stage0/${encodeURIComponent(word.toLowerCase())}.mp3`)
  )
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
  audio.addEventListener('error', finish)
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
