'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CreditCard, Lock, Info } from 'lucide-react'

interface NiubizPaymentProps {
  amount: number
  email: string
  orderId: string
  onSuccess: (chargeId: string) => void
  onError: (error: string) => void
}

export function NiubizPayment({ amount, email, orderId, onSuccess, onError }: NiubizPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [showTestCards, setShowTestCards] = useState(true)

  // Datos de la tarjeta
  const [cardNumber, setCardNumber] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cardEmail, setCardEmail] = useState(email)

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    return formatted.substring(0, 19)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  const useTestCard = (type: 'success' | 'fail') => {
    if (type === 'success') {
      setCardNumber('4111 1111 1111 1111')
      setCvv('123')
      setExpiryMonth('09')
      setExpiryYear('2025')
    } else {
      setCardNumber('4000 0000 0000 0002')
      setCvv('123')
      setExpiryMonth('09')
      setExpiryYear('2025')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cleanCardNumber = cardNumber.replace(/\s/g, '')
      
      if (cleanCardNumber.length !== 16) {
        throw new Error('Número de tarjeta inválido (debe tener 16 dígitos)')
      }
      if (cvv.length !== 3 && cvv.length !== 4) {
        throw new Error('CVV inválido (debe tener 3 o 4 dígitos)')
      }
      if (!expiryMonth || !expiryYear) {
        throw new Error('Fecha de expiración inválida')
      }
      if (parseInt(expiryYear) < new Date().getFullYear()) {
        throw new Error('La tarjeta está vencida')
      }

      // Llamar al API para procesar el pago con Niubiz
      const response = await fetch('/api/payments/niubiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email: cardEmail,
          orderId,
          card: {
            number: cleanCardNumber,
            cvv,
            exp_month: parseInt(expiryMonth),
            exp_year: parseInt(expiryYear),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago')
      }

      onSuccess(data.transactionId)
    } catch (error: any) {
      onError(error.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Información de seguridad */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-1">Pago 100% Seguro</p>
          <p className="text-blue-700 dark:text-blue-300">
            Procesado por Niubiz (Visa Net). Tus datos están protegidos con encriptación SSL.
          </p>
        </div>
      </div>

      {/* Tarjetas de prueba (solo en demo) */}
      {showTestCards && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 dark:text-yellow-200">
              <Info className="h-4 w-4" />
              Modo Demo - Usa tarjetas de prueba
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              Estás en modo prueba. Usa estas tarjetas ficticias:
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => useTestCard('success')}
                className="text-xs"
              >
                ✅ Pago Exitoso
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => useTestCard('fail')}
                className="text-xs"
              >
                ❌ Pago Rechazado
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tarjeta exitosa: 4111 1111 1111 1111 | CVV: 123 | Expira: 09/2025
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Información de Tarjeta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Número de tarjeta */}
            <div>
              <Label htmlFor="cardNumber" className="dark:text-gray-300">Número de Tarjeta *</Label>
              <Input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                required
                maxLength={19}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Mes */}
              <div>
                <Label htmlFor="month" className="dark:text-gray-300">Mes *</Label>
                <Input
                  id="month"
                  type="text"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').substring(0, 2))}
                  placeholder="MM"
                  required
                  maxLength={2}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Año */}
              <div>
                <Label htmlFor="year" className="dark:text-gray-300">Año *</Label>
                <Input
                  id="year"
                  type="text"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="AAAA"
                  required
                  maxLength={4}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* CVV */}
              <div>
                <Label htmlFor="cvv" className="dark:text-gray-300">CVV *</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  placeholder="123"
                  required
                  maxLength={3}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="dark:text-gray-300">Email *</Label>
              <Input
                id="email"
                type="email"
                value={cardEmail}
                onChange={(e) => setCardEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botón de pago */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando Pago...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" />
              Pagar S/ {amount.toFixed(2)}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Al confirmar el pago, aceptas nuestros términos y condiciones.
        </p>
      </form>
    </div>
  )
}

