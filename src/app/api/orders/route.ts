import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar datos requeridos
    if (!data.name || !data.email || !data.phone || !data.address || !data.items) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Calcular totales
    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )
    const tax = subtotal * 0.18
    const total = subtotal + tax

    // Generar número de orden
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, '0')}`

    // Crear usuario temporal si no existe
    let userId = data.userId
    if (!userId) {
      // Buscar usuario existente por email o DNI
      let existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            ...(data.dni ? [{ dni: data.dni }] : []),
          ],
        },
      })

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Crear nuevo usuario temporal
        const tempUser = await prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            password: Math.random().toString(36), // Password temporal
            phone: data.phone,
            address: data.address,
            dni: data.dni || null,
            role: 'USER',
          },
        })
        userId = tempUser.id
      }
    }

    // Crear orden
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        customerDni: data.dni || null,
        customerAddress: `${data.address}, ${data.district}, ${data.city}`,
        subtotal,
        tax,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        notes: data.notes || null,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            productName: item.name || 'Producto',
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
            sku: `SKU-${item.productId}`,
            imageUrl: item.image || null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Actualizar stock de productos
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
        message: 'Pedido creado exitosamente',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creando orden:', error)
    return NextResponse.json(
      { error: 'Error al crear el pedido', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    const where: any = {}
    if (userId) {
      where.userId = userId
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Error obteniendo órdenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}
