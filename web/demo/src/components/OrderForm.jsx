import { useState } from 'react'
import { api } from '../api/api.js'

export default function OrderForm({ order, lookups, onSave, onClose }) {
  const isEdit = !!order

  const [form, setForm] = useState({
    statusId:     order?.statusId     ?? lookups.orderStatuses[0]?.id ?? 1,
    address:      order?.address      ?? '',
    orderDate:    order?.orderDate    ?? new Date().toISOString().split('T')[0],
    deliveryDate: order?.deliveryDate ?? '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.address.trim())  e.address      = 'Укажите адрес пункта выдачи'
    if (!form.deliveryDate)    e.deliveryDate  = 'Укажите дату доставки'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      const body = {
        statusId:     +form.statusId,
        address:      form.address,
        orderDate:    form.orderDate,
        deliveryDate: form.deliveryDate || null,
      }

      if (isEdit) {
        await api.put(`/orders/${order.id}`, body)
      } else {
        // Новый заказ через форму (от имени администратора)
        await api.post('/orders', { ...body, items: [], clientId: null })
      }

      onSave()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = (field, label, type = 'text') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: `1.5px solid ${errors[field] ? '#e74c3c' : '#e0e0e0'}`,
          fontSize: 14,
        }}
      />
      {errors[field] && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 3 }}>⚠ {errors[field]}</div>}
    </div>
  )

  return (
    <div>
      {isEdit && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 13, color: '#666' }}>
          Артикул: {order.article}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>
          Статус заказа
        </label>
        <select
          value={form.statusId}
          onChange={e => set('statusId', e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14, background: '#fff' }}
        >
          {lookups.orderStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {inp('address',      'Адрес пункта выдачи *')}
      {inp('orderDate',    'Дата заказа',   'date')}
      {inp('deliveryDate', 'Дата доставки *', 'date')}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            flex: 1, padding: '12px 0', background: loading ? '#888' : '#1a1a1a',
            color: '#fff', border: 'none', borderRadius: 10,
            fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 15,
          }}
        >
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Добавить заказ'}
        </button>
        <button
          onClick={onClose}
          style={{ padding: '12px 20px', background: '#f0f0f0', border: 'none', borderRadius: 10, fontSize: 15 }}
        >
          Отмена
        </button>
      </div>
    </div>
  )
}