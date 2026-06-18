'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import GuidedTour from '@/components/GuidedTour'
import AdminPanelPro from '@/components/AdminPanelPro'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id?: string
  name: string
  description: string
  prices: { id?: string; size: string; price: number }[]
  image?: string
  isPizza?: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  products: Product[]
}

interface CustomerData {
  name: string
  phone: string
  address: string
  references: string
}

interface MitadOption {
  name: string
  extraCost: number
}

interface ExtraItem {
  id: string
  name: string
  price: number
}

interface OrillaPriceItem {
  id: string
  size: string
  price: number
}

// ─── Constants (structural, not prices) ──────────────────────────────────────

const mitadClasicas: MitadOption[] = [
  { name: "Nito's", extraCost: 0 },
  { name: 'Clásica', extraCost: 0 },
  { name: 'Hawaiana', extraCost: 0 },
  { name: 'Mágica', extraCost: 0 },
  { name: 'Fiesta', extraCost: 0 },
  { name: 'Rastapizza', extraCost: 0 },
  { name: 'Mexicana', extraCost: 0 },
  { name: 'Suprema', extraCost: 0 },
  { name: 'Carnes Frías', extraCost: 0 },
]

const mitadEspeciales: MitadOption[] = [
  { name: 'Especial', extraCost: 10 },
  { name: 'Al Pastor', extraCost: 10 },
  { name: "Nito's Especial", extraCost: 10 },
  { name: '4 Quesos', extraCost: 10 },
  { name: 'Costeña', extraCost: 10 },
]

