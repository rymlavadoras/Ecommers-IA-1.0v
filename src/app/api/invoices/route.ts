import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error('Error al obtener facturas:', error)
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    )
  }
}

