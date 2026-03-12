import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/api.js'
import ProductCard from '../components/ProductCard.jsx'
import ProductRow from '../components/ProductRow.jsx'
import ProductForm from '../components/ProductForm.jsx'
import CartSidebar from '../components/CartSidebar.jsx'
import Modal from '../components/Modal.jsx'

export default function ProductsPage({ user }) {
  const role    = user?.role
  const isAdmin   = role === 'admin'
  const isManagerOrAdmin = role === 'manager' || role === 'admin'
  const isClient  = role === 'client'

  const [products,  setProducts]  = useState([])
  const [lookups,   setLookups]   = useState(null)
  const [loading,   setLoading]   = useState(true)

  // Фильтры (только для менеджера/админа)
  const [search,   setSearch]   = useState('')
  const [supplier, setSupplier] = useState('')
  const [sort,     setSort]     = useState('')

  // Модалки
  const [editProduct,    setEditProduct]    = useState(null)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  // Корзина
  const [cart,      setCart]      = useState({})
  const [cartOpen,  setCartOpen]  = useState(false)
  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [prods, lkps] = await Promise.all([
        api.get('/products'),
        api.get('/lookups'),
      ])
      setProducts(prods)
      setLookups(lkps)
    } catch (err) {
      alert('Ошибка загрузки данных: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Фильтрация и сортировка на клиенте
  const filtered = useMemo(() => {
    let list = [...products]

    if (isManagerOrAdmin && search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        [p.name, p.category, p.description, p.manufacturer, p.supplier]
          .some(v => v?.toLowerCase().includes(q))
      )
    }

    if (isManagerOrAdmin && supplier) {
      list = list.filter(p => p.supplier === supplier)
    }

    if (sort === 'stock_asc')  list.sort((a, b) => a.stock - b.stock)
    if (sort === 'stock_desc') list.sort((a, b) => b.stock - a.stock)

    return list
  }, [products, search, supplier, sort, isManagerOrAdmin])

  function addToCart(product) {
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
  }

  async function handleDelete(product) {
    setDeleteLoading(true)
    try {
      await api.delete(`/products/${product.id}`)
      setConfirmDelete(null)
      loadData()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  function handleSaved() {
    setEditProduct(null)
    loadData()
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontSize: 18 }}>Загрузка...</div>

  const suppliers = [...new Set(products.map(p => p.supplier))]

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>

      {/* Шапка страницы */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, margin: 0 }}>Каталог обуви</h1>
          <p style={{ color: '#888', marginTop: 4 }}>{products.length} позиций в ассортименте</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isClient && (
            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: '#c9a96e', border: 'none', borderRadius: 10,
                padding: '10px 20px', fontWeight: 700, fontSize: 15,
              }}
            >
              🛒 Корзина {cartCount > 0 && `(${cartCount})`}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                if (editProduct) { alert('Закройте текущее окно редактирования перед открытием нового'); return }
                setEditProduct('new')
              }}
              style={{
                background: '#1a1a1a', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 20px', fontSize: 15, fontWeight: 600,
              }}
            >
              + Добавить товар
            </button>
          )}
        </div>
      </div>

      {/* Фильтры — только для менеджера/админа */}
      {isManagerOrAdmin && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', background: '#f9f9f9', padding: 16, borderRadius: 14 }}>
          <input
            placeholder="🔍 Поиск по названию, категории, производителю..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14 }}
          />
          <select
            value={supplier}
            onChange={e => setSupplier(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14, background: '#fff' }}
          >
            <option value="">Все поставщики</option>
            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setSort(s => s === 'stock_asc' ? 'stock_desc' : 'stock_asc')}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14, background: '#fff' }}
          >
            {sort === 'stock_asc' ? '↑ По складу' : sort === 'stock_desc' ? '↓ По складу' : '⇅ Склад'}
          </button>
          {(search || supplier || sort) && (
            <button
              onClick={() => { setSearch(''); setSupplier(''); setSort('') }}
              style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14, background: '#fff', color: '#e74c3c' }}
            >
              ✕ Сбросить
            </button>
          )}
        </div>
      )}

      {/* Таблица — менеджер/админ */}
      {isManagerOrAdmin ? (
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                {['Фото', 'Наименование', 'Описание', 'Производитель', 'Поставщик', 'Цена', 'Ед.', 'Склад', 'Скидка', isAdmin ? 'Действия' : ''].map(h => (
                  <th key={h} style={{ padding: '14px 12px', textAlign: 'left', fontFamily: "'Playfair Display', serif", fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#888' }}>Товары не найдены</td></tr>
                : filtered.map(p => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      isAdmin={isAdmin}
                      onEdit={p => {
                        if (editProduct) { alert('Закройте текущее окно редактирования'); return }
                        setEditProduct(p)
                      }}
                      onDelete={p => setConfirmDelete(p)}
                    />
                  ))
              }
            </tbody>
          </table>
        </div>

      ) : (
        /* Карточки — гость и клиент */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isClient={isClient}
              cartQty={cart[p.id] || 0}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}

      {/* Модалка добавления/редактирования */}
      {editProduct && lookups && (
        <Modal
          title={editProduct === 'new' ? 'Добавить товар' : `Редактировать: ${editProduct.name}`}
          onClose={() => setEditProduct(null)}
          wide
        >
          <ProductForm
            product={editProduct === 'new' ? null : editProduct}
            lookups={lookups}
            onSave={handleSaved}
            onClose={() => setEditProduct(null)}
          />
        </Modal>
      )}

      {/* Модалка подтверждения удаления */}
      {confirmDelete && (
        <Modal title="⚠️ Подтверждение удаления" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 16, color: '#444', marginBottom: 24, lineHeight: 1.6 }}>
            Вы действительно хотите удалить <strong>«{confirmDelete.name}»</strong>?<br />
            Это действие нельзя отменить.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleDelete(confirmDelete)}
              disabled={deleteLoading}
              style={{ flex: 1, padding: '12px 0', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600 }}
            >
              {deleteLoading ? 'Удаление...' : 'Удалить'}
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              style={{ flex: 1, padding: '12px 0', background: '#f0f0f0', border: 'none', borderRadius: 10, fontSize: 15 }}
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}

      {/* Корзина */}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          products={products}
          onClose={() => setCartOpen(false)}
          onOrderPlaced={() => { setCart({}); loadData() }}
        />
      )}
    </div>
  )
}