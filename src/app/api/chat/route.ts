import { NextRequest, NextResponse } from 'next/server'
import { getChatCompletion, ChatMessage } from '@/lib/openai'
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
    
    // Detectar si está pidiendo información o buscando productos
    const askingForProducts = 
      msg.includes('telefono') || msg.includes('celular') || msg.includes('smartphone') || msg.includes('iphone') || msg.includes('samsung') ||
      msg.includes('laptop') || msg.includes('computadora') || msg.includes('mac') ||
      msg.includes('polo') || msg.includes('jean') || msg.includes('zapatilla') || msg.includes('ropa') || msg.includes('nike') || msg.includes('adidas') ||
      msg.includes('alimento') || msg.includes('comida') || msg.includes('arroz') || msg.includes('aceite') || msg.includes('cafe') || msg.includes('quinua') ||
      msg.includes('producto') || msg.includes('tienes') || msg.includes('venden') || msg.includes('hay') ||
      msg.includes('precio') || msg.includes('cuánto') || msg.includes('cuesta') || msg.includes('cuanto') ||
      msg.includes('mostrar') || msg.includes('ver') || msg.includes('busco') || msg.includes('quiero') || msg.includes('necesito') ||
      msg.includes('oferta') || msg.includes('descuento') || msg.includes('barato')

    if (askingForProducts) {
      // Extraer palabras clave para búsqueda flexible
      const keywords = msg.split(' ').filter((w: string) => w.length > 3)
      
      // Determinar categoría
      let category = ''
      if (msg.match(/(telefono|celular|smartphone|laptop|computadora|electr|iphone|samsung|mac|airpods|ps5|xbox|teclado|mouse|monitor)/i)) {
        category = 'ELECTRONICA'
      } else if (msg.match(/(polo|jean|zapatilla|ropa|casaca|nike|adidas|puma|short|buzo|medias|pantalon)/i)) {
        category = 'ROPA'
      } else if (msg.match(/(alimento|comida|arroz|aceite|leche|cafe|quinua|miel|pasta|sal|pisco|chocolate)/i)) {
        category = 'ALIMENTOS'
      } else if (msg.match(/(mochila|botella|yoga|perfume|lentes|balon|carpa|sabanas)/i)) {
        category = 'OTROS'
      }

      // Construir consulta dinámica
      const where: any = { active: true }
      
      if (category) {
        where.category = category
      }

      // Búsqueda inteligente por texto en nombre o descripción
      const searchTerms = [
        ...keywords,
        msg.includes('samsung') && 'samsung',
        msg.includes('iphone') && 'iphone',
        msg.includes('apple') && 'apple',
        msg.includes('nike') && 'nike',
        msg.includes('adidas') && 'adidas',
        msg.includes('mac') && 'macbook',
      ].filter(Boolean)

      if (searchTerms.length > 0) {
        where.OR = searchTerms.flatMap(term => [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
        ])
      }

      products = await prisma.product.findMany({
        where,
        take: 6,
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
          images: true, // Para los botones del chat
        },
      })

      // Si no encontró nada, buscar en TODO el catálogo
      if (products.length === 0 && !category) {
        products = await prisma.product.findMany({
          where: { active: true },
          take: 5,
          orderBy: { featured: 'desc' },
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
            images: true, // Para los botones del chat
          },
        })
      }

      if (products.length > 0) {
        searchResults = `\n\nPRODUCTOS ENCONTRADOS (${products.length}):\n${products.map((p, i) => 
          `${i + 1}. ${p.name}${p.brand ? ` (${p.brand})` : ''} - S/ ${p.price.toFixed(2)}${p.comparePrice ? ` (antes S/ ${p.comparePrice.toFixed(2)} - ¡${Math.round((p.comparePrice - p.price) / p.comparePrice * 100)}% OFF!)` : ''}\n   ${p.description.substring(0, 100)}...${p.stock < 10 ? `\n   ⚠️ Solo ${p.stock} unidades disponibles` : ''}`
        ).join('\n\n')}`
        
        enrichedContext.products = searchResults
        enrichedContext.productsData = products // Pasar productos completos al contexto
      } else {
        searchResults = '\n\n📦 No encontré productos específicos para esa búsqueda. ¿Podrías ser más específico? Tenemos ropa, electrónica, alimentos y más.'
        enrichedContext.products = searchResults
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
    const response = await getChatCompletion(messages as ChatMessage[], enrichedContext)

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
      console.log('No se pudo guardar conversación (no crítico):', dbError)
    }

    return NextResponse.json({ 
      message: response,
      products: products.length > 0 ? products : null, // Para referencia de texto
      productsData: products.length > 0 ? products : [], // Datos completos para botones
      selectedProduct: specificProduct || null,
    })
  } catch (error: any) {
    console.error('Error en chat API:', error)
    return NextResponse.json(
      { error: 'Error al procesar el mensaje', details: error.message },
      { status: 500 }
    )
  }
}

