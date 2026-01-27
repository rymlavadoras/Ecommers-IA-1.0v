import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: 'Código y subtotal son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no válido' },
        { status: 404 }
      )
    }

    // Validar que esté activo
    if (!coupon.active) {
      return NextResponse.json(
        { error: 'Este cupón ya no está disponible' },
        { status: 400 }
      )
    }

    // Validar fecha de vigencia
    const now = new Date()
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: 'Este cupón aún no es válido' },
        { status: 400 }
      )
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: 'Este cupón ha expirado' },
        { status: 400 }
      )
    }

    // Validar límite de usos
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Este cupón ha alcanzado su límite de usos' },
        { status: 400 }
      )
    }

    // Validar mínimo de compra
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return NextResponse.json(
        { 
          error: `Este cupón requiere un mínimo de compra de S/ ${coupon.minPurchase.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Calcular descuento
    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100
      // Aplicar descuento máximo si existe
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discount = coupon.discountValue
      // No puede ser mayor que el subtotal
      if (discount > subtotal) {
        discount = subtotal
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discount: Number(discount.toFixed(2)),
      message: `Cupón aplicado: ${coupon.description || ''}`
    })
  } catch (error: any) {
    console.error('Error al validar cupón:', error)
    return NextResponse.json(
      { error: 'Error al validar cupón' },
      { status: 500 }
    )
  }
}

