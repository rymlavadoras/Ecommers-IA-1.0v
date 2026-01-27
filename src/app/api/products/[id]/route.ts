import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Intentar buscar por ID primero
    let product = await prisma.product.findUnique({
      where: { id },
    })

    // Si no se encuentra por ID, intentar por SKU
    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: id },
      })
    }

    // Si tampoco por SKU, intentar por slug
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: id },
      })
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Obtener producto actual para comparar stock
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    })

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const newStock = parseInt(data.stock)
    const previousStock = currentProduct.stock
    const stockChange = newStock - previousStock

    // Actualizar producto
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        stock: newStock,
        sku: data.sku,
        images: data.images,
        featured: data.featured,
        active: data.active,
        sizes: data.sizes,
        colors: data.colors,
        brand: data.brand,
        material: data.material,
        warranty: data.warranty,
        specifications: data.specifications,
      },
    })

    // Guardar historial si el stock cambió
    if (stockChange !== 0) {
      await prisma.stockHistory.create({
        data: {
          productId: id,
          previousStock,
          newStock,
          change: stockChange,
          reason: data.stockReason || 'Actualización manual de stock',
          changedBy: data.changedBy || null,
        },
      })
    }

    return NextResponse.json({ product, message: 'Producto actualizado' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // En lugar de eliminar, desactivar el producto
    await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ message: 'Producto desactivado' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}

