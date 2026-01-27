'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  products?: any[]
}

export function AIChat() {
  const { addItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente virtual. Puedo ayudarte a:\n\n✅ Buscar productos específicos\n✅ Ver detalles y precios\n✅ Agregar productos al carrito\n✅ Procesar tu pedido\n\n¿Qué estás buscando hoy?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastProducts, setLastProducts] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(Math.random().toString(36).substring(7))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId: sessionId.current,
          userId: null, // Aquí iría el ID del usuario si está logueado
          context: {
            currentPage: window.location.pathname,
          },
        }),
      })

      if (!response.ok) throw new Error('Error al enviar mensaje')

      const data = await response.json()
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.message,
        products: data.productsData || [] // Productos completos con datos para botones
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Guardar productos si vienen en la respuesta
      if (data.products) {
        setLastProducts(data.products)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta nuevamente.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '',
      stock: product.stock || 0,
    })
    
    // Agregar mensaje de confirmación
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ ¡Listo! Agregué "${product.name}" a tu carrito. ¿Quieres ver más productos o proceder al pago?`
    }])
  }

  // Función para formatear el mensaje con mejor estilo
  const formatMessage = (content: string) => {
    // Reemplazar saltos de línea por <br />
    const lines = content.split('\n')
    
    return lines.map((line, i) => {
      // Detectar líneas con emojis al inicio (bullets)
      if (line.match(/^[✅❌📦💰🎉📱💻🍔👕⚠️]/)) {
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            <span className="text-base">{line[0]}</span>
            <span className="flex-1">{line.substring(1).trim()}</span>
          </div>
        )
      }
      
      // Detectar listas numeradas
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={i} className="ml-2 my-1">
            <strong>{line.split(':')[0]}</strong>
            {line.includes(':') && <span>: {line.split(':').slice(1).join(':')}</span>}
          </div>
        )
      }
      
      // Detectar texto en negritas con **
      if (line.includes('**')) {
        const parts = line.split('**')
        return (
          <div key={i} className="my-1">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
            )}
          </div>
        )
      }
      
      // Líneas normales
      if (line.trim()) {
        return <div key={i} className="my-1">{line}</div>
      }
      
      // Saltos de línea vacíos
      return <div key={i} className="h-2" />
    })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="text-lg">Asistente Virtual</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessage(message.content)}
                  </div>
                </div>
              </div>
              
              {/* Botones de acción para productos */}
              {message.role === 'assistant' && message.products && message.products.length > 0 && (
                <div className="mt-2 ml-2 space-y-2">
                  {message.products.slice(0, 3).map((product) => (
                    <Button
                      key={product.id}
                      size="sm"
                      variant="outline"
                      className="w-full justify-between text-xs"
                      onClick={() => handleAddToCart(product)}
                    >
                      <span className="truncate">{product.name}</span>
                      <ShoppingCart className="h-3 w-3 ml-2 flex-shrink-0" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

