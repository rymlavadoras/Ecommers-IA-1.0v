// Integración con Culqi - Pasarela de Pagos Perú
// Documentación: https://docs.culqi.com

export interface CulqiToken {
  id: string
  object: string
  creation_date: number
  email: string
  card_number: string
  last_four: string
  active: boolean
  iin: {
    object: string
    bin: string
    card_brand: string
    card_type: string
    card_category: string
    issuer: {
      name: string
      country: string
      country_code: string
      website: string | null
      phone_number: string | null
    }
  }
  client: {
    ip: string
    ip_country: string
    ip_country_code: string
    browser: string
    device_fingerprint: string | null
    device_type: string
  }
  metadata: Record<string, any>
}

export interface CulqiCharge {
  id: string
  object: string
  creation_date: number
  amount: number
  amount_refunded: number
  current_amount: number
  installments: number
  installments_amount: number | null
  currency_code: string
  email: string
  description: string
  source: {
    object: string
    id: string
    type: string
    card_number: string
    last_four: string
    active: boolean
    iin: any
    client: any
  }
  outcome: {
    type: string
    code: string
    merchant_message: string
    user_message: string
  }
  fraud_score: number | null
  antifraud_details: any
  dispute: boolean
  capture: boolean
  reference_code: string
  authorization_code: string
  metadata: Record<string, any>
  total_fee: number
  fee_details: {
    fixed_fee: {
      total: number
      currency_code: string
      commissions: any[]
    }
    variable_fee: {
      currency_code: string
      commissions: any[]
      total: number
    }
  }
  net: number
  transfer_amount: number
}

// Cliente para el servidor (con secret key)
export class CulqiServer {
  private secretKey: string
  private baseUrl: string = 'https://api.culqi.com/v2'

  constructor() {
    this.secretKey = process.env.CULQI_SECRET_KEY || 'sk_test_UTCQSGcXW8bCyU59'
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.user_message || result.merchant_message || 'Error en Culqi')
    }

    return result
  }

  // Crear un cargo (cobrar)
  async createCharge(data: {
    amount: number // en centavos (ej: 10000 = S/ 100.00)
    currency_code: string // 'PEN' o 'USD'
    email: string
    source_id: string // token ID del cliente
    description: string
    metadata?: Record<string, any>
  }): Promise<CulqiCharge> {
    return await this.request('/charges', 'POST', data)
  }

  // Obtener información de un cargo
  async getCharge(chargeId: string): Promise<CulqiCharge> {
    return await this.request(`/charges/${chargeId}`)
  }

  // Crear una devolución (refund)
  async createRefund(chargeId: string, amount: number, reason: string) {
    return await this.request('/refunds', 'POST', {
      charge_id: chargeId,
      amount,
      reason,
    })
  }
}

// Funciones helper
export function formatAmount(amount: number): number {
  // Convierte de soles a centavos (S/ 100.00 -> 10000)
  return Math.round(amount * 100)
}

export function parseAmount(centavos: number): number {
  // Convierte de centavos a soles (10000 -> 100.00)
  return centavos / 100
}

// Tarjetas de prueba para SANDBOX
export const TEST_CARDS = {
  visa_exitosa: {
    number: '4111111111111111',
    cvv: '123',
    month: '09',
    year: '2025',
    email: 'test@culqi.com',
  },
  mastercard_exitosa: {
    number: '5111111111111118',
    cvv: '123',
    month: '09',
    year: '2025',
    email: 'test@culqi.com',
  },
  visa_rechazada: {
    number: '4000000000000002',
    cvv: '123',
    month: '09',
    year: '2025',
    email: 'test@culqi.com',
  },
}

