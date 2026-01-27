import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener historial de cambios de stock de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const history = await prisma.stockHistory.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Últimos 50 cambios
    })

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    )
  }
}

