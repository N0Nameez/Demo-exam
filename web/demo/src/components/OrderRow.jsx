// Строка заказа в таблице заказов

const STATUS_COLORS = {
  'Доставлен':    '#27ae60',
  'В обработке':  '#f39c12',
  'В пути':       '#3498db',
  'Подтверждён':  '#9b59b6',
  'Отменён':      '#e74c3c',
}

export default function OrderRow({ order: o, isAdmin, onEdit, onDelete }) {
  const statusColor = STATUS_COLORS[o.status] ?? '#888'

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          {o.article}
        </div>
        <div style={{
          display: 'inline-block', background: statusColor + '20', color: statusColor,
          borderRadius: 20, padding: '2px 12px', fontSize: 12, fontWeight: 600, marginBottom: 8,
        }}>
          {o.status}
        </div>
        <div style={{ fontSize: 14, color: '#555' }}>📍 {o.address}</div>
        {o.clientName && (
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>👤 {o.clientName}</div>
        )}
        <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
          Дата заказа: {o.orderDate}
        </div>
        {/* Состав заказа */}
        <div style={{ marginTop: 8, fontSize: 12, color: '#777' }}>
          {o.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: 140 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Дата доставки</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16 }}>
          {o.deliveryDate ?? '—'}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8, color: '#1a1a1a' }}>
          {o.totalAmount.toLocaleString('ru')} ₽
        </div>
        {isAdmin && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => onEdit(o)}
              style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(o)}
              style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}