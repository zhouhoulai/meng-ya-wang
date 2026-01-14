// 语音工具函数 - 提供更自然的中文语音播报

type VoiceGender = "female" | "male" | "any"

interface SpeakOptions {
  rate?: number // 语速 0.1-2, 默认 0.85
  pitch?: number // 音调 0-2, 默认 1.15
  volume?: number // 音量 0-1, 默认 1
  gender?: VoiceGender // 优先选择的声音性别
  onStart?: () => void
  onEnd?: () => void
}

// 缓存中文语音列表
let cachedVoices: SpeechSynthesisVoice[] = []
let voicesLoaded = false

// 获取可用的中文语音
function getChineseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return []
  }

  if (!voicesLoaded) {
    cachedVoices = window.speechSynthesis.getVoices()
    if (cachedVoices.length > 0) {
      voicesLoaded = true
    }
  }

  // 筛选中文语音
  return cachedVoices.filter(
    (voice) =>
      voice.lang.includes("zh") || voice.lang.includes("CN") || voice.lang.includes("TW") || voice.lang.includes("HK"),
  )
}

// 选择最佳中文语音
function selectBestVoice(gender: VoiceGender = "female"): SpeechSynthesisVoice | null {
  const voices = getChineseVoices()

  if (voices.length === 0) {
    return null
  }

  // 优先级：
  // 1. 匹配性别的普通话语音
  // 2. 任意普通话语音
  // 3. 任意中文语音

  const mandarinVoices = voices.filter((v) => v.lang.includes("zh-CN") || v.lang.includes("zh_CN"))

  // 尝试根据名称判断性别
  const isFemaleVoice = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase()
    return (
      name.includes("female") ||
      name.includes("woman") ||
      name.includes("女") ||
      name.includes("xiaoxiao") ||
      name.includes("xiaoyi") ||
      name.includes("yaoyao") ||
      name.includes("tingting") ||
      name.includes("huihui") ||
      name.includes("yun")
    )
  }

  const isMaleVoice = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase()
    return name.includes("male") || name.includes("man") || name.includes("男") || name.includes("kangkang")
  }

  if (gender === "female") {
    const femaleVoice = mandarinVoices.find(isFemaleVoice) || voices.find(isFemaleVoice)
    if (femaleVoice) return femaleVoice
  } else if (gender === "male") {
    const maleVoice = mandarinVoices.find(isMaleVoice) || voices.find(isMaleVoice)
    if (maleVoice) return maleVoice
  }

  // 返回第一个普通话或中文语音
  return mandarinVoices[0] || voices[0] || null
}

// 初始化语音列表（在页面加载时调用）
export function initVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve()
      return
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      cachedVoices = voices
      voicesLoaded = true
      resolve()
      return
    }

    // 某些浏览器需要监听 voiceschanged 事件
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices()
      voicesLoaded = true
      resolve()
    }

    // 超时保护
    setTimeout(resolve, 1000)
  })
}

// 播放文本
export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      options.onEnd?.()
      resolve()
      return
    }

    // 取消当前播放
    window.speechSynthesis.cancel()

    const { rate = 0.85, pitch = 1.15, volume = 1, gender = "female", onStart, onEnd } = options

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "zh-CN"
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // 选择最佳语音
    const voice = selectBestVoice(gender)
    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => {
      onStart?.()
    }

    utterance.onend = () => {
      onEnd?.()
      resolve()
    }

    utterance.onerror = () => {
      onEnd?.()
      resolve()
    }

    window.speechSynthesis.speak(utterance)
  })
}

// 播放词语（带自然停顿）
export function speakWord(word: string, options: SpeakOptions = {}): Promise<void> {
  // 对于多字词语，在字与字之间添加微小停顿让发音更清晰
  // 使用 SSML 不被所有浏览器支持，所以用空格代替
  const processedText = word.length > 1 ? word.split("").join(" ") : word
  return speak(processedText, {
    rate: 0.8, // 词语播报稍慢
    pitch: 1.1,
    ...options,
  })
}

// 播放例句
export function speakSentence(sentence: string, options: SpeakOptions = {}): Promise<void> {
  return speak(sentence, {
    rate: 0.9, // 句子语速稍快
    pitch: 1.05,
    ...options,
  })
}

// 停止播放
export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

// 检查是否正在播放
export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return false
  }
  return window.speechSynthesis.speaking
}
