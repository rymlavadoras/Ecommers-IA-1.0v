'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Smartphone, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface YapePaymentProps {
  amount: number
  orderId: string
  phone?: string
  onConfirm: () => void
}

export function YapePayment({ amount, orderId, phone, onConfirm }: YapePaymentProps) {
  const [copied, setCopied] = useState(false)
  
  // Número Yape de la tienda (configurable desde env)
  const yapePhone = process.env.NEXT_PUBLIC_YAPE_PHONE || '+51 955 112 484'
  const yapeQrCode = process.env.NEXT_PUBLIC_YAPE_QR || '/yape-qr.png'

  const handleCopy = () => {
    navigator.clipboard.writeText(yapePhone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const message = `Hola! Realicé el pago por Yape por S/ ${amount.toFixed(2)} para mi pedido ${orderId}. Por favor confirmar.`
    const url = `https://wa.me/${yapePhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Pago con Yape
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del monto */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monto a pagar</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              S/ {amount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pedido: {orderId}</p>
          </div>

          {/* Número Yape */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2 dark:text-gray-300">Número Yape de la tienda:</p>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="flex-1 font-mono text-lg font-semibold dark:text-white">
                  {yapePhone}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code (opcional) */}
            {yapeQrCode && (
              <div className="text-center">
                <p className="text-sm font-medium mb-2 dark:text-gray-300">O escanea el código QR:</p>
                <div className="inline-block p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <div className="w-48 h-48 bg-white dark:bg-gray-800 flex items-center justify-center rounded overflow-hidden">
                    <Image 
                      src={yapeQrCode} 
                      alt="Yape QR Code" 
                      width={192} 
                      height={192}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Instrucciones:</p>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Abre la app Yape en tu celular</li>
              <li>Ingresa el monto exacto: <strong>S/ {amount.toFixed(2)}</strong></li>
              <li>Selecciona el número: <strong>{yapePhone}</strong></li>
              <li>Confirma el pago</li>
              <li>Haz clic en "Confirmar Pago" una vez realizado</li>
            </ol>
          </div>

          {/* Botones de acción */}
          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsApp}
            >
              📱 Confirmar por WhatsApp
            </Button>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={onConfirm}
            >
              ✅ Ya realicé el pago
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Tu pedido será procesado una vez confirmemos el pago. Te notificaremos por email o WhatsApp.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

