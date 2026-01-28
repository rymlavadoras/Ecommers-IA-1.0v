// ============================================
// OPENAI - CÓDIGO COMENTADO (REEMPLAZADO POR GEMINI)
// ============================================
/*
import OpenAI from 'openai'

// Verificar si hay API key configurada y válida
const hasValidApiKey = process.env.OPENAI_API_KEY && 
  process.env.OPENAI_API_KEY.startsWith('sk-') &&
  process.env.OPENAI_API_KEY.length > 20 &&
  !process.env.OPENAI_API_KEY.includes('test') &&
  !process.env.OPENAI_API_KEY.includes('****')

const openai = hasValidApiKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Respuestas automáticas inteligentes cuando no hay API key
export function getAutoResponse(userMessage: string, context?: any): string {
  // ... código comentado
}

export async function getChatCompletion(
  messages: ChatMessage[],
  context?: any
): Promise<string> {
  try {
    if (!openai) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      return getAutoResponse(lastUserMessage?.content || '', context)
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Eres un vendedor virtual...`,
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    })

    return completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.'
  } catch (error: any) {
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.error('❌ OpenAI: Quota agotada o API key inválida')
    } else {
      console.error('Error en OpenAI:', error.message)
    }
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    return getAutoResponse(lastUserMessage?.content || '', context)
  }
}
*/

// Re-exportar desde Gemini (implementación activa)
export type { ChatMessage } from './gemini'
export { getChatCompletion, getAutoResponse } from './gemini'
