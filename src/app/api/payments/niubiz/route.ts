import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { amount, email, orderId, card } = await request.json()

    if (!amount || !email || !orderId || !card) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // MODO DEMO: Simular procesamiento de pago con Niubiz
    // Verificar si es tarjeta de prueba exitosa o fallida
    const isSuccessCard = card.number === '4111111111111111'
    const isFailCard = card.number === '4000000000000002'

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (isFailCard) {
      // Simular pago rechazado
      await prisma.order.update({
        where: { orderNumber: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      })

      return NextResponse.json(
        { error: 'Pago rechazado por el banco. Tarjeta de prueba: rechazada.' },
        { status: 400 }
      )
    }

    // Simular pago exitoso
    const transactionId = `niubiz_${Date.now()}_${Math.random().toString(36).substring(7)}`

    await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentReference: transactionId,
        paidAt: new Date(),
        status: 'PROCESSING',
      },
    })

    return NextResponse.json({
      success: true,
      transactionId,
      charge: {
        id: transactionId,
        amount: amount,
        currency: 'PEN',
        status: 'approved',
        authorization_code: `AUTH${Math.floor(Math.random() * 1000000)}`,
        reference_code: `REF${Math.floor(Math.random() * 1000000)}`,
      },
      message: 'Pago procesado exitosamente (DEMO)',
    })

    /* PRODUCCIÓN: Descomentar esto cuando tengas cuenta Niubiz real
    
    const { NiubizService } = await import('@/lib/payment-gateways')
    const niubiz = new NiubizService()

    // Paso 1: Generar token de sesión
    const sessionToken = await niubiz.generateSessionToken(amount)

    // Paso 2: Autorizar transacción
    const transaction = await niubiz.authorizeTransaction({
      amount,
      purchaseNumber: orderId,
      transactionToken: sessionToken.sessionToken,
    })

    await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentReference: transaction.transactionId,
        paidAt: new Date(),
        status: 'PROCESSING',
      },
    })

    return NextResponse.json({
      success: true,
      transactionId: transaction.transactionId,
      charge: {
        id: transaction.transactionId,
        amount: transaction.amount,
        currency: 'PEN',
        status: transaction.status,
        authorization_code: transaction.authorizationCode,
        reference_code: transaction.referenceCode,
      },
      message: 'Pago procesado exitosamente',
    })
    */

  } catch (error: any) {
    console.error('Error procesando pago Niubiz:', error)
    
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pago' },
      { status: 400 }
    )
  }
}

