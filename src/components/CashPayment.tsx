'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { DollarSign, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CashPaymentProps {
  amount: number
  orderId: string
  onConfirm: () => void
}

export function CashPayment({ amount, orderId, onConfirm }: CashPaymentProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            Pago en Efectivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del monto */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monto a pagar</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              S/ {amount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pedido: {orderId}</p>
          </div>

          {/* Información importante */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Importante</p>
                <p>
                  El pago en efectivo se realiza al momento de la entrega. 
                  Asegúrate de tener el monto exacto disponible.
                </p>
              </div>
            </div>
          </div>

          {/* Información de entrega */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Proceso de entrega:</p>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Te contactaremos para coordinar la entrega</li>
              <li>El repartidor traerá el pedido a tu dirección</li>
              <li>Prepara el monto exacto: <strong>S/ {amount.toFixed(2)}</strong></li>
              <li>Revisa tu pedido antes de pagar</li>
              <li>Recibirás un comprobante de pago</li>
            </ol>
          </div>

          {/* Botón de confirmación */}
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onConfirm}
          >
            ✅ Confirmar Pedido (Pago contra entrega)
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Tu pedido será procesado. Te contactaremos pronto para coordinar la entrega y el pago.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

