'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from './ui/button'
import { formatCurrency } from '@/lib/utils'

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart()

  return (
    <>
      {/* Botón del carrito */}
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel lateral del carrito */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({itemCount})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Tu carrito está vacío</p>
              <Button onClick={() => setIsOpen(false)}>
                <Link href="/productos">Ver Productos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 border-b dark:border-gray-700 pb-4">
                  {/* Imagen */}
                  <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 dark:text-white">
                      {item.name}
                    </h3>
                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {item.size && `Talla: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    )}
                    <p className="font-bold text-primary">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón limpiar carrito */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t dark:border-gray-700 p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold dark:text-white">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <Link href="/checkout" className="block" onClick={() => setIsOpen(false)}>
              <Button className="w-full" size="lg">
                Proceder al Pago
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Seguir Comprando
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

