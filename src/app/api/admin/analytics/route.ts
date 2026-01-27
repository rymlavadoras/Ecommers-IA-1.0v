import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'all'

    // Calcular fecha de inicio según el rango
    const now = new Date()
    let startDate = new Date(0) // Desde el principio

    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Órdenes completadas en el rango
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Ingresos totales
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)

    // Total de órdenes
    const totalOrders = orders.length

    // Valor promedio de orden
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Total de usuarios
    const totalUsers = await prisma.user.count()

    // Total de productos
    const totalProducts = await prisma.product.count()

    // Productos más vendidos
    const productSales: Record<string, { product: any; totalSold: number; revenue: number }> = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            product: item.product,
            totalSold: 0,
            revenue: 0,
          }
        }
        productSales[item.productId].totalSold += item.quantity
        productSales[item.productId].revenue += Number(item.price) * item.quantity
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map((item) => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        totalSold: item.totalSold,
        revenue: item.revenue,
        imageUrl: item.product.imageUrl,
      }))

    // Ingresos por categoría
    const categoryRevenue: Record<string, number> = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.category
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0
        }
        categoryRevenue[category] += Number(item.price) * item.quantity
      })
    })

    const revenueByCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    // Órdenes por estado
    const ordersbyStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        status: true,
      },
    })

    const ordersbyStatusFormatted = ordersbyStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }))

    // Crecimiento (comparar con período anterior del mismo rango)
    let revenueGrowth = 0
    let ordersGrowth = 0

    if (timeRange !== 'all') {
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
      const previousEndDate = startDate

      const previousOrders = await prisma.order.findMany({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
        },
      })

      const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total), 0)
      const previousOrderCount = previousOrders.length

      if (previousRevenue > 0) {
        revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100
      }
      if (previousOrderCount > 0) {
        ordersGrowth = ((totalOrders - previousOrderCount) / previousOrderCount) * 100
      }
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      averageOrderValue,
      topProducts,
      revenueByCategory,
      ordersbyStatus: ordersbyStatusFormatted,
      revenueGrowth,
      ordersGrowth,
    })
  } catch (error: any) {
    console.error('Error al generar analíticas:', error)
    return NextResponse.json(
      { error: 'Error al generar analíticas' },
      { status: 500 }
    )
  }
}

