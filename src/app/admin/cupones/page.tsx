'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { FeatureGuard } from '@/components/FeatureGuard'
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  minPurchase: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  perUserLimit: number | null
  validFrom: string
  validUntil: string | null
  active: boolean
  description: string | null
  createdAt: string
}

export default function CouponsAdminPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    description: '',
    active: true,
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coupons')
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      console.error('Error al cargar cupones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
          validUntil: formData.validUntil || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar cupón')
      }

      toast({
        title: editingId ? "Cupón actualizado" : "Cupón creado",
        description: editingId ? "El cupón se ha actualizado correctamente." : "El cupón se ha creado exitosamente.",
        variant: "success",
      })
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Error al guardar cupón',
        variant: "destructive",
      })
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      perUserLimit: coupon.perUserLimit?.toString() || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
      description: coupon.description || '',
      active: coupon.active,
    })
    setEditingId(coupon.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      toast({
        title: "Cupón eliminado",
        description: "El cupón se ha eliminado correctamente.",
        variant: "success",
      })
      fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Error al eliminar cupón',
        variant: "destructive",
      })
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })

      if (!response.ok) throw new Error('Error al actualizar')

      fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Error al actualizar cupón',
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      perUserLimit: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      description: '',
      active: true,
    })
  }

  return (
    <FeatureGuard feature="COUPONS">
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Cupones</h1>
                <p className="text-sm text-gray-600">
                  Crea y administra códigos de descuento
                </p>
              </div>
            </div>
            <Button onClick={() => { setShowForm(true); setEditingId(null); resetForm() }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cupón
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Formulario */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar' : 'Crear'} Cupón</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código del Cupón *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="VERANO2025"
                      required
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discountType">Tipo de Descuento *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => setFormData({...formData, discountType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Monto Fijo (S/)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discountValue">
                      Valor del Descuento * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(S/)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      required
                      min="0"
                      max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    />
                  </div>

                  {formData.discountType === 'PERCENTAGE' && (
                    <div>
                      <Label htmlFor="maxDiscount">Descuento Máximo (S/)</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                        placeholder="Opcional"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="minPurchase">Compra Mínima (S/)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <Label htmlFor="usageLimit">Límite de Usos Total</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      placeholder="Ilimitado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="perUserLimit">Límite por Usuario</Label>
                    <Input
                      id="perUserLimit"
                      type="number"
                      value={formData.perUserLimit}
                      onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})}
                      placeholder="Ilimitado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="validFrom">Válido Desde *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil">Válido Hasta</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      placeholder="Sin fecha de vencimiento"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ej: Descuento de verano 2025"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Cupón activo
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit">
                    {editingId ? 'Actualizar' : 'Crear'} Cupón
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setEditingId(null); resetForm() }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de cupones */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando cupones...</p>
          </div>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay cupones</h3>
              <p className="text-gray-600 mb-4">
                Crea tu primer cupón de descuento
              </p>
              <Button onClick={() => { setShowForm(true); setEditingId(null); resetForm() }}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Cupón
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-blue-600">{coupon.code}</h3>
                        {coupon.active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            Inactivo
                          </span>
                        )}
                      </div>

                      {coupon.description && (
                        <p className="text-gray-600 mb-3">{coupon.description}</p>
                      )}

                      <div className="grid md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Descuento</p>
                          <p className="font-semibold text-green-600">
                            {coupon.discountType === 'PERCENTAGE' 
                              ? `${coupon.discountValue}%` 
                              : formatCurrency(coupon.discountValue)}
                            {coupon.maxDiscount && ` (máx: ${formatCurrency(coupon.maxDiscount)})`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Usos</p>
                          <p className="font-semibold">
                            {coupon.usageCount} / {coupon.usageLimit || '∞'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Compra Mínima</p>
                          <p className="font-semibold">
                            {coupon.minPurchase ? formatCurrency(coupon.minPurchase) : 'Sin mínimo'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Válido desde: {new Date(coupon.validFrom).toLocaleDateString('es-PE')}
                        </div>
                        {coupon.validUntil && (
                          <div className="flex items-center gap-1">
                            hasta: {new Date(coupon.validUntil).toLocaleDateString('es-PE')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(coupon.id, coupon.active)}
                        title={coupon.active ? 'Desactivar' : 'Activar'}
                      >
                        {coupon.active ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </FeatureGuard>
  )
}

