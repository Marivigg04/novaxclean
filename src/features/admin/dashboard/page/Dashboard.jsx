import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, ShoppingCart, Users } from 'lucide-react'

import Sidebar from '@/shared/Sidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/features/admin/dashboard/components/Card'
import ChartFilters from '@/features/admin/dashboard/components/ChartFilters'
import Graphic from '@/features/admin/dashboard/components/Graphic'
import Map from '@/features/admin/dashboard/components/Map'
import productsSales from '@/features/admin/dashboard/data/productsSales.json'
import { footerLinks } from '@/components/landing/content'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const [active, setActive] = useState('ventas')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const categories = useMemo(() => {
    const unique = new Set(productsSales.products.map((item) => item.category))
    return Array.from(unique)
  }, [])

  const filteredProducts = useMemo(() => {
    const filtered = productsSales.products.filter((item) => {
      return selectedCategory === 'all' ? true : item.category === selectedCategory
    })

    return filtered.sort((a, b) => {
      return sortOrder === 'asc' ? a.soldTotal - b.soldTotal : b.soldTotal - a.soldTotal
    })
  }, [selectedCategory, sortOrder])

  const chartData = useMemo(() => {
    return {
      ...productsSales,
      products: filteredProducts,
    }
  }, [filteredProducts])

  return (
    <div className="flex min-h-screen bg-[var(--color-base-bg)] premium-mesh-bg">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}

      <Sidebar
        active={active}
        isOpen={isSidebarOpen}
        onSelect={(key) => {
          if (key === 'cerrar-sesion') {
            logout()
            setIsSidebarOpen(false)
            navigate('/')
            return
          }

          setActive(key)
          setIsSidebarOpen(false)
        }}
      />

      <main className="flex min-h-screen flex-1 flex-col overflow-auto">
        <Header onOpenAuth={() => {}} onOpenCart={() => {}} showCartButton={false} showSearch={false} className="md:left-72" />

        <div className="flex-1 px-4 py-6 pt-24 md:px-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card
                title="Ingresos"
                value="$12,450"
                description="Últimos 30 días"
                icon={DollarSign}
                trend={12.4}
              />

              <Card
                title="Ventas"
                value="1,245"
                description="Pedidos completados"
                icon={ShoppingCart}
                trend={-3.2}
              />

              <Card
                title="Usuarios"
                value="845"
                description="Usuarios activos"
                icon={Users}
                trend={8.1}
              />
            </div>

            <div className="mt-6 space-y-4">
              <ChartFilters
                categories={categories}
                selectedCategory={selectedCategory}
                selectedSort={sortOrder}
                onCategoryChange={setSelectedCategory}
                onSortChange={setSortOrder}
              />

              <div className="grid items-stretch gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="min-w-0 h-full">
                  <Graphic
                    data={chartData}
                    sortOrder={sortOrder}
                  />
                </div>

                <div className="min-w-0 h-full">
                  <Map />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer links={footerLinks} />
      </main>
    </div>
  )
}