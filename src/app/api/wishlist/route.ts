import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(wishlist)
  } catch (error: any) {
    console.error('Error al obtener wishlist:', error)
    return NextResponse.json(
      { error: 'Error al obtener wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existing) {
      // Si ya existe, eliminarlo (toggle)
      await prisma.wishlist.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ removed: true })
    }

    // Si no existe, agregarlo
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json({ added: true, item: wishlistItem })
  } catch (error: any) {
    console.error('Error al actualizar wishlist:', error)
    return NextResponse.json(
      { error: 'Error al actualizar wishlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    })

    return NextResponse.json({ message: 'Eliminado de wishlist' })
  } catch (error: any) {
    console.error('Error al eliminar de wishlist:', error)
    return NextResponse.json(
      { error: 'Error al eliminar de wishlist' },
      { status: 500 }
    )
  }
}

