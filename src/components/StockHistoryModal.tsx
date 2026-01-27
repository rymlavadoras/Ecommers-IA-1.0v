'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { X, TrendingUp, TrendingDown, Package } from 'lucide-react'
import { format } from 'date-fns'

interface StockHistoryItem {
  id: string
  previousStock: number
  newStock: number
  change: number
  reason: string | null
  changedBy: string | null
  createdAt: string
}

interface StockHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
}

export function StockHistoryModal({ isOpen, onClose, productId, productName }: StockHistoryModalProps) {
  const [history, setHistory] = useState<StockHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && productId) {
      loadHistory()
    }
  }, [isOpen, productId])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productId}/history`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] p-4">
        <Card className="bg-white dark:bg-gray-900 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold dark:text-white">Historial de Stock</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{productName}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Historial */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Cargando historial...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay historial de cambios de stock</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {history.map((item) => {
                  const isIncrease = item.change > 0
                  const isDecrease = item.change < 0

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* Icono de cambio */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isIncrease
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : isDecrease
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {isIncrease ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : isDecrease ? (
                          <TrendingDown className="h-5 w-5" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.previousStock} →
                            </span>
                            <span className="font-semibold text-lg dark:text-white">
                              {item.newStock} unidades
                            </span>
                            {item.change !== 0 && (
                              <span
                                className={`text-sm font-medium ${
                                  isIncrease
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                ({isIncrease ? '+' : ''}{item.change})
                              </span>
                            )}
                          </div>
                        </div>

                        {item.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.reason}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {format(new Date(item.createdAt), "dd/MM/yyyy 'a las' HH:mm")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

