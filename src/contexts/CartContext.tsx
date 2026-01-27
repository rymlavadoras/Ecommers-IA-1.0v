'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      // Buscar si ya existe el mismo producto con las mismas variantes
      const existingIndex = prev.findIndex(
        item =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          item.color === newItem.color
      )

      if (existingIndex >= 0) {
        // Si existe, aumentar cantidad (respetando stock)
        const updated = [...prev]
        const newQty = Math.min(
          updated[existingIndex].quantity + newItem.quantity,
          newItem.stock
        )
        updated[existingIndex].quantity = newQty
        return updated
      } else {
        // Si no existe, agregar nuevo
        return [
          ...prev,
          {
            ...newItem,
            id: `${newItem.productId}-${newItem.size || ''}-${newItem.color || ''}-${Date.now()}`,
          },
        ]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

