import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const coupon = await prisma.coupon.update({
      where: { id },
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
        active: data.active,
      },
    })

    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('Error al actualizar cupón:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cupón' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cupón eliminado' })
  } catch (error: any) {
    console.error('Error al eliminar cupón:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cupón' },
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
    const { active } = await request.json()

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { active },
    })

    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('Error al actualizar estado:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado' },
      { status: 500 }
    )
  }
}

