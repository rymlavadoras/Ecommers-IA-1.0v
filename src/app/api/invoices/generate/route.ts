import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nubefact } from '@/lib/nubefact'

export async function POST(request: NextRequest) {
  try {
    const { orderId, documentType } = await request.json()

    // Validar tipo de documento
    if (!['1', '3'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Tipo de documento inválido. Use "1" para Factura o "3" para Boleta' },
        { status: 400 }
      )
    }

    // Obtener la orden con sus items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Verificar que la orden esté pagada
    if (order.paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'La orden debe estar pagada antes de emitir el comprobante' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una factura para esta orden
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Ya existe un comprobante para esta orden', invoice: existingInvoice },
        { status: 400 }
      )
    }

    // Determinar serie y número
    const series = documentType === '1' ? 'F001' : 'B001'
    const lastInvoice = await prisma.invoice.findFirst({
      where: { series },
      orderBy: { number: 'desc' },
    })
    const number = (lastInvoice?.number || 0) + 1

    // Generar datos para NubeFacT
    const invoiceData = nubefact.generateInvoiceData(order, documentType as '1' | '3', series, number)

    // Enviar a SUNAT a través de NubeFacT
    const sunatResponse = await nubefact.sendInvoice(invoiceData)

    // Validar respuesta de SUNAT
    if (sunatResponse.errors) {
      return NextResponse.json(
        { error: 'Error al enviar a SUNAT', details: sunatResponse.errors },
        { status: 500 }
      )
    }

    // Guardar la factura en la base de datos
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        documentType: documentType,
        series: series,
        number: number,
        fullNumber: `${series}-${number.toString().padStart(8, '0')}`,
        issuerRuc: process.env.COMPANY_RUC || '',
        issuerName: process.env.COMPANY_NAME || '',
        issuerAddress: process.env.COMPANY_ADDRESS || '',
        customerType: order.customerRuc ? '6' : '1',
        customerDocNumber: order.customerRuc || order.customerDni || '',
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        subtotal: order.subtotal,
        igv: order.tax,
        total: order.total,
        sunatStatus: 'ACEPTADO',
        sunatResponse: sunatResponse as any,
        sunatCdr: sunatResponse.cdr_zip_base64,
        xmlContent: sunatResponse.xml_zip_base64,
        pdfUrl: sunatResponse.enlace_del_pdf,
        qrCode: sunatResponse.codigo_qr,
        hash: sunatResponse.codigo_hash,
        sentToSunatAt: new Date(),
      },
    })

    // Actualizar la orden
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
      },
    })

    return NextResponse.json({
      success: true,
      invoice,
      pdf: sunatResponse.enlace_del_pdf,
      xml: sunatResponse.enlace_del_xml,
      qr: sunatResponse.codigo_qr,
    })
  } catch (error: any) {
    console.error('Error al generar factura:', error)
    return NextResponse.json(
      { error: 'Error al generar el comprobante', details: error.message },
      { status: 500 }
    )
  }
}