const todasMitadOptions: MitadOption[] = [...mitadClasicas, ...mitadEspeciales]

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  // Menu data
  const [menuCategories, setMenuCategories] = useState<Category[]>([])
  const [extrasList, setExtrasList] = useState<ExtraItem[]>([])
  const [orillaQuesoPrice, setOrillaQuesoPrice] = useState<Record<string, number>>({})
  const [whatsappNumber, setWhatsappNumber] = useState('529514618850')
  const [loading, setLoading] = useState(true)

  // UI state
  const [activeCategory, setActiveCategory] = useState('')
  const [orderMode, setOrderMode] = useState<'domicilio' | 'recoger'>('recoger')
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState<{ product: Product; categoryName: string } | null>(null)
  const categorySliderRef = useRef<HTMLDivElement>(null)

  // Admin state
  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [savingPrice, setSavingPrice] = useState<string | null>(null)

  // Fetch menu data
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/menu')
        const data = await res.json()
        if (data.categories) {
          setMenuCategories(data.categories)
          if (data.categories.length > 0 && !activeCategory) {
            setActiveCategory(data.categories[0].id)
          }
        }
      } catch (e) {
        console.error('Error fetching menu:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  // Persist customer data
  useEffect(() => {
    const saved = localStorage.getItem('nitos-customer-data')
    if (saved) {
      try { setCustomerData(JSON.parse(saved)) } catch (e) { /* ignore */ }
    }
    const savedAdmin = sessionStorage.getItem('nitos-admin')
    if (savedAdmin === 'true') setIsAdmin(true)
  }, [])

  const saveCustomerData = (data: CustomerData) => {
    setCustomerData(data)
    localStorage.setItem('nitos-customer-data', JSON.stringify(data))
    setIsAddressModalOpen(false)
  }

  const handleOrderModeChange = (mode: 'domicilio' | 'recoger') => {
    setOrderMode(mode)
    if (mode === 'domicilio' && !customerData) setIsAddressModalOpen(true)
  }

  // Intersection observer
  useEffect(() => {
    if (menuCategories.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('cat-', '')
            setActiveCategory(id)
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    menuCategories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [menuCategories])

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId)
    const el = document.getElementById(`cat-${catId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    const tabEl = document.getElementById(`tab-${catId}`)
    if (tabEl && categorySliderRef.current) {
      tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  const openProduct = useCallback((product: Product, categoryName: string) => {
    setModalProduct({ product, categoryName })
  }, [])

  const closeModal = useCallback(() => setModalProduct(null), [])

  // ─── WhatsApp helpers ──────────────────────────────────────────────────────

  function buildWhatsAppUrl(message: string): string {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  function buildProductWhatsAppUrl(
    productName: string, categoryName: string, size: string, price: number,
    options?: {
      mitad?: string; extras?: string[]; orillaQueso?: boolean; orillaPrice?: number
      orderMode?: 'domicilio' | 'recoger'; customerData?: CustomerData
    }
  ): string {
    let msg = `👋 Hola, vengo de Nito's Pizza. Me gustaría ordenar:\n\n`
    msg += `🍕 *${productName}* (${categoryName})\n`
    msg += `📏 Tamaño: ${size}\n`
    if (options?.orderMode) {
      msg += `🚚 Modo: ${options.orderMode === 'domicilio' ? 'A Domicilio 🏠' : 'Recoger en Tienda 🏁'}\n`
    }
    if (options?.customerData && options.orderMode === 'domicilio') {
      msg += `\n👤 *Datos de entrega:*\n`
      msg += `📝 Nombre: ${options.customerData.name}\n`
      msg += `📞 Tel: ${options.customerData.phone}\n`
      msg += `📍 Dir: ${options.customerData.address}\n`
      if (options.customerData.references) msg += `🏠 Ref: ${options.customerData.references}\n`
    }
    if (options?.mitad) msg += `✨ Mitad y mitad: ${options.mitad}\n`
    if (options?.extras && options.extras.length > 0) msg += `➕ Extras: ${options.extras.join(', ')}\n`
    if (options?.orillaQueso) msg += `🧀 Orilla rellena de queso (+$${options.orillaPrice})\n`
    const totalExtras = (options?.orillaPrice ?? 0)
    msg += `\n💲 Total: $${price + totalExtras}.00 MXN`
    return buildWhatsAppUrl(msg)
  }

  function buildGeneralWhatsAppUrl(orderMode?: 'domicilio' | 'recoger', customerData?: CustomerData): string {
    let msg = `👋 Hola, vengo de Nito's Pizza.`
    if (orderMode) msg += ` Me gustaría hacer un pedido para ${orderMode === 'domicilio' ? 'domicilio' : 'recoger'}.`
    if (orderMode === 'domicilio' && customerData) {
      msg += `\n\n👤 *Mis datos:*\n`
      msg += `📝 Nombre: ${customerData.name}\n📞 Tel: ${customerData.phone}\n📍 Dir: ${customerData.address}\n`
      if (customerData.references) msg += `🏠 Ref: ${customerData.references}\n`
    }
    return buildWhatsAppUrl(msg)
  }

  // ─── Admin handlers ────────────────────────────────────────────────────────

  const handleAdminLogin = async () => {
    setAdminError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })
      const data = await res.json()
      if (data.success) {
        setIsAdmin(true)
        sessionStorage.setItem('nitos-admin', 'true')
        setShowAdmin(true)
      } else {
        setAdminError(data.error || 'Contraseña incorrecta')
      }
    } catch { setAdminError('Error de conexión') }
  }

  const handleUpdatePrice = async (priceId: string, newPrice: number) => {
    setSavingPrice(priceId)
    try {
      const res = await fetch('/api/menu/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, price: newPrice })
      })
      const data = await res.json()
      if (data.success) {
        setMenuCategories(prev => prev.map(cat => ({
          ...cat,
          products: cat.products.map(p => ({
            ...p,
            prices: p.prices.map(pr => pr.id === priceId ? { ...pr, price: newPrice } : pr)
          }))
        })))
      }
    } catch (e) { console.error(e) }
    setSavingPrice(null)
  }

  const handleUpdateExtra = async (extraId: string, newPrice: number) => {
    setSavingPrice(extraId)
    try {
      const res = await fetch('/api/menu/extras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraId, price: newPrice })
      })
      const data = await res.json()
      if (data.success) {
        setExtrasList(prev => prev.map(ex => ex.id === extraId ? { ...ex, price: newPrice } : ex))
      }
    } catch (e) { console.error(e) }
    setSavingPrice(null)
  }

  const handleUpdateOrilla = async (orillaId: string, newPrice: number) => {
    setSavingPrice(orillaId)
    try {
      const res = await fetch('/api/menu/orilla', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orillaId, price: newPrice })
      })
      const data = await res.json()
      if (data.success) {
        // Re-fetch admin data to update orilla prices
        const adminRes = await fetch('/api/menu/admin')
        const adminData = await adminRes.json()
        if (adminData.orillaPrices) {
          const newMap: Record<string, number> = {}
          for (const op of adminData.orillaPrices) newMap[op.size] = op.price
          setOrillaQuesoPrice(newMap)
        }
      }
    } catch (e) { console.error(e) }
    setSavingPrice(null)
  }

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/menu/admin')
      const data = await res.json()
      if (data.extras) setExtrasList(data.extras)
      if (data.orillaPrices) {
        const newMap: Record<string, number> = {}
        for (const op of data.orillaPrices) newMap[op.size] = op.price
        setOrillaQuesoPrice(newMap)
      }
      if (data.config?.whatsappNumber) setWhatsappNumber(data.config.whatsappNumber)
    } catch (e) { console.error(e) }
  }

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-400 font-bold text-lg">Cargando menú...</p>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* ── Admin Login Modal ──────────────────────────────────────── */}
      {showAdmin && !isAdmin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setShowAdmin(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm mx-4 border border-amber-900/30" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-amber-400 mb-4">Panel de Administración</h3>
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none mb-3"
            />
            {adminError && <p className="text-red-400 text-xs mb-3">{adminError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowAdmin(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 font-bold text-sm hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={handleAdminLogin} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-600 transition-colors">Entrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Panel ────────────────────────────────────────────── */}
      {showAdmin && isAdmin && <AdminPanelPro
        categories={menuCategories}
        extras={extrasList}
        orillaPrices={orillaQuesoPrice}
        savingPrice={savingPrice}
        onUpdatePrice={handleUpdatePrice}
        onUpdateExtra={handleUpdateExtra}
        onUpdateOrilla={handleUpdateOrilla}
        onRefresh={loadAdminData}
        onClose={() => setShowAdmin(false)}
        onLogout={() => { setIsAdmin(false); sessionStorage.removeItem('nitos-admin'); setShowAdmin(false) }}
      />}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]">
        <div className="bg-gradient-to-r from-[#1a1200] via-[#2a1a00] to-[#1a1200] relative overflow-hidden border-b border-amber-800/30">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #FFB800 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3 relative z-10">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500/30 overflow-hidden flex-shrink-0 bg-amber-900/20 flex items-center justify-center">
              <img src="https://assets.olaclick.app/companies/logos/1fb27f1a-a3e9-4766-9baa-764257321e14.jpg" alt="Nito's Pizza Logo" className="w-full h-full object-cover rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-amber-400 font-extrabold text-xl tracking-tight leading-none">NITO&apos;S PIZZA</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Abierto
                </span>
                <span className="text-gray-500 text-[10px] truncate">Tlacolula de Matamoros, Oax.</span>
              </div>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-center">
              <button onClick={() => handleOrderModeChange('recoger')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${orderMode === 'recoger' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>🏁 Recoger</button>
              <button onClick={() => handleOrderModeChange('domicilio')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${orderMode === 'domicilio' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>🏠 Domicilio</button>
            </div>
            <div className="relative">
              <a href={buildGeneralWhatsAppUrl(orderMode, customerData || undefined)} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (orderMode === 'domicilio' && !customerData) { e.preventDefault(); setIsAddressModalOpen(true) } }} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/20" title="Pedir por WhatsApp">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              {orderMode === 'domicilio' && customerData && (
                <button onClick={() => setIsAddressModalOpen(true)} className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border border-black flex items-center justify-center text-[8px] text-black font-bold" title="Editar dirección">✎</button>
              )}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="relative bg-[#111] border-b border-amber-900/10">
          <div id="categorias-step" ref={categorySliderRef} className="flex overflow-x-auto scrollbar-hide gap-0 px-2 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {menuCategories.map((cat) => (
              <button key={cat.id} id={`tab-${cat.id}`} onClick={() => scrollToCategory(cat.id)} className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/20' : 'text-gray-500 hover:text-amber-400 hover:bg-white/5'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Promo Banner ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-3 px-4 animate-promo-glow">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🔥</span>
            <span className="text-xs font-black uppercase tracking-wider text-yellow-200 drop-shadow-sm">PROMO PERMANENTE</span>
            <span className="text-base animate-pulse">🔥</span>
          </div>
          <p className="text-sm sm:text-base font-extrabold tracking-wide drop-shadow-sm">
            Pizza Grande Pepperoni <span className="text-yellow-200 text-lg sm:text-xl">$149</span>
          </p>
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Solo aplica para comedor o para llevar</p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 space-y-8 pb-24">
        {menuCategories.map((cat) => (
          <CategorySection key={cat.id} category={cat} onOpenProduct={openProduct} />
        ))}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-black border-t border-amber-900/20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-3">
            <h3 className="font-extrabold text-lg text-amber-400">NITO&apos;S PIZZA</h3>
            <p className="text-gray-600 text-xs text-center">Internacional Cristóbal Colón, Tercera Secc, 70400<br />Tlacolula de Matamoros, Oax., México</p>
            <div className="flex items-center gap-3 mt-2">
              <a href="https://www.facebook.com/people/Nitos-pizza/100086304049257/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-600 transition-colors text-gray-400 hover:text-white" title="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={buildGeneralWhatsAppUrl(orderMode)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition-colors" title="WhatsApp">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://maps.app.goo.gl/sjRUxCAHTdcB42fT6" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500 transition-colors text-gray-400 hover:text-white" title="Cómo llegar">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </a>
            </div>
            <a href="tel:+529514618850" className="text-gray-600 text-xs hover:text-amber-400 transition-colors mt-1">📞 951 725 0827</a>

            {/* Admin button in footer */}
            <button
              onClick={() => { if (isAdmin) { setShowAdmin(!showAdmin) } else { setShowAdmin(true) } }}
              className="mt-2 text-gray-700 hover:text-amber-600 transition-colors text-[10px] flex items-center gap-1"
              title="Panel de administración"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Admin
            </button>
          </div>
        </div>
        <div className="border-t border-white/5 py-4 mt-4">
          <a href="https://www.synkdata.online" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-gray-600 hover:text-amber-400 transition-colors text-[11px] font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Powered by <span className="font-bold">SynkData</span>
          </a>
        </div>
      </footer>

      {/* ── Floating WhatsApp Button ─────────────────────────────────── */}
      <a id="carrito-step" href={buildGeneralWhatsAppUrl(orderMode, customerData || undefined)} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (orderMode === 'domicilio' && !customerData) { e.preventDefault(); setIsAddressModalOpen(true) } }} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white font-bold pl-4 pr-5 py-3 rounded-full shadow-xl shadow-green-500/30" title="Pedir por WhatsApp">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span className="text-sm">Pedir</span>
        <span id="checkout-step" className="sr-only"></span>
      </a>

      {/* ── Product Config Modal ─────────────────────────────────────── */}
      {modalProduct && (
        (modalProduct.product.isPizza ?? (modalProduct.product.prices.length > 1)) ? (
          <PizzaConfigModal product={modalProduct.product} categoryName={modalProduct.categoryName} orderMode={orderMode} customerData={customerData || undefined} onClose={closeModal} onOpenAddress={() => setIsAddressModalOpen(true)} extrasList={extrasList} orillaQuesoPrice={orillaQuesoPrice} />
        ) : (
          <SimpleOrderModal product={modalProduct.product} categoryName={modalProduct.categoryName} orderMode={orderMode} customerData={customerData || undefined} onClose={closeModal} onOpenAddress={() => setIsAddressModalOpen(true)} />
        )
      )}

      {isAddressModalOpen && (
        <AddressModal onSave={saveCustomerData} onClose={() => setIsAddressModalOpen(false)} initialData={customerData || undefined} />
      )}

      <GuidedTour />
    </div>
  )

  // ─── Pizza Config Modal ────────────────────────────────────────────────

  function PizzaConfigModal({ product, categoryName, orderMode, customerData, onClose, onOpenAddress, extrasList, orillaQuesoPrice }: {
    product: Product; categoryName: string; orderMode: 'domicilio' | 'recoger'; customerData?: CustomerData
    onClose: () => void; onOpenAddress: () => void; extrasList: ExtraItem[]; orillaQuesoPrice: Record<string, number>
  }) {
    const [config, setConfig] = useState({ selectedSize: 0, mitadMode: 'entera' as 'entera' | 'mitad', selectedMitad: '', selectedExtras: [] as string[], orillaQueso: false })

    const isPizza = product.isPizza ?? product.prices.length > 1
    const currentSize = product.prices[config.selectedSize]?.size ?? product.prices[0].size
    const currentPrice = product.prices[config.selectedSize]?.price ?? product.prices[0].price

    const mitadExtra = config.mitadMode === 'mitad' && config.selectedMitad ? (todasMitadOptions.find(o => o.name === config.selectedMitad)?.extraCost ?? 0) : 0
    const extrasCost = config.selectedExtras.reduce((sum, name) => { const ex = extrasList.find(e => e.name === name); return sum + (ex?.price ?? 0) }, 0)
    const orillaCost = config.orillaQueso ? (orillaQuesoPrice[currentSize] ?? 0) : 0
    const totalPrice = currentPrice + mitadExtra + extrasCost + orillaCost

    const toggleExtra = (name: string) => setConfig(prev => ({ ...prev, selectedExtras: prev.selectedExtras.includes(name) ? prev.selectedExtras.filter(n => n !== name) : [...prev.selectedExtras, name] }))

    const handleOrder = () => {
      if (orderMode === 'domicilio' && !customerData) { onOpenAddress(); return }
      const url = buildProductWhatsAppUrl(product.name, categoryName, currentSize, currentPrice + mitadExtra + extrasCost, { mitad: config.mitadMode === 'mitad' ? config.selectedMitad : undefined, extras: config.selectedExtras.length > 0 ? config.selectedExtras : undefined, orillaQueso: config.orillaQueso, orillaPrice: orillaCost, orderMode, customerData })
      window.open(url, '_blank'); onClose()
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full sm:max-w-md bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-amber-900/30" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-[#1a1a1a] z-10 border-b border-amber-900/20 px-4 pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0"><h3 className="font-extrabold text-lg text-amber-400">{product.name}</h3><p className="text-xs text-gray-400 mt-0.5">{product.description}</p></div>
              <button onClick={onClose} className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 flex-shrink-0 transition-colors">✕</button>
            </div>
          </div>
          <div className="px-4 py-3 space-y-4">
            {isPizza && (
              <div>
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide">Tamaño</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {product.prices.map((p, i) => (
                    <button key={p.size} onClick={() => setConfig(prev => ({ ...prev, selectedSize: i }))} className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${i === config.selectedSize ? 'bg-amber-500 text-black border-amber-500 shadow-sm shadow-amber-500/20' : 'bg-transparent text-gray-300 border-gray-700 hover:border-amber-600'}`}>
                      {p.size} <span className={`font-normal ${i === config.selectedSize ? 'text-black/70' : 'text-gray-500'}`}>${p.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isPizza && (
              <div>
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide">Entera o Mitad y Mitad</label>
                <div className="flex gap-2 mt-1.5">
                  <button onClick={() => setConfig(prev => ({ ...prev, mitadMode: 'entera', selectedMitad: '' }))} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${config.mitadMode === 'entera' ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-gray-300 border-gray-700 hover:border-amber-600'}`}>Entera</button>
                  <button onClick={() => setConfig(prev => ({ ...prev, mitadMode: 'mitad' }))} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${config.mitadMode === 'mitad' ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-gray-300 border-gray-700 hover:border-amber-600'}`}>Mitad y Mitad (+$10)</button>
                </div>
                {config.mitadMode === 'mitad' && (
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-500 mb-1.5">Clásicas (sin costo extra):</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {mitadClasicas.map(opt => (
                        <button key={opt.name} onClick={() => setConfig(prev => ({ ...prev, selectedMitad: opt.name }))} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${config.selectedMitad === opt.name ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-gray-300 border-gray-700 hover:border-amber-600'}`}>{opt.name}</button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mb-1.5">Especiales (+$10):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mitadEspeciales.map(opt => (
                        <button key={opt.name} onClick={() => setConfig(prev => ({ ...prev, selectedMitad: opt.name }))} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${config.selectedMitad === opt.name ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-gray-300 border-gray-700 hover:border-amber-600'}`}>{opt.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isPizza && extrasList.length > 0 && (
              <div>
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide">Ingredientes Extra</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {extrasList.map(ex => (
                    <button key={ex.name} onClick={() => toggleExtra(ex.name)} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${config.selectedExtras.includes(ex.name) ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-gray-300 border-gray-700 hover:border-amber-600'}`}>
                      {ex.name} +${ex.price}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isPizza && (
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-xs font-bold text-amber-400">🧀 Orilla rellena de queso</span>
                <button onClick={() => setConfig(prev => ({ ...prev, orillaQueso: !prev.orillaQueso }))} className={`w-11 h-6 rounded-full transition-colors relative ${config.orillaQueso ? 'bg-amber-500' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${config.orillaQueso ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            )}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between text-sm font-extrabold text-white"><span>Total</span><span className="text-amber-400">${totalPrice}</span></div>
              {mitadExtra > 0 && <p className="text-[10px] text-gray-500 mt-1">+${mitadExtra} por mitad especial</p>}
              {extrasCost > 0 && <p className="text-[10px] text-gray-500">+${extrasCost} en extras</p>}
              {orillaCost > 0 && <p className="text-[10px] text-gray-500">+${orillaCost} orilla de queso</p>}
            </div>
          </div>
          <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-amber-900/20 px-4 py-3">
            <button onClick={handleOrder} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-[0.98] transition-all text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Pedir por WhatsApp ${totalPrice}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Simple Order Modal ─────────────────────────────────────────────────

  function SimpleOrderModal({ product, categoryName, orderMode, customerData, onClose, onOpenAddress }: {
    product: Product; categoryName: string; orderMode: 'domicilio' | 'recoger'; customerData?: CustomerData; onClose: () => void; onOpenAddress: () => void
  }) {
    const [selectedSize, setSelectedSize] = useState(0)
    const isMultiSize = product.prices.length > 1
    const currentSize = product.prices[selectedSize]?.size ?? product.prices[0].size
    const currentPrice = product.prices[selectedSize]?.price ?? product.prices[0].price

    const handleOrder = () => {
      if (orderMode === 'domicilio' && !customerData) { onOpenAddress(); return }
      const url = buildProductWhatsAppUrl(product.name, categoryName, currentSize, currentPrice, { orderMode, customerData })
      window.open(url, '_blank'); onClose()
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full sm:max-w-md bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-amber-900/30" onClick={e => e.stopPropagation()}>
          <div className="px-4 pt-4 pb-3 border-b border-amber-900/20">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0"><h3 className="font-extrabold text-lg text-amber-400">{product.name}</h3><p className="text-xs text-gray-400 mt-0.5">{product.description}</p></div>
              <button onClick={onClose} className="ml-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 flex-shrink-0 transition-colors">✕</button>
            </div>
          </div>
          <div className="px-4 py-4 space-y-4">
            {isMultiSize && (
              <div>
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide">Tamaño</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {product.prices.map((p, i) => (
                    <button key={p.size} onClick={() => setSelectedSize(i)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${i === selectedSize ? 'bg-amber-500 text-black border-amber-500 shadow-sm shadow-amber-500/20' : 'bg-transparent text-gray-300 border-gray-700 hover:border-amber-600'}`}>
                      {p.size} <span className={`font-normal ${i === selectedSize ? 'text-black/70' : 'text-gray-500'}`}>${p.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between text-sm font-extrabold text-white"><span>Total</span><span className="text-amber-400">${currentPrice}</span></div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-amber-900/20 px-4 py-3">
            <button onClick={handleOrder} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-[0.98] transition-all text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Pedir por WhatsApp ${currentPrice}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Product Card ─────────────────────────────────────────────────────

  function ProductCard({ product, categoryName, onOpenConfig }: { product: Product; categoryName: string; onOpenConfig: () => void }) {
    const [imgError, setImgError] = useState(false)
    const isPizza = product.isPizza ?? product.prices.length > 1
    const minPrice = Math.min(...product.prices.map(p => p.price))

    return (
      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-amber-900/20 hover:border-amber-700/40 transition-all duration-200 flex cursor-pointer active:scale-[0.99] shadow-lg shadow-black/30" onClick={onOpenConfig}>
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-[#222]">
          {product.image && !imgError ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-amber-900/20 to-red-900/10">🍕</div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-3 min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{product.description}</p>
          {isPizza && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Mitad y mitad</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Orilla queso</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-green-500/15 text-green-400 border border-green-500/20">Extras</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div>
              <span className="text-amber-400 font-extrabold text-base">${minPrice}</span>
              {isPizza && <span className="text-[10px] text-gray-600 ml-0.5">desde</span>}
              <span className="text-[10px] text-gray-600 ml-0.5">MXN</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 text-black">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Address Modal ────────────────────────────────────────────────────

  function AddressModal({ onSave, onClose, initialData }: { onSave: (data: CustomerData) => void; onClose: () => void; initialData?: CustomerData }) {
    const [formData, setFormData] = useState<CustomerData>(initialData || { name: '', phone: '', address: '', references: '' })
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (formData.name && formData.phone && formData.address) onSave(formData) }

    return (
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div className="relative w-full sm:max-w-md bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-amber-900/30" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-[#1a1a1a] z-10 border-b border-amber-900/20 px-4 pt-4 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-amber-400">Datos para Domicilio</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Nombre Completo *</label>
              <input required type="text" placeholder="Ej. Juan Pérez" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Número de Teléfono *</label>
              <input required type="tel" placeholder="Ej. 951 123 4567" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Dirección de Entrega *</label>
              <textarea required placeholder="Calle, número, colonia..." value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 outline-none transition-all h-24 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Referencias (Opcional)</label>
              <input type="text" placeholder="Ej. Casa frente al parque, portón azul" value={formData.references} onChange={e => setFormData(prev => ({ ...prev, references: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 outline-none transition-all" />
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-black font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 uppercase tracking-widest">Guardar y Continuar</button>
              <p className="text-[10px] text-center text-gray-500 mt-3 font-medium">* Estos datos solo se usarán para enviar tu pedido por WhatsApp.</p>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ─── Category Section ────────────────────────────────────────────────

  function CategorySection({ category, onOpenProduct }: { category: Category; onOpenProduct: (product: Product, categoryName: string) => void }) {
    return (
      <section id={`cat-${category.id}`} className="scroll-mt-28">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{category.icon}</span>
          <h2 className="text-sm sm:text-base font-extrabold text-amber-400 uppercase tracking-tight">{category.name}</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-700/40 to-transparent ml-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {category.products.map((product) => (
            <ProductCard key={product.name} product={product} categoryName={category.name} onOpenConfig={() => onOpenProduct(product, category.name)} />
          ))}
        </div>
      </section>
    )
  }
}

