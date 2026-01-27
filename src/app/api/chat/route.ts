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
    
    // Detectar si está buscando productos usando búsqueda semántica inteligente
    // No dependemos de palabras clave exactas, sino de búsqueda flexible en BD
    const isProductQuery = msg.length > 2 // Cualquier mensaje con más de 2 caracteres puede ser búsqueda
    
    if (isProductQuery) {
      // Extraer todas las palabras significativas (más de 2 caracteres)
      const words = msg.split(/\s+/).filter((w: string) => w.length > 2)
      
      // Construir consulta de búsqueda semántica flexible
      const where: any = { active: true }
      
      // Si hay palabras, buscar en nombre, descripción, marca, categoría y SKU
      if (words.length > 0) {
        where.OR = words.flatMap((word: string) => [
          { name: { contains: word, mode: 'insensitive' } },
          { description: { contains: word, mode: 'insensitive' } },
          { brand: { contains: word, mode: 'insensitive' } },
          { sku: { contains: word, mode: 'insensitive' } },
          { category: { contains: word, mode: 'insensitive' } },
        ])
      }

      // Buscar productos con búsqueda flexible
      products = await prisma.product.findMany({
        where,
        take: 8, // Más resultados para mejor matching
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

      // Si no encontró resultados específicos, hacer búsqueda más amplia
      // Buscar productos destacados o populares como fallback
      if (products.length === 0) {
        products = await prisma.product.findMany({
          where: { active: true },
          take: 5,
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
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

