import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(coupons)
  } catch (error: any) {
    console.error('Error al obtener cupones:', error)
    return NextResponse.json(
      { error: 'Error al obtener cupones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar que el código no exista
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Este código de cupón ya existe' },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        validFrom: new Date(data.validFrom),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        description: data.description,
        active: data.active !== undefined ? data.active : true,
      },
    })

    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('Error al crear cupón:', error)
    return NextResponse.json(
      { error: 'Error al crear cupón' },
      { status: 500 }
    )
  }
}

