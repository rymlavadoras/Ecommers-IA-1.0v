import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Intentar buscar por ID o por orderNumber
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderNumber: id }
        ]
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoice: {
          select: {
            id: true,
            fullNumber: true,
            sunatStatus: true,
            pdfUrl: true,
            xmlContent: true,
            qrCode: true,
            createdAt: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(data.status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoice: {
          select: {
            id: true,
            fullNumber: true,
            sunatStatus: true,
            pdfUrl: true,
            xmlContent: true,
            qrCode: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({ order, message: 'Orden actualizada' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}

