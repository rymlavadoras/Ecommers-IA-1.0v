import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId es requerido' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error('Error al obtener reseñas:', error)
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, productId, rating, title, comment } = data

    if (!userId || !productId || !rating) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una reseña
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya has dejado una reseña para este producto' },
        { status: 400 }
      )
    }

    // Verificar si el usuario compró el producto
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          paymentStatus: 'COMPLETED',
        },
      },
    })

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        comment,
        verified: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Error al crear reseña:', error)
    return NextResponse.json(
      { error: 'Error al crear reseña' },
      { status: 500 }
    )
  }
}

