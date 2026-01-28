import { NextRequest, NextResponse } from 'next/server'
// import { getChatCompletion, ChatMessage } from '@/lib/openai' // OPENAI COMENTADO
import { getChatCompletion, ChatMessage } from '@/lib/gemini' // GEMINI ACTIVO
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, userId, context } = await request.json()

    // Obtener información adicional de contexto
    let enrichedContext = context || {}

    // Obtener el último mensaje del usuario para búsqueda inteligente
    const lastUserMessage = Array.isArray(messages) 
      ? messages.filter((m: any) => m.role === 'user').pop()?.content || ''
      : ''
    const msg = lastUserMessage.toLowerCase()

    // Buscar productos relevantes basados en la consulta
    let searchResults = ''
    let products: any[] = []
    
    // Detectar si está buscando productos
    const isProductQuery = msg.length > 2
    
    if (isProductQuery) {
      // USAR GEMINI para extraer SOLO palabras clave de productos (sustantivos relevantes)
      // Esto es inteligente: la IA entiende qué producto busca el usuario
      let finalSearchTerms: string[] = []
      
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const geminiApiKey = process.env.GEMINI_API_KEY
        
        if (geminiApiKey && geminiApiKey.startsWith('AIza') && geminiApiKey.length > 20) {
          const genAIInstance = new GoogleGenerativeAI(geminiApiKey)
          const model = genAIInstance.getGenerativeModel({ model: 'gemini-2.5-flash' })
          
          // Pedirle a Gemini que extraiga solo sustantivos de productos
          const extractionPrompt = `Extrae SOLO las palabras clave de productos/sustantivos del mensaje. Ignora verbos, artículos, preposiciones.

Mensaje: "${lastUserMessage}"

Ejemplos:
- "quiero un balon o pelota" → balon, pelota
- "tienes cafe?" → cafe  
- "ire a jugar, tienes algun balon?" → balon
- "algo de aceite" → aceite

Responde SOLO con palabras clave separadas por comas, sin explicaciones:`
          
          const result = await model.generateContent(extractionPrompt)
          const response = await result.response
          const extractedText = response.text().trim()
          
          // Extraer palabras clave de la respuesta
          finalSearchTerms = extractedText
            .split(/[,\n]/)
            .map((w: string) => w.trim().toLowerCase().replace(/[.,!?¿¡]/g, ''))
            .filter((w: string) => w.length >= 3)
          
          // console.log('🤖 Gemini extrajo palabras clave:', finalSearchTerms) // Debug comentado
        }
      } catch (geminiError: any) {
        // console.warn('⚠️ Error usando Gemini para extraer palabras:', geminiError.message) // Debug comentado
      }
      
      // Fallback: si Gemini no funcionó o no extrajo nada, usar búsqueda simple
      if (finalSearchTerms.length === 0) {
        const allWords = msg.split(/\s+/)
          .map((w: string) => w.toLowerCase().replace(/[.,!?¿¡]/g, ''))
          .filter((w: string) => w.length >= 4)
        
        const wordsToFilter = ['quiero', 'tienes', 'tiene', 'hay', 'algo', 'algun', 'tambien', 'ire', 'jugar', 'beber', 'comer', 'llevar', 'casualidad']
        finalSearchTerms = allWords.filter((w: string) => !wordsToFilter.includes(w))
      }
      
      // console.log('🔍 Términos finales de búsqueda:', finalSearchTerms) // Debug comentado
      
      // Construir consulta de búsqueda: buscar solo palabras relevantes
      const where: any = { active: true }
      
      // Si hay palabras relevantes, buscar en TODOS los campos con OR
      if (finalSearchTerms.length > 0) {
        const searchConditions: any[] = []
        
        // Para cada palabra relevante, buscar en todos los campos
        finalSearchTerms.forEach((word: string) => {
          searchConditions.push(
            { name: { contains: word, mode: 'insensitive' } },
            { description: { contains: word, mode: 'insensitive' } },
            { brand: { contains: word, mode: 'insensitive' } },
            { sku: { contains: word, mode: 'insensitive' } }
          )
        })
        
        // Usar OR: encuentra productos que coincidan con CUALQUIERA de las condiciones
        if (searchConditions.length > 0) {
          where.OR = searchConditions
        }
      }

      // Buscar productos con búsqueda flexible
      try {
        await prisma.$connect()
        
        products = await prisma.product.findMany({
          where,
          take: 8,
          orderBy: [
            { featured: 'desc' },
            { stock: 'desc' }
          ],
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            comparePrice: true,
            brand: true,
            category: true,
            stock: true,
            sku: true,
            sizes: true,
            colors: true,
            images: true,
          },
        })
        
        // LOG para debug (comentado)
        // console.log('📦 Productos encontrados:', products.length, products.map(p => p.name))
        // console.log('🔑 Términos de búsqueda usados:', finalSearchTerms)
      } catch (dbError: any) {
        console.error('Error buscando productos:', dbError.message)
        
        // Cerrar conexión si está abierta
        try {
          await prisma.$disconnect()
        } catch (e) {
          // Ignorar errores al desconectar
        }
        
        // Si falla la BD, lanzar el error para que se maneje arriba
        const errorMsg = dbError.message || 'Error desconocido'
        const errorCode = dbError.code || 'UNKNOWN'
        throw new Error(`Error de conexión a la base de datos (${errorCode}): ${errorMsg}`)
      }

      // NO hacer búsqueda fallback si no hay resultados específicos
      // Es mejor mostrar un mensaje útil que productos aleatorios
      if (products.length === 0) {
        // products se queda vacío, el mensaje se manejará después
      }

      if (products.length > 0) {
        searchResults = `\n\nPRODUCTOS ENCONTRADOS (${products.length}):\n${products.map((p, i) => 
          `${i + 1}. ${p.name}${p.brand ? ` (${p.brand})` : ''} - S/ ${p.price.toFixed(2)}${p.comparePrice ? ` (antes S/ ${p.comparePrice.toFixed(2)} - ¡${Math.round((p.comparePrice - p.price) / p.comparePrice * 100)}% OFF!)` : ''}\n   ${p.description ? p.description.substring(0, 100) + '...' : 'Sin descripción'}${p.stock < 10 ? `\n   ⚠️ Solo ${p.stock} unidades disponibles` : ''}`
        ).join('\n\n')}`
        
        enrichedContext.products = searchResults
        enrichedContext.productsData = products // Pasar productos completos al contexto
        enrichedContext.noProductsFound = false // Hay productos encontrados
      } else {
        // Si no hay productos, indicar que no se encontraron resultados específicos
        const searchTermsDisplay = finalSearchTerms.length > 0 ? finalSearchTerms.join(', ') : msg
        searchResults = `\n\n📦 No encontré productos específicos para "${searchTermsDisplay}".`
        enrichedContext.products = searchResults
        enrichedContext.noProductsFound = true
        enrichedContext.searchTerms = searchTermsDisplay
      }
    }

    // Si hay userId, obtener su carrito actual
    if (userId) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      })
      enrichedContext.cart = cartItems
    }

    // Detectar si el usuario está pidiendo detalles de un producto específico
    let specificProduct = null
    if (products.length > 0) {
      // Buscar si menciona algún producto específico de los listados
      for (const product of products) {
        const productNameLower = product.name.toLowerCase()
        if (msg.includes(productNameLower.substring(0, 10)) || 
            (product.brand && msg.includes(product.brand.toLowerCase()))) {
          specificProduct = product
          break
        }
        // Buscar por palabras clave del modelo
        if (msg.includes('s24') && productNameLower.includes('s24')) {
          specificProduct = product
          break
        }
        if (msg.includes('iphone 15') && productNameLower.includes('iphone 15')) {
          specificProduct = product
          break
        }
      }

      // Si encontramos el producto específico, dar detalles
      if (specificProduct) {
        // Buscar el producto completo con todas las especificaciones
        const fullProduct = await prisma.product.findUnique({
          where: { sku: specificProduct.sku },
        })

        if (fullProduct) {
          enrichedContext.selectedProduct = {
            name: fullProduct.name,
            price: fullProduct.price,
            comparePrice: fullProduct.comparePrice,
            description: fullProduct.description,
            brand: fullProduct.brand,
            stock: fullProduct.stock,
            sku: fullProduct.sku,
            sizes: fullProduct.sizes,
            colors: fullProduct.colors,
            warranty: fullProduct.warranty,
          }
          enrichedContext.showProductDetails = true
        }
      }
    }

    // Obtener respuesta del AI
    let response: string
    try {
      response = await getChatCompletion(messages as ChatMessage[], enrichedContext)
    } catch (aiError: any) {
      console.error('Error en OpenAI:', aiError.message)
      // Si falla la IA, dar respuesta útil basada en los productos encontrados
      if (products.length > 0) {
        response = `Aquí están los productos que encontré:\n\n${products.map((p, i) => 
          `${i + 1}. ${p.name}${p.brand ? ` (${p.brand})` : ''} - S/ ${p.price.toFixed(2)}`
        ).join('\n')}\n\n¿Te interesa alguno de estos productos?`
      } else {
        // Usar getAutoResponse como fallback
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || ''
        const openaiModule = await import('@/lib/openai')
        response = openaiModule.getAutoResponse(lastUserMessage, enrichedContext)
      }
    }

    // Guardar conversación en la base de datos (opcional)
    try {
      await prisma.aIConversation.create({
        data: {
          sessionId,
          userId: userId || null,
          messages: messages,
          context: enrichedContext,
        },
      })
    } catch (dbError) {
      // Ignorar errores de DB en chat, no crítico
    }

    return NextResponse.json({ 
      message: response,
      products: products.length > 0 ? products : null, // Para referencia de texto
      productsData: products.length > 0 ? products : [], // Datos completos para botones
      selectedProduct: specificProduct || null,
    })
  } catch (error: any) {
    console.error('Error en chat API:', error.message)
    
    // Si es un error de BD, dar mensaje más específico
    if (error.message?.includes('conexión a la base de datos') || error.message?.includes('database') || error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Error de conexión a la base de datos', 
          details: error.message,
          suggestion: 'Verifica que la base de datos esté configurada correctamente en las variables de entorno.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el mensaje', 
        details: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

