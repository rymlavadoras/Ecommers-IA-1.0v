import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Total de órdenes completadas
    const totalOrders = await prisma.order.count({
      where: { status: { in: ['DELIVERED', 'SHIPPED', 'PAID'] } },
    })

    // Revenue total
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'COMPLETED' },
      select: { total: true },
    })
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

    // Total productos
    const totalProducts = await prisma.product.count({
      where: { active: true },
    })

    // Total usuarios
    const totalUsers = await prisma.user.count()

    // Órdenes pendientes
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    })

    // Productos con stock bajo (menos de 10)
    const lowStockProducts = await prisma.product.count({
      where: { 
        active: true,
        stock: { lt: 10 },
      },
    })

    // Órdenes recientes (últimas 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
      lowStockProducts,
      recentOrders,
    })
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

