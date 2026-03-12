import { useState, useEffect } from 'react'
import { api } from '../api/api.js'
import OrderRow from '../components/OrderRow.jsx'
import OrderForm from '../components/OrderForm.jsx'
import Modal from '../components/Modal.jsx'

// Цвета для статусов
const STATUS_COLORS = {
  'в обработке':  { bg: '#fff3cd', color: '#856404' },
  'доставляется': { bg: '#cce5ff', color: '#004085' },
  'доставлен':    { bg: '#d4edda', color: '#155724' },
  'отменён':      { bg: '#f8d7da', color: '#721c24' },
}

function getStatusStyle(name) {
  const key = name?.toLowerCase()
  return STATUS_COLORS[key] ?? { bg: '#f0f0f0', color: '#555' }
}

export default function OrdersPage({ user }) {
  const isAdmin = user?.role === 'admin'

  const [orders,        setOrders]        = useState([])
  const [lookups,       setLookups]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [editOrder,     setEditOrder]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [ords, lkps] = await Promise.all([
        api.get('/orders'),
        api.get('/lookups'),
      ])
      setOrders(ords)
      setLookups(lkps)
    } catch (err) {
      alert('Ошибка загрузки: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(order) {
    setDeleteLoading(true)
    try {
      await api.delete(`/orders/${order.id}`)
      setConfirmDelete(null)
      loadData()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  function handleSaved() {
    setEditOrder(null)
    loadData()
  }

  // Считаем количество заказов по каждому статусу
  const statusCounts = orders.reduce((acc, o) => {
    const s = o.status ?? 'Неизвестно'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontSize: 18 }}>Загрузка...</div>

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, margin: 0 }}>Заказы</h1>
          <p style={{ color: '#888', marginTop: 4, marginBottom: 0 }}>Всего: {orders.length}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setEditOrder('new')}
            style={{
              background: '#1a1a1a', color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 20px', fontSize: 15, fontWeight: 600,
            }}
          >
            + Добавить заказ
          </button>
        )}
      </div>

      {/* Счётчики по статусам */}
      {orders.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {Object.entries(statusCounts).map(([status, count]) => {
            const { bg, color } = getStatusStyle(status)
            return (
              <div key={status} style={{
                background: bg, color,
                borderRadius: 10, padding: '8px 16px',
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  background: color, color: bg,
                  borderRadius: '50%', width: 22, height: 22,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {count}
                </span>
                {status}
              </div>
            )
          })}
        </div>
      )}

      {/* Список заказов */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa', fontSize: 16 }}>
          Заказов пока нет
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => (
            <OrderRow
              key={o.id}
              order={o}
              isAdmin={isAdmin}
              onEdit={o => setEditOrder(o)}
              onDelete={o => setConfirmDelete(o)}
            />
          ))}
        </div>
      )}

      {/* Модалка добавления/редактирования */}
      {editOrder && lookups && (
        <Modal
          title={editOrder === 'new' ? 'Добавить заказ' : `Редактировать заказ ${editOrder.article}`}
          onClose={() => setEditOrder(null)}
        >
          <OrderForm
            order={editOrder === 'new' ? null : editOrder}
            lookups={lookups}
            onSave={handleSaved}
            onClose={() => setEditOrder(null)}
          />
        </Modal>
      )}

      {/* Подтверждение удаления */}
      {confirmDelete && (
        <Modal title="⚠️ Подтверждение удаления" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 16, color: '#444', marginBottom: 24, lineHeight: 1.6 }}>
            Вы действительно хотите удалить заказ <strong>{confirmDelete.article}</strong>?<br />
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
    </div>
  )
}