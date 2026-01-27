'use client'

import { AIChat } from './AIChat'
import { CartProvider } from '@/contexts/CartContext'
import { isFeatureEnabled } from '@/config/features'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      {isFeatureEnabled('AI_CHAT') && <AIChat />}
    </CartProvider>
  )
}

