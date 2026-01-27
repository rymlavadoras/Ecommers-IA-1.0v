import axios from 'axios'

// ===== CULQI =====
export class CulqiService {
  private publicKey: string
  private privateKey: string
  private apiUrl: string = 'https://api.culqi.com/v2'

  constructor() {
    this.publicKey = process.env.CULQI_PUBLIC_KEY || ''
    this.privateKey = process.env.CULQI_PRIVATE_KEY || ''
  }

  async createCharge(data: {
    amount: number // En centavos
    currency_code: string
    email: string
    source_id: string
    description: string
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/charges`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.privateKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Error en Culqi:', error.response?.data || error.message)
      throw new Error(`Error en Culqi: ${error.response?.data?.user_message || error.message}`)
    }
  }

  async createToken(cardData: {
    card_number: string
    cvv: string
    expiration_month: string
    expiration_year: string
    email: string
  }) {
    // Este método normalmente se llama desde el frontend con la public key
    // Aquí es solo para referencia
    try {
      const response = await axios.post(
        `${this.apiUrl}/tokens`,
        cardData,
        {
          headers: {
            'Authorization': `Bearer ${this.publicKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Error al crear token Culqi:', error.response?.data || error.message)
      throw new Error('Error al procesar los datos de la tarjeta')
    }
  }
}

// ===== NIUBIZ (VISA NET) =====
export class NiubizService {
  private merchantId: string
  private accessKey: string
  private securityKey: string
  private apiUrl: string = 'https://apisandbox.vnforapps.com' // Sandbox

  constructor() {
    this.merchantId = process.env.NIUBIZ_MERCHANT_ID || ''
    this.accessKey = process.env.NIUBIZ_ACCESS_KEY || ''
    this.securityKey = process.env.NIUBIZ_SECURITY_KEY || ''
  }

  async generateSessionToken(amount: number) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api.security/v1/security`,
        {
          channel: 'web',
          amount: amount.toFixed(2),
          antifraud: {
            clientIp: '127.0.0.1',
            merchantDefineData: {
              MDD4: 'web',
              MDD21: '0',
              MDD32: '1234567890',
              MDD75: 'Registrado',
              MDD77: '7',
            },
          },
        },
        {
          headers: {
            'Authorization': `${this.accessKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Error en Niubiz:', error.response?.data || error.message)
      throw new Error('Error al generar token de sesión Niubiz')
    }
  }

  async authorizeTransaction(data: {
    amount: number
    purchaseNumber: string
    transactionToken: string
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api.authorization/v3/authorization/ecommerce/${this.merchantId}`,
        {
          channel: 'web',
          captureType: 'manual',
          countable: true,
          order: {
            tokenId: data.transactionToken,
            purchaseNumber: data.purchaseNumber,
            amount: data.amount,
            currency: 'PEN',
          },
        },
        {
          headers: {
            'Authorization': `${this.accessKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Error al autorizar en Niubiz:', error.response?.data || error.message)
      throw new Error('Error al procesar el pago con Niubiz')
    }
  }
}

// ===== IZIPAY =====
export class IzipayService {
  private publicKey: string
  private privateKey: string
  private apiUrl: string = 'https://api.micuentaweb.pe/api-payment/V4'

  constructor() {
    this.publicKey = process.env.IZIPAY_PUBLIC_KEY || ''
    this.privateKey = process.env.IZIPAY_PRIVATE_KEY || ''
  }

  async createPayment(data: {
    amount: number // En centavos
    currency: string
    orderId: string
    customer: {
      email: string
      billingDetails: {
        firstName: string
        lastName: string
      }
    }
  }) {
    try {
      const auth = Buffer.from(`${this.publicKey}:${this.privateKey}`).toString('base64')
      
      const response = await axios.post(
        `${this.apiUrl}/Charge/CreatePayment`,
        {
          amount: data.amount,
          currency: data.currency,
          orderId: data.orderId,
          customer: data.customer,
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Error en Izipay:', error.response?.data || error.message)
      throw new Error('Error al procesar el pago con Izipay')
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const auth = Buffer.from(`${this.publicKey}:${this.privateKey}`).toString('base64')
      
      const response = await axios.post(
        `${this.apiUrl}/Charge/Get`,
        { uuid: paymentId },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Error al obtener detalles de pago Izipay:', error.response?.data || error.message)
      throw new Error('Error al consultar el pago')
    }
  }
}

// Instancias exportadas
export const culqi = new CulqiService()
export const niubiz = new NiubizService()
export const izipay = new IzipayService()

