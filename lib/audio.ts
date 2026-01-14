// 倒计时音效生成器 - 使用 Web Audio API

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )()
  }
  return audioContext
}

// 播放倒计时滴答声
export function playCountdownTick(isLast = false): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 最后一声用不同的音调（更高更长）
    if (isLast) {
      oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5 音符
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } else {
      oscillator.frequency.setValueAtTime(660, ctx.currentTime) // E5 音符
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.15)
    }
  } catch {
    // 忽略音频播放错误
  }
}

// 播放开始音效（三个上升音符）
export function playStartSound(): void {
  try {
    const ctx = getAudioContext()
    const notes = [523, 659, 784] // C5, E5, G5 - 上升音阶

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.2)

      oscillator.start(ctx.currentTime + i * 0.12)
      oscillator.stop(ctx.currentTime + i * 0.12 + 0.2)
    })
  } catch {
    // 忽略音频播放错误
  }
}
