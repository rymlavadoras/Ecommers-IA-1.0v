'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings,
  ArrowLeft,
  Edit,
  Save,
  LogOut
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserData {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  dni: string | null
  ruc: string | null
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: any[]
}

export default function PerfilPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dni: '',
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/productos')
      return
    }

    try {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dni: userData.dni || '',
      })

      // Cargar órdenes del usuario
      const res = await fetch(`/api/orders?userId=${userData.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      // Aquí iría la actualización del usuario en la API
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditing(false)
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el perfil.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-700 bg-green-100'
      case 'SHIPPED': return 'text-blue-700 bg-blue-100'
      case 'PROCESSING': return 'text-purple-700 bg-purple-100'
      case 'PAID': return 'text-orange-700 bg-orange-100'
      case 'CANCELLED': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      PROCESSING: 'En Preparación',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Mi Perfil</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="ordenes">
              <Package className="mr-2 h-4 w-4" />
              Mis Órdenes
            </TabsTrigger>
            <TabsTrigger value="favoritos">
              <Heart className="mr-2 h-4 w-4" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="direcciones">
              <MapPin className="mr-2 h-4 w-4" />
              Direcciones
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Perfil */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Información Personal</CardTitle>
                {!editing ? (
                  <Button onClick={() => setEditing(true)} size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dni">DNI</Label>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => setFormData({...formData, dni: e.target.value})}
                      disabled={!editing}
                      maxLength={8}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!editing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Órdenes */}
          <TabsContent value="ordenes">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Órdenes ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No tienes órdenes aún</p>
                    <Button asChild className="mt-4">
                      <Link href="/productos">Explorar Productos</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">Orden {order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrency(order.total)}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/orden/${order.orderNumber}`}>
                              Ver Detalles
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Favoritos */}
          <TabsContent value="favoritos">
            <Card>
              <CardHeader>
                <CardTitle>Mis Favoritos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Guarda tus productos favoritos aquí
                  </p>
                  <Button asChild>
                    <Link href="/favoritos">
                      Ver Lista de Favoritos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Direcciones */}
          <TabsContent value="direcciones">
            <Card>
              <CardHeader>
                <CardTitle>Direcciones Guardadas</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.address ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Dirección Principal</p>
                        <p className="text-gray-600">{formData.address}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No tienes direcciones guardadas</p>
                    <p className="text-sm">Agrega una dirección desde tu perfil</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

