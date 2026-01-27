import { NextRequest, NextResponse } from 'next/server'
import { CulqiServer, formatAmount } from '@/lib/culqi'
import { prisma } from '@/lib/prisma'

// Culqi requiere primero crear un "token" del lado del cliente
// Luego usar ese token para hacer el cargo
// Para simplificar el demo, lo hacemos todo del lado del servidor

export async function POST(request: NextRequest) {
  try {
    const { amount, email, orderId, card } = await request.json()

    if (!amount || !email || !orderId || !card) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // MODO DEMO: Simular procesamiento de pago
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
    const chargeId = `chr_test_${Date.now()}_${Math.random().toString(36).substring(7)}`

    await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentReference: chargeId,
        paidAt: new Date(),
        status: 'PROCESSING',
      },
    })

    return NextResponse.json({
      success: true,
      charge: {
        id: chargeId,
        amount: amount,
        currency: 'PEN',
        status: 'approved',
        authorization_code: `AUTH${Math.floor(Math.random() * 1000000)}`,
        reference_code: `REF${Math.floor(Math.random() * 1000000)}`,
      },
      message: 'Pago procesado exitosamente (DEMO)',
    })

    /* PRODUCCIÓN: Descomentar esto cuando tengas cuenta Culqi real
    
    const culqi = new CulqiServer()

    // Paso 1: Crear token
    const tokenResponse = await fetch('https://secure.culqi.com/v2/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_number: card.number,
        cvv: card.cvv,
        expiration_month: card.exp_month.toString().padStart(2, '0'),
        expiration_year: card.exp_year.toString(),
        email: email,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(errorData.user_message || 'Error al procesar la tarjeta')
    }

    const token = await tokenResponse.json()

    // Paso 2: Crear cargo
    const charge = await culqi.createCharge({
      amount: formatAmount(amount),
      currency_code: 'PEN',
      email: email,
      source_id: token.id,
      description: `Orden ${orderId}`,
      metadata: { order_id: orderId },
    })

    await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentReference: charge.id,
        paidAt: new Date(),
        status: 'PROCESSING',
      },
    })

    return NextResponse.json({
      success: true,
      charge: {
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency_code,
        status: 'approved',
        authorization_code: charge.authorization_code,
        reference_code: charge.reference_code,
      },
      message: 'Pago procesado exitosamente',
    })
    */

  } catch (error: any) {
    console.error('Error procesando pago:', error)
    
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pago' },
      { status: 400 }
    )
  }
}

// Webhook para recibir notificaciones de Culqi
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar que venga de Culqi (en producción verificar firma)
    if (body.object === 'event' && body.type === 'charge.succeeded') {
      const chargeId = body.data.id
      
      // Buscar la orden por el charge ID
      const order = await prisma.order.findFirst({
        where: { paymentReference: chargeId },
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'PROCESSING',
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en webhook Culqi:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

