'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, Trash2, Pencil, Search, X } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  icon: string
}

interface AdminProduct {
  id: string
  name: string
  description: string
  image: string
  isPizza: boolean
  isActive: boolean
  sortOrder: number
  categoryId: string
  category: Category
  prices: { id: string; size: string; price: number; sortOrder: number }[]
  promotionId: string | null
}

interface ExtraItem {
  id: string
  name: string
  price: number
}

interface AdminPromotion {
  id: string
  title: string
  description: string
  promoPrice: number
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  createdAt: string
  updatedAt: string
  products: AdminProduct[]
}

interface ProductFormData {
  id?: string
  name: string
  description: string
  image: string
  isPizza: boolean
  categoryId: string
  isActive: boolean
  sortOrder: number
  prices: { id?: string; size: string; price: number; sortOrder: number }[]
}

interface PromotionFormData {
  id?: string
  title: string
  description: string
  promoPrice: number
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  productIds: string[]
}

// ─── Multi Select Component ──────────────────────────────────────────────────

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Seleccionar...',
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 h-auto min-h-[38px]"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 ? (
              <span className="text-gray-500 text-xs">{placeholder}</span>
            ) : (
              selected.map((id) => {
                const opt = options.find((o) => o.value === id)
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 border-amber-500/20"
                  >
                    {opt?.label ?? id}
                    <button
                      className="ml-1 hover:text-amber-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChange(selected.filter((s) => s !== id))
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-[#1a1a1a] border-amber-900/30" align="start">
        <Command className="bg-[#1a1a1a]">
          <CommandInput placeholder="Buscar producto..." className="text-xs" />
          <CommandEmpty>No se encontró producto.</CommandEmpty>
          <CommandGroup className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  if (selected.includes(option.value)) {
                    onChange(selected.filter((s) => s !== option.value))
                  } else {
                    onChange([...selected, option.value])
                  }
                }}
                className="text-xs text-gray-300 hover:bg-white/5 cursor-pointer"
              >
                <Check
                  className={`mr-2 h-3.5 w-3.5 ${
                    selected.includes(option.value) ? 'text-amber-400' : 'opacity-0'
                  }`}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Image Picker (subida + preview + URL manual) ───────────────────────────

function ImagePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al subir la imagen')
        return
      }
      setImgFailed(false)
      onChange(data.url)
    } catch (e) {
      console.error('Error uploading image:', e)
      setError('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
          {value && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Vista previa"
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="text-gray-600 text-[10px] text-center px-1">Sin imagen</span>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-amber-400 h-8 text-xs"
          >
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </Button>
          {error && <p className="text-[10px] text-red-400">{error}</p>}
        </div>
      </div>
      <Input
        value={value}
        onChange={(e) => {
          setImgFailed(false)
          onChange(e.target.value)
        }}
        className="bg-white/5 border-white/10 text-white text-xs focus:border-amber-500/50"
        placeholder="o pega una URL de imagen: https://..."
      />
    </div>
  )
}

// ─── Product Form Dialog ─────────────────────────────────────────────────────

function ProductFormDialog({
  open,
  onClose,
  categories,
  initialData,
  onSave,
}: {
  open: boolean
  onClose: () => void
  categories: Category[]
  initialData?: ProductFormData
  onSave: (data: ProductFormData) => void
}) {
  const isEdit = !!initialData?.id
  const [form, setForm] = useState<ProductFormData>(() =>
    initialData || {
      name: '',
      description: '',
      image: '',
      isPizza: false,
      categoryId: categories[0]?.id || '',
      isActive: true,
      sortOrder: 0,
      prices: [{ size: '', price: 0, sortOrder: 0 }],
    }
  )

  const addPrice = () => {
    setForm((prev) => ({
      ...prev,
      prices: [...prev.prices, { size: '', price: 0, sortOrder: prev.prices.length }],
    }))
  }

  const removePrice = (index: number) => {
    setForm((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }))
  }

  const updatePrice = (index: number, field: string, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      prices: prev.prices.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.categoryId || form.prices.length === 0) return
    onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#1a1a1a] border-amber-900/30 max-w-lg max-h-[85vh] overflow-y-auto sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-lg font-extrabold">
            {isEdit ? 'Editar Producto' : 'Añadir Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Nombre del Producto *
            </label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-white/5 border-white/10 text-white text-sm focus:border-amber-500/50"
              placeholder="Ej. Pizza Hawaiana"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Descripción
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/10 text-white text-sm focus:border-amber-500/50 resize-none"
              placeholder="Ingredientes o detalles"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                Categoría *
              </label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-amber-900/30">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-gray-300 text-xs focus:bg-white/5 focus:text-amber-400">
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                ¿Es Pizza?
              </label>
              <div className="flex items-center gap-2 h-[38px] px-3 bg-white/5 border border-white/10 rounded-md">
                <Switch
                  checked={form.isPizza}
                  onCheckedChange={(v) => setForm((prev) => ({ ...prev, isPizza: v }))}
                />
                <span className="text-xs text-gray-400">
                  {form.isPizza ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Imagen del Producto
            </label>
            <ImagePicker
              value={form.image}
              onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
            />
          </div>

          {/* Prices Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                Precios *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addPrice}
                className="h-6 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="text-xs">Agregar</span>
              </Button>
            </div>
            <div className="space-y-2">
              {form.prices.map((price, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    required
                    value={price.size}
                    onChange={(e) => updatePrice(index, 'size', e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white text-xs focus:border-amber-500/50 h-8"
                    placeholder="Tamaño (Chica, Mediana...)"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={price.price || ''}
                      onChange={(e) => updatePrice(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-white/5 border-white/10 text-amber-400 text-xs font-bold text-right focus:border-amber-500/50 h-8 pl-6"
                      placeholder="0"
                    />
                  </div>
                  {form.prices.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrice(index)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Promotion Form Dialog ──────────────────────────────────────────────────

function PromotionFormDialog({
  open,
  onClose,
  allProducts,
  initialData,
  onSave,
}: {
  open: boolean
  onClose: () => void
  allProducts: AdminProduct[]
  initialData?: PromotionFormData
  onSave: (data: PromotionFormData) => void
}) {
  const isEdit = !!initialData?.id
  const [form, setForm] = useState<PromotionFormData>(() =>
    initialData || {
      title: '',
      description: '',
      promoPrice: 0,
      isActive: true,
      validFrom: null,
      validTo: null,
      productIds: [],
    }
  )

  const productOptions = useMemo(
    () =>
      allProducts.map((p) => ({
        value: p.id,
        label: `${p.category.icon} ${p.name}`,
      })),
    [allProducts]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) return
    onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-[#1a1a1a] border-amber-900/30 max-w-lg max-h-[85vh] overflow-y-auto sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-lg font-extrabold">
            {isEdit ? 'Editar Promoción' : 'Añadir Promoción'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Título de la Promoción *
            </label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="bg-white/5 border-white/10 text-white text-sm focus:border-amber-500/50"
              placeholder="Ej. 2x1 Pizzas"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Descripción
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/10 text-white text-sm focus:border-amber-500/50 resize-none"
              placeholder="Detalles de la promoción"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Precio Especial *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.promoPrice || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, promoPrice: parseFloat(e.target.value) || 0 }))
                }
                className="bg-white/5 border-white/10 text-amber-400 font-bold text-sm text-right focus:border-amber-500/50 pl-7"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Productos Vinculados
            </label>
            <MultiSelect
              options={productOptions}
              selected={form.productIds}
              onChange={(ids) => setForm((prev) => ({ ...prev, productIds: ids }))}
              placeholder="Buscar y seleccionar productos..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
              Disponible
            </label>
            <div className="flex items-center gap-2 h-[38px] px-3 bg-white/5 border border-white/10 rounded-md">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
              />
              <span className="text-xs text-gray-400">{form.isActive ? 'Sí' : 'No'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                Fecha inicio
              </label>
              <Input
                type="date"
                value={form.validFrom || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, validFrom: e.target.value || null }))}
                className="bg-white/5 border-white/10 text-white text-xs focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                Fecha fin
              </label>
              <Input
                type="date"
                value={form.validTo || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, validTo: e.target.value || null }))}
                className="bg-white/5 border-white/10 text-white text-xs focus:border-amber-500/50"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              {isEdit ? 'Guardar Cambios' : 'Crear Promoción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Orilla Editor ───────────────────────────────────────────────────────────

function OrillaEditor({
  localPrices,
  setLocalPrices,
  savingPrice,
  onSave,
}: {
  orillaPrices: Record<string, number>
  localPrices: Record<string, string>
  setLocalPrices: (fn: (prev: Record<string, string>) => Record<string, string>) => void
  savingPrice: string | null
  onSave: (id: string, price: number, type: 'orilla') => void
}) {
  const [orillaData, setOrillaData] = useState<{ id: string; size: string; price: number }[]>([])

  useEffect(() => {
    fetch('/api/menu/admin')
      .then((r) => r.json())
      .then((data) => {
        if (data.orillaPrices) {
          setOrillaData(
            data.orillaPrices.map((op: { id: string; size: string; price: number }) => op)
          )
        }
      })
  }, [])

  return (
    <div className="space-y-2">
      {orillaData.map((op) => (
        <div
          key={op.id}
          className="flex items-center justify-between bg-white/3 rounded-xl border border-white/5 px-4 py-3"
        >
          <span className="text-sm text-white font-medium">{op.size}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">$</span>
            <input
              type="number"
              value={
                localPrices[op.id] !== undefined ? localPrices[op.id] : String(op.price)
              }
              onChange={(e) =>
                setLocalPrices((prev) => ({ ...prev, [op.id]: e.target.value }))
              }
              className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-amber-400 font-bold text-center focus:border-amber-500/50 outline-none"
              step="0.01"
              min="0"
            />
            <button
              onClick={() => onSave(op.id, op.price, 'orilla')}
              disabled={savingPrice === op.id}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {savingPrice === op.id ? '...' : 'Guardar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

export default function AdminPanelPro({
  categories: menuCategories,
  extras,
  orillaPrices,
  savingPrice,
  onUpdatePrice,
  onUpdateExtra,
  onUpdateOrilla,
  onRefresh,
  onClose,
  onLogout,
}: {
  categories: { id: string; name: string; icon: string; products: any[] }[]
  extras: ExtraItem[]
  orillaPrices: Record<string, number>
  savingPrice: string | null
  onUpdatePrice: (priceId: string, newPrice: number) => void
  onUpdateExtra: (extraId: string, newPrice: number) => void
  onUpdateOrilla: (orillaId: string, newPrice: number) => void
  onRefresh: () => void
  onClose: () => void
  onLogout: () => void
}) {
  const [activeTab, setActiveTab] = useState<
    'productos' | 'promociones' | 'extras' | 'orilla'
  >('productos')

  // ─── Products Tab State ──────────────────────────────────────────────
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductFormData | undefined>()
  const [productDialogKey, setProductDialogKey] = useState(0)

  // ─── Promotions Tab State ────────────────────────────────────────────
  const [promotions, setPromotions] = useState<AdminPromotion[]>([])
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<PromotionFormData | undefined>()
  const [promoDialogKey, setPromoDialogKey] = useState(0)

  // ─── Legacy Extras/Orilla State ──────────────────────────────────────
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({})

  // ─── Data Fetching ─────────────────────────────────────────────────
  const fetchAdminProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setAdminProducts(data)
    } catch (e) {
      console.error('Error fetching admin products:', e)
    }
  }

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promotions')
      const data = await res.json()
      setPromotions(data)
    } catch (e) {
      console.error('Error fetching promotions:', e)
    }
  }

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    onRefresh()
    fetchAdminProducts()
    fetchPromotions()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // ─── Price Handlers (legacy extras/orilla) ──────────────────────────
  const handleSave = (
    id: string,
    currentPrice: number,
    type: 'product' | 'extra' | 'orilla'
  ) => {
    const val = parseFloat(localPrices[id])
    if (isNaN(val) || val < 0) return
    if (type === 'product') onUpdatePrice(id, val)
    else if (type === 'extra') onUpdateExtra(id, val)
    else onUpdateOrilla(id, val)
    setLocalPrices((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const getPriceInput = (id: string, currentPrice: number) => {
    return localPrices[id] !== undefined ? localPrices[id] : String(currentPrice)
  }

  // ─── Product CRUD Handlers ──────────────────────────────────────────
  const handleProductSave = async (data: ProductFormData) => {
    try {
      if (data.id) {
        await fetch(`/api/products/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      await fetchAdminProducts()
      onRefresh()
      setProductDialogOpen(false)
      setEditingProduct(undefined)
    } catch (e) {
      console.error('Error saving product:', e)
    }
  }

  const handleProductDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      await fetchAdminProducts()
      onRefresh()
    } catch (e) {
      console.error('Error deleting product:', e)
    }
  }

  const handleToggleProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}/toggle`, { method: 'PATCH' })
      await fetchAdminProducts()
      onRefresh()
    } catch (e) {
      console.error('Error toggling product:', e)
    }
  }

  // ─── Promotion CRUD Handlers ───────────────────────────────────────
  const handlePromotionSave = async (data: PromotionFormData) => {
    try {
      if (data.id) {
        await fetch(`/api/promotions/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      await fetchPromotions()
      setPromoDialogOpen(false)
      setEditingPromotion(undefined)
    } catch (e) {
      console.error('Error saving promotion:', e)
    }
  }

  const handlePromotionDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return
    try {
      await fetch(`/api/promotions/${id}`, { method: 'DELETE' })
      await fetchPromotions()
    } catch (e) {
      console.error('Error deleting promotion:', e)
    }
  }

  // ─── Filtered Products ──────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return adminProducts.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || p.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [adminProducts, searchQuery, categoryFilter])

  const categoriesList = useMemo(() => {
    return menuCategories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))
  }, [menuCategories])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        // Solo cerrar si el click fue directamente sobre el backdrop, no si "burbujeó"
        // desde un componente portado (Select/Popover/Command/Dialog de Radix se renderizan
        // fuera de este árbol DOM y un click ahí puede registrarse como "outside").
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-4xl mx-4 my-8 bg-[#111] rounded-2xl border border-amber-900/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#111] z-10 border-b border-amber-900/20 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-amber-400">
              Panel de Administración
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gestiona productos, promociones, precios y más
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              Salir
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6 overflow-x-auto">
          {[
            { key: 'productos' as const, label: `Productos (${adminProducts.length})` },
            { key: 'promociones' as const, label: `Promociones (${promotions.length})` },
            { key: 'extras' as const, label: `Extras (${extras.length})` },
            { key: 'orilla' as const, label: 'Orilla Queso' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-amber-400 border-amber-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* ──── TAB: Productos ──────────────────────────────────────── */}
          {activeTab === 'productos' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500/50 outline-none"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-gray-300 text-xs">
                    <SelectValue placeholder="Categoría..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-amber-900/30">
                    <SelectItem value="all" className="text-gray-300 text-xs focus:bg-white/5 focus:text-amber-400">
                      Todas las categorías
                    </SelectItem>
                    {categoriesList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-gray-300 text-xs focus:bg-white/5 focus:text-amber-400">
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setEditingProduct(undefined)
                    setProductDialogKey(k => k + 1)
                    setProductDialogOpen(true)
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Producto
                </Button>
              </div>

              {/* Products Table */}
              <div className="bg-white/3 rounded-xl border border-white/5 overflow-hidden">
                {/* Table Header */}
                <div className="hidden sm:grid sm:grid-cols-[2fr,1fr,1.5fr,0.7fr,0.8fr] gap-2 px-4 py-2.5 bg-white/3 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>Nombre</span>
                  <span>Categoría</span>
                  <span>Precios</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No se encontraron productos
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="px-4 py-3 hover:bg-white/3 transition-colors"
                      >
                        {/* Desktop Row */}
                        <div className="hidden sm:grid sm:grid-cols-[2fr,1fr,1.5fr,0.7fr,0.8fr] gap-2 items-center">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-gray-600 truncate">
                              {product.description}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {product.category.icon} {product.category.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {product.prices.map((pr) => (
                              <Badge
                                key={pr.id}
                                variant="secondary"
                                className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/15 font-medium"
                              >
                                {pr.size} ${pr.price}
                              </Badge>
                            ))}
                          </div>
                          <div>
                            <button
                              onClick={() => handleToggleProduct(product.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                product.isActive
                                  ? 'bg-green-500'
                                  : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  product.isActive
                                    ? 'translate-x-4'
                                    : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct({
                                  id: product.id,
                                  name: product.name,
                                  description: product.description,
                                  image: product.image,
                                  isPizza: product.isPizza,
                                  categoryId: product.categoryId,
                                  isActive: product.isActive,
                                  sortOrder: product.sortOrder,
                                  prices: product.prices.map((pr) => ({
                                    id: pr.id,
                                    size: pr.size,
                                    price: pr.price,
                                    sortOrder: pr.sortOrder,
                                  })),
                                })
                                setProductDialogKey(k => k + 1)
                                setProductDialogOpen(true)
                              }}
                              className="p-1.5 rounded-md bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleProductDelete(product.id)}
                              className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Row */}
                        <div className="sm:hidden space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-gray-600 truncate">
                                {product.category.icon} {product.category.name}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => {
                                  setEditingProduct({
                                    id: product.id,
                                    name: product.name,
                                    description: product.description,
                                    image: product.image,
                                    isPizza: product.isPizza,
                                    categoryId: product.categoryId,
                                    isActive: product.isActive,
                                    sortOrder: product.sortOrder,
                                    prices: product.prices.map((pr) => ({
                                      id: pr.id,
                                      size: pr.size,
                                      price: pr.price,
                                      sortOrder: pr.sortOrder,
                                    })),
                                  })
                                  setProductDialogKey(k => k + 1)
                                  setProductDialogOpen(true)
                                }}
                                className="p-1.5 rounded-md bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleProductDelete(product.id)}
                                className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {product.prices.map((pr) => (
                                <Badge
                                  key={pr.id}
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/15 font-medium"
                                >
                                  {pr.size} ${pr.price}
                                </Badge>
                              ))}
                            </div>
                            <button
                              onClick={() => handleToggleProduct(product.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                product.isActive ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  product.isActive
                                    ? 'translate-x-4'
                                    : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──── TAB: Promociones ───────────────────────────────────── */}
          {activeTab === 'promociones' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingPromotion(undefined)
                    setPromoDialogKey(k => k + 1)
                    setPromoDialogOpen(true)
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Promoción
                </Button>
              </div>

              {promotions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No hay promociones creadas
                </div>
              ) : (
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="bg-white/3 rounded-xl border border-white/5 p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">
                              {promo.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 font-medium ${
                                promo.isActive
                                  ? 'bg-green-500/15 text-green-400 border-green-500/20'
                                  : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                              }`}
                            >
                              {promo.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                          {promo.description && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {promo.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingPromotion({
                                id: promo.id,
                                title: promo.title,
                                description: promo.description,
                                promoPrice: promo.promoPrice,
                                isActive: promo.isActive,
                                validFrom: promo.validFrom,
                                validTo: promo.validTo,
                                productIds: promo.products.map((p) => p.id),
                              })
                              setPromoDialogKey(k => k + 1)
                              setPromoDialogOpen(true)
                            }}
                            className="p-1.5 rounded-md bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePromotionDelete(promo.id)}
                            className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="text-amber-400 font-bold">
                          Precio: ${promo.promoPrice}
                        </span>
                        {(promo.validFrom || promo.validTo) && (
                          <span className="text-gray-500">
                            📅{' '}
                            {promo.validFrom
                              ? new Date(promo.validFrom).toLocaleDateString('es-MX')
                              : '...'}{' '}
                            –{' '}
                            {promo.validTo
                              ? new Date(promo.validTo).toLocaleDateString('es-MX')
                              : '...'}
                          </span>
                        )}
                        {promo.products.length > 0 && (
                          <span className="text-gray-500">
                            📦 {promo.products.length} producto
                            {promo.products.length > 1 ? 's' : ''} vinculado
                            {promo.products.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {promo.products.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {promo.products.map((p) => (
                            <Badge
                              key={p.id}
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0.5 bg-white/5 text-gray-400 border-white/10"
                            >
                              {p.category.icon} {p.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: Extras ─────────────────────────────────────────── */}
          {activeTab === 'extras' && (
            <div className="space-y-2">
              {extras.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between bg-white/3 rounded-xl border border-white/5 px-4 py-3"
                >
                  <span className="text-sm text-white font-medium">{ex.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">$</span>
                    <input
                      type="number"
                      value={getPriceInput(ex.id, ex.price)}
                      onChange={(e) =>
                        setLocalPrices((prev) => ({ ...prev, [ex.id]: e.target.value }))
                      }
                      className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-amber-400 font-bold text-center focus:border-amber-500/50 outline-none"
                      step="0.01"
                      min="0"
                    />
                    <button
                      onClick={() => handleSave(ex.id, ex.price, 'extra')}
                      disabled={savingPrice === ex.id}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                    >
                      {savingPrice === ex.id ? '...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ──── TAB: Orilla Queso ───────────────────────────────────── */}
          {activeTab === 'orilla' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">
                Precios de orilla rellena de queso por tamaño de pizza
              </p>
              <OrillaEditor
                orillaPrices={orillaPrices}
                localPrices={localPrices}
                setLocalPrices={setLocalPrices}
                savingPrice={savingPrice}
                onSave={handleSave}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Dialogs ──────────────────────────────────────────────────── */}
      <ProductFormDialog
        key={productDialogKey}
        open={productDialogOpen}
        onClose={() => {
          setProductDialogOpen(false)
          setEditingProduct(undefined)
        }}
        categories={categoriesList}
        initialData={editingProduct}
        onSave={handleProductSave}
      />

      <PromotionFormDialog
        key={promoDialogKey}
        open={promoDialogOpen}
        onClose={() => {
          setPromoDialogOpen(false)
          setEditingPromotion(undefined)
        }}
        allProducts={adminProducts}
        initialData={editingPromotion}
        onSave={handlePromotionSave}
      />
    </div>
  )
}
