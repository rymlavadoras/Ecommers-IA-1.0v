import axios from 'axios'

export interface NubeFacTInvoiceData {
  operacion: 'generar_comprobante'
  tipo_de_comprobante: '1' | '3' // 1: Factura, 3: Boleta
  serie: string
  numero: number
  sunat_transaction: '1' // 1: Enviar a SUNAT automáticamente
  cliente_tipo_de_documento: '1' | '6' // 1: DNI, 6: RUC
  cliente_numero_de_documento: string
  cliente_denominacion: string
  cliente_direccion: string
  cliente_email?: string
  fecha_de_emision: string // YYYY-MM-DD
  moneda: '1' // 1: PEN (Soles)
  tipo_de_cambio?: string
  porcentaje_de_igv: '18.00'
  descuento_global?: string
  total_descuento?: string
  total_anticipo?: string
  total_gravada: string
  total_inafecta?: string
  total_exonerada?: string
  total_igv: string
  total_gratuita?: string
  total_otros_cargos?: string
  total: string
  percepciones?: string
  total_incluido_percepcion?: string
  detraccion?: boolean
  observaciones?: string
  documento_que_se_modifica_tipo?: string
  documento_que_se_modifica_serie?: string
  documento_que_se_modifica_numero?: string
  tipo_de_nota_de_credito?: string
  tipo_de_nota_de_debito?: string
  enviar_automaticamente_a_la_sunat: true
  enviar_automaticamente_al_cliente: boolean
  codigo_unico?: string
  condiciones_de_pago?: string
  medio_de_pago?: string
  placa_vehiculo?: string
  orden_compra_servicio?: string
  tabla_personalizada_codigo?: string
  formato_de_pdf?: string
  items: NubeFacTItem[]
}

export interface NubeFacTItem {
  unidad_de_medida: string // 'NIU' (Unidad), 'ZZ' (Servicio)
  codigo: string // SKU
  descripcion: string
  cantidad: number
  valor_unitario: number
  precio_unitario: number
  descuento?: string
  subtotal: number
  tipo_de_igv: '1' // 1: Gravado
  igv: number
  total: number
  anticipo_regularizacion?: boolean
  anticipo_comprobante_serie?: string
  anticipo_comprobante_numero?: string
}

export interface NubeFacTResponse {
  errors: string
  sunat_description: string
  sunat_note: string
  sunat_responsecode: string
  sunat_soap_error: string
  pdf_zip_base64: string
  xml_zip_base64: string
  cdr_zip_base64: string
  cadena_para_codigo_qr: string
  codigo_hash: string
  codigo_qr: string
  enlace_del_pdf: string
  enlace_del_xml: string
  enlace_del_cdr: string
  acceptance_status: string
}

export class NubeFacTService {
  private apiUrl: string
  private token: string
  private ruc: string
  private isDemoMode: boolean

  constructor() {
    // Modo DEMO: Si no hay token o es 'demo', usa simulación
    this.token = process.env.NUBEFACT_TOKEN || 'demo'
    this.isDemoMode = !this.token || this.token === 'demo' || this.token === ''
    
    // URL Demo de NubeFacT para pruebas (o producción)
    this.apiUrl = this.isDemoMode 
      ? 'https://demo-api.nubefact.com/api/v1'
      : (process.env.NUBEFACT_API_URL || 'https://api.nubefact.com/api/v1')
    
    this.ruc = process.env.NUBEFACT_RUC || process.env.COMPANY_RUC || '20123456789'
    
    if (this.isDemoMode) {
      console.log('🧪 NubeFacT en MODO DEMO - Facturas simuladas')
    }
  }

