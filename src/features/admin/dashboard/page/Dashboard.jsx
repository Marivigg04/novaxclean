import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, FileDown, ShoppingCart, Truck } from 'lucide-react'

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
import PageHeader from '@/shared/PageHeader'
import ReportGeneratorModal from '@/features/admin/reports/components/ReportGeneratorModal'

export default function Dashboard() {
  const [active, setActive] = useState('ventas')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
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

          if (key === 'ajustes') {
            setIsSidebarOpen(false)
            navigate('/admin/settings')
            return
          }

          if (key === 'inventario') {
            setActive('inventario')
            setIsSidebarOpen(false)
            navigate('/admin/inventory')
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
            <PageHeader title="Panel de control" subtitle="Visión general de ventas, ingresos y pedidos.">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
              >
                <FileDown className="h-4 w-4" />
                Generar Reporte
              </button>
            </PageHeader>
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
                title="Envíos realizados"
                value="845"
                description="Envíos completados"
                icon={Truck}
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

      <ReportGeneratorModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} preset="sales" />
    </div>
  )
}