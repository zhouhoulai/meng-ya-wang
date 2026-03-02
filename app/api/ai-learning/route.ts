import { generateText, streamText } from 'ai'

export async function POST(req: Request) {
  const { action, word, pinyin, example } = await req.json()

  if (action === 'generateSentence') {
    // 生成例句
    try {
      const { text } = await generateText({
        model: 'openai/gpt-4-mini',
        system: `你是一位中文教师。用户会提供一个词语和拼音，请为这个词语生成3个不同的、贴近日常生活的例句。
格式：每行一个例句，不需要编号或其他说明。例句应该简单易懂，适合学习者理解。`,
        prompt: `词语：${word}
拼音：${pinyin}
原例句：${example}

请生成3个新的例句：`,
        maxTokens: 200,
      })

      return Response.json({ success: true, sentences: text.split('\n').filter((s: string) => s.trim()) })
    } catch (error) {
      console.error('Generate sentence error:', error)
      return Response.json({ success: false, error: 'Failed to generate sentences' }, { status: 500 })
    }
  }

  if (action === 'generateLearningTips') {
    // 生成学习技巧
    try {
      const { text } = await generateText({
        model: 'openai/gpt-4-mini',
        system: `你是一位中文学习专家。用户会提供一个词语、拼音和例句，请为学习者提供2-3条简洁的学习建议。
这些建议应该帮助学习者更好地记忆和理解这个词语。
格式：每条建议一行，简洁有效，不超过20个字。`,
        prompt: `词语：${word}
拼音：${pinyin}
例句：${example}

请为这个词语提供学习建议：`,
        maxTokens: 150,
      })

      return Response.json({
        success: true,
        tips: text.split('\n').filter((t: string) => t.trim()),
      })
    } catch (error) {
      console.error('Generate tips error:', error)
      return Response.json({ success: false, error: 'Failed to generate tips' }, { status: 500 })
    }
  }

  if (action === 'generatePronunciationGuide') {
    // 生成发音指导
    try {
      const { text } = await generateText({
        model: 'openai/gpt-4-mini',
        system: `你是一位普通话教学专家。用户会提供一个词语的拼音，请为学习者提供1-2条简洁的发音指导。
包括声调提示、发音要点等。格式简洁，不超过15个字/条。`,
        prompt: `词语：${word}
拼音：${pinyin}

请提供发音指导：`,
        maxTokens: 100,
      })

      return Response.json({
        success: true,
        guide: text.trim(),
      })
    } catch (error) {
      console.error('Generate pronunciation guide error:', error)
      return Response.json(
        { success: false, error: 'Failed to generate pronunciation guide' },
        { status: 500 }
      )
    }
  }

  return Response.json({ success: false, error: 'Unknown action' }, { status: 400 })
}
