import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// GET - Obtener productos con filtros
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const brand = searchParams.get('brand')
    const size = searchParams.get('size')
    const color = searchParams.get('color')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir filtros dinámicos
    const where: any = {
      active: true,
    }

    if (category && category !== 'TODOS') {
      where.category = category.toUpperCase()
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }

    if (size) {
      where.sizes = { has: size }
    }

    if (color) {
      where.colors = { has: color }
    }

    if (featured === 'true') {
      where.featured = true
    }

    // Consultar productos
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error: any) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear producto (admin)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar datos requeridos
    if (!data.name || !data.price || !data.category || !data.sku) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, price, category, sku' },
        { status: 400 }
      )
    }

    // Generar slug automático
    const slug = slugify(data.name)

    // Verificar que el SKU sea único
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'El SKU ya existe' },
        { status: 400 }
      )
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || '',
        category: data.category,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        stock: parseInt(data.stock) || 0,
        sku: data.sku,
        images: data.images || [],
        featured: data.featured || false,
        active: data.active !== undefined ? data.active : true,
        sizes: data.sizes || [],
        colors: data.colors || [],
        brand: data.brand || null,
        material: data.material || null,
        warranty: data.warranty || null,
        specifications: data.specifications || null,
        slug: slug,
        metaTitle: data.metaTitle || data.name,
        metaDescription: data.metaDescription || data.description?.substring(0, 160),
      },
    })

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto', details: error.message },
      { status: 500 }
    )
  }
}

