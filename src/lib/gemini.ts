import { GoogleGenerativeAI } from '@google/generative-ai'

// Verificar si hay API key configurada y válida
const geminiApiKey = process.env.GEMINI_API_KEY
const hasValidApiKey = geminiApiKey && 
  geminiApiKey.startsWith('AIza') &&
  geminiApiKey.length > 20

// Debug: verificar si la API key está presente (comentado)
// if (geminiApiKey) {
//   console.log(`✅ GEMINI_API_KEY encontrada: ${geminiApiKey.substring(0, 10)}... (longitud: ${geminiApiKey.length})`)
//   if (!hasValidApiKey) {
//     console.warn(`⚠️ GEMINI_API_KEY no válida: debe empezar con "AIza" y tener más de 20 caracteres`)
//   }
// } else {
//   console.warn(`⚠️ GEMINI_API_KEY no encontrada en variables de entorno`)
// }

const genAI = hasValidApiKey ? new GoogleGenerativeAI(geminiApiKey!) : null

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Respuestas automáticas inteligentes cuando no hay API key (fallback)
export function getAutoResponse(userMessage: string, context?: any): string {
  const msg = userMessage.toLowerCase()
  
  // Si hay un producto específico seleccionado, dar detalles completos
  if (context?.selectedProduct) {
    const p = context.selectedProduct
    return `¡Perfecto! Te cuento sobre el **${p.name}**:\n\n💰 **Precio**: S/ ${p.price.toFixed(2)}${p.comparePrice ? ` (antes S/ ${p.comparePrice.toFixed(2)} - ¡${Math.round((p.comparePrice - p.price) / p.comparePrice * 100)}% de descuento!)` : ''}\n\n📝 **Descripción**: ${p.description}\n\n${p.brand ? `🏷️ **Marca**: ${p.brand}\n` : ''}${p.warranty ? `✅ **Garantía**: ${p.warranty}\n` : ''}${p.sizes && p.sizes.length > 0 ? `👕 **Tallas disponibles**: ${p.sizes.join(', ')}\n` : ''}${p.colors && p.colors.length > 0 ? `🎨 **Colores**: ${p.colors.join(', ')}\n` : ''}\n📦 **Stock**: ${p.stock > 10 ? 'Disponible' : p.stock > 0 ? `¡Solo quedan ${p.stock}!` : 'Agotado'}\n\n¿Quieres que lo agregue a tu carrito? También puedes verlo en detalle aquí: /producto/${p.sku} 🛒`
  }
  
  // Si hay productos en el contexto, incluirlos en la respuesta
  if (context?.products && !context?.noProductsFound) {
    // Si el contexto tiene productos encontrados, mostrarlos siempre
    if (msg.includes('telefono') || msg.includes('celular') || msg.includes('smartphone')) {
      return `¡Claro! Tenemos estos smartphones disponibles:\n\n${context.products}\n\n💡 Tip: Dime cuál te interesa (ej: "quiero el Samsung S24" o "el iPhone 15") y te doy todos los detalles. 📱`
    }
    if (msg.includes('laptop') || msg.includes('computadora')) {
      return `Perfecto, mira nuestras laptops disponibles:\n\n${context.products}\n\n💡 Tip: Dime cuál te gusta (ej: "quiero la MacBook Air" o "la HP Pavilion") para darte más info. 💻`
    }
    // Si hay productos en contexto, mostrarlos siempre
    return `¡Sí! Encontré estos productos:\n\n${context.products}\n\n💡 Tip: Dime cuál te interesa específicamente para darte detalles completos y agregarlo a tu carrito. 😊`
  }
  
  // Si no hay productos encontrados, dar respuesta útil
  if (context?.noProductsFound) {
    const searchTerms = context.searchTerms || 'esa búsqueda'
    return `Lo siento, no encontré productos específicos para "${searchTerms}". 😔\n\n¿Podrías ser más específico? Por ejemplo:\n• "Quiero un celular Samsung"\n• "Tienes polos Nike"\n• "Busco laptops HP"\n\nTambién puedes explorar nuestras categorías:\n• 👕 Ropa (polos, jeans, zapatillas)\n• 💻 Electrónica (celulares, laptops, accesorios)\n• 🍔 Alimentos (productos orgánicos, gourmet)\n• 📦 Otros productos\n\n¿Qué te interesa? 😊`
  }
  
  // Si no hay productos pero pregunta por algo específico, dar respuesta útil
  if (msg.includes('carpa') || msg.includes('carpas') || msg.includes('camping') || msg.includes('toldo') || msg.includes('tienda')) {
    return 'Lo siento, no encontré productos de carpas o camping en este momento. ¿Te interesa ver otros productos? Tenemos ropa, electrónica, alimentos y más. 🏕️'
  }
  
  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return '¡Hola! 👋 Soy tu asistente virtual. Puedo ayudarte a:\n\n✅ Encontrar productos específicos\n✅ Ver precios y ofertas\n✅ Recomendar productos\n✅ Responder tus preguntas\n\n¿Qué estás buscando hoy?'
  }
  
  if (msg.includes('precio') || msg.includes('cuánto') || msg.includes('cuesta')) {
    return '¡Te puedo ayudar con los precios! ¿Qué producto te interesa? Por ejemplo:\n• Smartphones\n• Laptops\n• Ropa deportiva\n• Alimentos\n\n¿Cuál te gustaría ver? 💰'
  }
  
  if (msg.includes('ropa') || msg.includes('polo') || msg.includes('jean') || msg.includes('zapatillas')) {
    return '¡Genial! En ropa tengo varias opciones. ¿Buscas algo específico como:\n• Polos deportivos\n• Jeans\n• Zapatillas\n• Casacas\n\n¿Cuál te interesa? 👕'
  }
  
  if (msg.includes('electr') || msg.includes('laptop') || msg.includes('celular') || msg.includes('audifono')) {
    return '¡Perfecto! ¿Qué tipo de producto electrónico buscas?\n• Smartphones\n• Laptops\n• Audífonos\n• Smartwatches\n\nDime cuál y te muestro las opciones disponibles. 💻📱'
  }
  
  if (msg.includes('alimento') || msg.includes('comida') || msg.includes('arroz') || msg.includes('aceite')) {
    return 'En alimentos tenemos productos de calidad. ¿Qué necesitas?\n• Arroz\n• Aceite\n• Leche\n• Café\n• Atún\n\n¿Cuál te interesa? 🍚'
  }
  
  if (msg.includes('carrito') || msg.includes('comprar') || msg.includes('pagar')) {
    return '¡Listo para comprar! 🛒\n\n1️⃣ Agrega productos al carrito\n2️⃣ Revisa tu carrito (ícono arriba)\n3️⃣ Procede al checkout\n4️⃣ Completa tus datos\n5️⃣ ¡Confirma tu pedido!\n\nAceptamos Yape, tarjetas y efectivo. ¿Necesitas ayuda con algo específico?'
  }
  
  if (msg.includes('envio') || msg.includes('delivery') || msg.includes('entrega')) {
    return '📦 Información de envío:\n\n✅ Envío GRATIS en compras > S/ 100\n✅ Envío S/ 15 en compras menores\n✅ Entrega en Lima: 1-2 días\n✅ Entrega provincias: 3-5 días\n\n¿A qué zona necesitas el envío?'
  }
  
  if (msg.includes('ayuda') || msg.includes('duda')) {
    return '¡Claro que puedo ayudarte! 😊\n\nDime específicamente:\n• ¿Qué producto buscas?\n• ¿Tienes dudas sobre precios?\n• ¿Necesitas info de envío?\n• ¿Quieres ver ofertas?\n\n¿En qué te ayudo?'
  }
  
  return 'Interesante pregunta. Para ayudarte mejor, ¿podrías decirme exactamente qué producto o información necesitas? Por ejemplo:\n\n"Quiero un celular Samsung"\n"¿Cuánto cuesta el polo Nike?"\n"¿Tienen arroz Costeño?"\n\n¡Así te doy la info exacta que necesitas! 😊'
}