  async sendInvoice(data: NubeFacTInvoiceData): Promise<NubeFacTResponse> {
    // Modo DEMO: Simular respuesta exitosa
    if (this.isDemoMode) {
      console.log('📄 Generando comprobante DEMO:', `${data.serie}-${String(data.numero).padStart(8, '0')}`)
      
      // Simular respuesta realista de NubeFacT
      const fullNumber = `${data.serie}-${String(data.numero).padStart(8, '0')}`
      const tipoDoc = data.tipo_de_comprobante === '1' ? 'FACTURA' : 'BOLETA'
      
      return {
        errors: '',
        sunat_description: `La ${tipoDoc} número ${fullNumber}, ha sido aceptada`,
        sunat_note: '',
        sunat_responsecode: '0',
        sunat_soap_error: '',
        pdf_zip_base64: btoa(`PDF_DEMO_${fullNumber}`),
        xml_zip_base64: btoa(`XML_DEMO_${fullNumber}`),
        cdr_zip_base64: btoa(`CDR_DEMO_${fullNumber}`),
        cadena_para_codigo_qr: `${this.ruc}|${data.tipo_de_comprobante}|${data.serie}|${data.numero}|${data.total_igv}|${data.total}|${data.fecha_de_emision}|${data.cliente_tipo_de_documento}|${data.cliente_numero_de_documento}`,
        codigo_hash: this.generateHash(fullNumber),
        codigo_qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${this.ruc}|${data.serie}|${data.numero}|${data.total}`,
        enlace_del_pdf: `https://demo.nubefact.com/pdf/${fullNumber}.pdf`,
        enlace_del_xml: `https://demo.nubefact.com/xml/${fullNumber}.xml`,
        enlace_del_cdr: `https://demo.nubefact.com/cdr/R-${fullNumber}.zip`,
        acceptance_status: 'ACEPTADO',
      }
    }

    // Modo PRODUCCIÓN: Llamar al API real
    try {
      const response = await axios.post(
        `${this.apiUrl}/issue`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Error al enviar comprobante a NubeFacT:', error.response?.data || error.message)
      throw new Error(`Error en NubeFacT: ${error.response?.data?.errors || error.message}`)
    }
  }

  // Generar hash simulado para modo DEMO
  private generateHash(identifier: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let hash = ''
    for (let i = 0; i < 64; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      hash += chars[randomIndex]
    }
    return hash + '=' // Base64-like
  }

  async getInvoice(tipo: string, serie: string, numero: number): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/consultar`,
        {
          operacion: 'consultar_comprobante',
          tipo_de_comprobante: tipo,
          serie: serie,
          numero: numero,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Error al consultar comprobante:', error.response?.data || error.message)
      throw new Error(`Error al consultar: ${error.response?.data?.errors || error.message}`)
    }
  }

  // Generar datos para NubeFacT desde una orden
  generateInvoiceData(
    order: any,
    documentType: '1' | '3',
    serie: string,
    number: number
  ): NubeFacTInvoiceData {
    const items: NubeFacTItem[] = order.items.map((item: any) => {
      const subtotal = item.price * item.quantity
      const igv = subtotal * 0.18

      return {
        unidad_de_medida: 'NIU',
        codigo: item.sku,
        descripcion: item.productName,
        cantidad: item.quantity,
        valor_unitario: parseFloat((item.price / 1.18).toFixed(2)),
        precio_unitario: item.price,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tipo_de_igv: '1',
        igv: parseFloat(igv.toFixed(2)),
        total: parseFloat((subtotal + igv).toFixed(2)),
      }
    })

    return {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: documentType,
      serie: serie,
      numero: number,
      sunat_transaction: '1',
      cliente_tipo_de_documento: order.customerRuc ? '6' : '1',
      cliente_numero_de_documento: order.customerRuc || order.customerDni,
      cliente_denominacion: order.customerName,
      cliente_direccion: order.customerAddress,
      cliente_email: order.customerEmail,
      fecha_de_emision: new Date().toISOString().split('T')[0],
      moneda: '1',
      porcentaje_de_igv: '18.00',
      total_gravada: order.subtotal.toFixed(2),
      total_igv: order.tax.toFixed(2),
      total: order.total.toFixed(2),
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: true,
      items: items,
    }
  }
}

export const nubefact = new NubeFacTService()

