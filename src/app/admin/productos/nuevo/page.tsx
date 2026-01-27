'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function NuevoProductoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'ROPA',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    brand: '',
    material: '',
    warranty: '',
    sizes: '',
    colors: '',
    images: '',
    featured: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Error al subir imagen')
        }

        const data = await response.json()
        newUrls.push(data.url)
      }

      setImageUrls(prev => [...prev, ...newUrls])
      toast({
        title: "Imágenes subidas",
        description: `${newUrls.length} imagen(es) subida(s) exitosamente.`,
        variant: "success",
      })
    } catch (error: any) {
      toast({
        title: "Error al subir imágenes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combinar imágenes subidas con URLs si las hay
      const allImages = [
        ...imageUrls,
        ...(formData.images ? formData.images.split(',').map(i => i.trim()).filter(i => i) : [])
      ]

      if (allImages.length === 0) {
        toast({
          title: "Imagen requerida",
          description: "Debes subir al menos una imagen para el producto.",
          variant: "destructive",
        })
        return
      }

      const data = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stock: parseInt(formData.stock),
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        images: allImages,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear producto')
      }

      toast({
        title: "Producto creado",
        description: "El producto se ha creado exitosamente.",
        variant: "success",
      })
      router.push('/admin')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el producto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="dark:text-white">Crear Nuevo Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-white">Información Básica</h3>
                
                <div>
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROPA">Ropa</SelectItem>
                        <SelectItem value="ELECTRONICA">Electrónica</SelectItem>
                        <SelectItem value="ALIMENTOS">Alimentos</SelectItem>
                        <SelectItem value="OTROS">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      placeholder="Ej: PROD-001"
                    />
                  </div>
                </div>
              </div>

              {/* Precios e Inventario */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-white">Precios e Inventario</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Precio (S/) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="comparePrice">Precio Antes (S/)</Label>
                    <Input
                      id="comparePrice"
                      name="comparePrice"
                      type="number"
                      step="0.01"
                      value={formData.comparePrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Atributos del Producto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-white">Atributos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Ej: Nike, Samsung"
                    />
                  </div>

                  <div>
                    <Label htmlFor="material">Material (para ropa)</Label>
                    <Input
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      placeholder="Ej: Algodón 100%"
                    />
                  </div>

                  <div>
                    <Label htmlFor="warranty">Garantía (para electrónica)</Label>
                    <Input
                      id="warranty"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleChange}
                      placeholder="Ej: 12 meses"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sizes">Tallas (separadas por comas)</Label>
                  <Input
                    id="sizes"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    placeholder="Ej: S, M, L, XL"
                  />
                </div>

                <div>
                  <Label htmlFor="colors">Colores (separados por comas)</Label>
                  <Input
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    placeholder="Ej: Rojo, Azul, Negro"
                  />
                </div>

                <div>
                  <Label>Imágenes del Producto *</Label>
                  
                  {/* Área de subida */}
                  <div className="mt-2">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingImages ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Subiendo...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold dark:text-gray-300">Click para subir</span> o arrastra imágenes aquí
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, WebP hasta 5MB (múltiples imágenes permitidas)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>

                  {/* Preview de imágenes subidas */}
                  {imageUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Opción alternativa: URLs (opcional) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                      O ingresar URLs de imágenes (opcional)
                    </summary>
                    <Textarea
                      id="images"
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
                      placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                      rows={2}
                      className="mt-2"
                    />
                  </details>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="featured">Producto Destacado</Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creando...' : 'Crear Producto'}
                </Button>
                <Link href="/admin" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

