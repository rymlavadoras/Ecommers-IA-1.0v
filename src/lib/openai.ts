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
function getAutoResponse(userMessage: string, context?: any): string {
  const msg = userMessage.toLowerCase()
  
  // Si hay un producto específico seleccionado, dar detalles completos
  if (context?.selectedProduct) {
    const p = context.selectedProduct
    return `¡Perfecto! Te cuento sobre el **${p.name}**:\n\n💰 **Precio**: S/ ${p.price.toFixed(2)}${p.comparePrice ? ` (antes S/ ${p.comparePrice.toFixed(2)} - ¡${Math.round((p.comparePrice - p.price) / p.comparePrice * 100)}% de descuento!)` : ''}\n\n📝 **Descripción**: ${p.description}\n\n${p.brand ? `🏷️ **Marca**: ${p.brand}\n` : ''}${p.warranty ? `✅ **Garantía**: ${p.warranty}\n` : ''}${p.sizes && p.sizes.length > 0 ? `👕 **Tallas disponibles**: ${p.sizes.join(', ')}\n` : ''}${p.colors && p.colors.length > 0 ? `🎨 **Colores**: ${p.colors.join(', ')}\n` : ''}\n📦 **Stock**: ${p.stock > 10 ? 'Disponible' : p.stock > 0 ? `¡Solo quedan ${p.stock}!` : 'Agotado'}\n\n¿Quieres que lo agregue a tu carrito? También puedes verlo en detalle aquí: /producto/${p.sku} 🛒`
  }
  
  // Si hay productos en el contexto, incluirlos en la respuesta
  if (context?.products) {
    if (msg.includes('telefono') || msg.includes('celular') || msg.includes('smartphone')) {
      return `¡Claro! Tenemos estos smartphones disponibles:\n\n${context.products}\n\n💡 **Tip**: Dime cuál te interesa (ej: "quiero el Samsung S24" o "el iPhone 15") y te doy todos los detalles. 📱`
    }
    if (msg.includes('laptop') || msg.includes('computadora')) {
      return `Perfecto, mira nuestras laptops disponibles:\n\n${context.products}\n\n💡 **Tip**: Dime cuál te gusta (ej: "quiero la MacBook Air" o "la HP Pavilion") para darte más info. 💻`
    }
    return `Aquí están los productos que tenemos:\n\n${context.products}\n\n💡 **Tip**: Dime cuál te interesa específicamente para darte detalles completos y agregarlo a tu carrito. 😊`
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
    if (!openai) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      return getAutoResponse(lastUserMessage?.content || '', context)
    }

    // Sistema de instrucciones para el agente IA vendedor
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Eres un vendedor virtual experto y carismático de un e-commerce peruano de productos de calidad.

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

ESTRATEGIA DE VENTA:
1. Si preguntan por categoría → Muestra top 3-4 productos
2. Si preguntan por marca/modelo específico → Da detalles completos + alternativas
3. Siempre menciona:
   - Precio ACTUAL (y precio antes si hay descuento)
   - % de descuento si aplica
   - Stock limitado si es bajo
   - Características destacadas
4. IMPORTANTE: Debajo de tu mensaje aparecerán BOTONES automáticos para agregar productos al carrito. NO digas "te lo agrego al carrito" porque NO puedes hacerlo directamente. En su lugar di: "Usa los botones de abajo para agregarlo al carrito" o "Haz clic en el botón del producto que te interesa"
5. Cierra con pregunta: "¿Cuál te interesa?" o "¿Quieres ver más opciones?"

INFORMACIÓN CLAVE:
- Envío GRATIS > S/ 100, sino S/ 15
- Pagos: Yape, Plin, Visa, Mastercard
- Entrega Lima: 1-2 días | Provincias: 3-5 días
- Garantía en electrónica: 12-24 meses

${context?.products ? `\n\n📦 PRODUCTOS RELEVANTES PARA ESTA CONSULTA:\n${context.products}` : ''}

IMPORTANTE: Si te pasaron productos en el contexto, úsalos para responder. Si no hay productos pero preguntan por algo, sugiere que busquen en la tienda o pidan más detalles.`,
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo gratuito y potente
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    })

    return completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.'
  } catch (error) {
    console.error('Error en OpenAI:', error)
    // Fallback a respuestas automáticas si falla la API
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    return getAutoResponse(lastUserMessage?.content || '', context)
  }
}