export async function getChatCompletion(
  messages: ChatMessage[],
  context?: any
): Promise<string> {
  try {
    // Si no hay API key válida, usar respuestas automáticas
    if (!genAI) {
      // Debug comentado
      // const currentApiKey = process.env.GEMINI_API_KEY
      // if (!currentApiKey) {
      //   console.warn('⚠️ GEMINI_API_KEY no encontrada en .env - usando modo fallback')
      //   console.warn('💡 Agrega GEMINI_API_KEY="tu-api-key" en tu archivo .env')
      // } else if (!currentApiKey.startsWith('AIza')) {
      //   console.warn(`⚠️ GEMINI_API_KEY inválida: debe empezar con "AIza"`)
      //   console.warn(`💡 Actual: "${currentApiKey.substring(0, 10)}..." (debe empezar con "AIza")`)
      // } else if (currentApiKey.length <= 20) {
      //   console.warn(`⚠️ GEMINI_API_KEY muy corta: debe tener más de 20 caracteres`)
      //   console.warn(`💡 Actual: ${currentApiKey.length} caracteres (necesita más de 20)`)
      // } else {
      //   console.warn('⚠️ Gemini no inicializado correctamente - usando modo fallback')
      // }
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      return getAutoResponse(lastUserMessage?.content || '', context)
    }

    // Obtener el modelo Gemini (usar gemini-2.5-flash: gratuito, eficiente e ideal para búsqueda de productos)
    // Modelos disponibles según documentación: gemini-3-flash, gemini-3-pro, gemini-2.5-flash, gemini-2.5-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Construir el prompt del sistema y mensajes
    const systemPrompt = `Eres un vendedor virtual experto y carismático de un e-commerce peruano de productos de calidad.

TU MISIÓN:
- Ayudar a encontrar el producto perfecto para cada cliente
- Ser persuasivo pero genuino, como un amigo que recomienda
- Conocer TODO el catálogo de memoria (40 productos aprox.)
- Impulsar ventas destacando ofertas, descuentos y urgencia (poco stock)

CATEGORÍAS:
- 👕 ROPA: Nike, Adidas, Puma, New Balance (polos, jeans, zapatillas, casacas)
- 💻 ELECTRÓNICA: Laptops HP/Mac, iPhone, Samsung, PS5, monitores, periféricos
- 🍔 ALIMENTOS: Quinua orgánica, aceites, café premium, pisco, chocolates
- 📦 OTROS: Mochilas, yoga, camping, belleza, hogar

ESTILO DE COMUNICACIÓN:
- Tutea al cliente (habla peruano natural: "chévere", "bacán", "súper")
- Sé entusiasta y muestra emoción con los productos
- Usa emojis ocasionalmente (📱💰✨🎉)
- Haz preguntas para entender mejor qué necesita
- Crea urgencia: "¡Solo quedan X!", "Oferta limitada", "Ahorra X%"

ESTRATEGIA SIMPLE:
1. Si el cliente saluda → Responde amablemente y ofrece ayuda
2. Si pregunta por productos → Muestra los productos encontrados en la base de datos
3. Si no hay productos exactos → Sugiere que exploren categorías relacionadas
4. Menciona precios y características de los productos encontrados
5. IMPORTANTE: Los botones para agregar al carrito aparecen automáticamente, no digas que los agregas tú

INFORMACIÓN CLAVE:
- Envío GRATIS > S/ 100, sino S/ 15
- Pagos: Yape, Plin, Visa, Mastercard
- Entrega Lima: 1-2 días | Provincias: 3-5 días
- Garantía en electrónica: 12-24 meses

${context?.products ? `\n\n📦 PRODUCTOS ENCONTRADOS EN LA BASE DE DATOS:\n${context.products}\n\n⚠️ REGLA CRÍTICA: SI HAY PRODUCTOS LISTADOS ARRIBA, DEBES MOSTRARLOS AL CLIENTE. NO DIGAS QUE NO HAY PRODUCTOS SI HAY PRODUCTOS LISTADOS. Los productos listados son la respuesta correcta a la consulta del cliente.` : context?.noProductsFound ? `\n\n⚠️ No se encontraron productos en la base de datos para esta consulta.\n\nSolo en este caso puedes decir que no hay productos y sugerir alternativas.` : ''}

REGLAS ABSOLUTAS:
1. Si hay productos listados arriba → MUÉSTRALOS al cliente, menciona nombres, precios y características
2. Si NO hay productos listados → Solo entonces puedes decir que no hay y sugerir alternativas
3. NUNCA digas que no hay productos si hay productos listados en el contexto
4. Responde de forma natural y amigable, pero SIEMPRE basado en los productos encontrados`

    // Construir el historial de conversación para Gemini
    // Gemini usa formato: { role: 'user'|'model', parts: [{ text: string }] }
    const chatHistory: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }> = []
    
    // Agregar mensajes previos de la conversación (excepto system y el último)
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')
    
    // Construir historial alternando user y model
    const maxLength = Math.max(userMessages.length, assistantMessages.length)
    for (let i = 0; i < maxLength - 1; i++) { // -1 para excluir el último mensaje
      if (userMessages[i]) {
        chatHistory.push({
          role: 'user',
          parts: [{ text: userMessages[i].content }]
        })
      }
      if (assistantMessages[i]) {
        chatHistory.push({
          role: 'model',
          parts: [{ text: assistantMessages[i].content }]
        })
      }
    }

    // Obtener el último mensaje del usuario
    const lastUserMessage = userMessages[userMessages.length - 1]
    if (!lastUserMessage) {
      return getAutoResponse('', context)
    }

    // SOLUCIÓN: No usar systemInstruction, incluir el prompt como primer mensaje del historial
    // Agregar el prompt del sistema como primer mensaje del historial
    const fullHistory = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model' as const,
        parts: [{ text: 'Entendido, estoy listo para ayudarte a encontrar productos.' }]
      },
      ...chatHistory
    ]

    // Iniciar chat sin systemInstruction
    const chat = model.startChat({
      history: fullHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    })

    // Enviar el último mensaje del usuario y obtener respuesta
    const result = await chat.sendMessage(lastUserMessage.content)
    const response = await result.response
    const text = response.text()

    return text || 'Lo siento, no pude procesar tu mensaje.'
  } catch (error: any) {
    console.error('Error en Gemini:', error.message)
    // Fallback a respuestas automáticas si falla la API
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    return getAutoResponse(lastUserMessage?.content || '', context)
  }
}

