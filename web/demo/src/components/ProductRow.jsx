// Строка таблицы товаров — для менеджера и администратора

export default function ProductRow({ product: p, isAdmin, onEdit, onDelete }) {
  let bg = 'transparent'
  let color = '#1a1a1a'
  if (p.discount > 15)  { bg = '#2E8B57'; color = '#fff' }
  else if (p.stock === 0) { bg = '#e0f7fa' }

  const td = { padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }

  return (
    <tr style={{ background: bg, color }}>
      {/* Фото */}
      <td style={td}>
        <div style={{
          width: 60, height: 44, background: 'rgba(0,0,0,0.05)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden',
        }}>
          {p.imageUrl
            ? <img src={`http://localhost:5244${p.imageUrl}`} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '👟'}
        </div>
      </td>

      {/* Название + категория */}
      <td style={td}>
        <div style={{ fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>{p.category}</div>
      </td>

      <td style={{ ...td, fontSize: 13, maxWidth: 200 }}>{p.description}</td>
      <td style={{ ...td, fontSize: 13 }}>{p.manufacturer}</td>
      <td style={{ ...td, fontSize: 13 }}>{p.supplier}</td>

      {/* Цена */}
      <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {p.discount > 0 ? (
          <>
            <div style={{
              textDecoration: 'line-through', fontSize: 12,
              color: color === '#fff' ? 'rgba(255,255,255,0.6)' : '#e74c3c',
            }}>
              {p.price.toLocaleString('ru')} ₽
            </div>
            <div style={{ fontWeight: 700 }}>{p.finalPrice.toLocaleString('ru')} ₽</div>
          </>
        ) : (
          <div style={{ fontWeight: 700 }}>{p.price.toLocaleString('ru')} ₽</div>
        )}
      </td>

      <td style={{ ...td, textAlign: 'center' }}>{p.unit}</td>
      <td style={{ ...td, textAlign: 'center' }}>{p.stock}</td>

      {/* Скидка */}
      <td style={{ ...td, textAlign: 'center' }}>
        {p.discount > 0
          ? <span style={{
              background: 'rgba(231,76,60,0.15)',
              color: color === '#fff' ? '#fff' : '#e74c3c',
              padding: '2px 8px', borderRadius: 12, fontWeight: 700, fontSize: 13,
            }}>
              {p.discount}%
            </span>
          : '—'
        }
      </td>

      {/* Кнопки — только для админа */}
      {isAdmin && (
        <td style={{ ...td, whiteSpace: 'nowrap' }}>
          <button
            onClick={() => onEdit(p)}
            style={{
              background: '#3498db', color: '#fff', border: 'none',
              borderRadius: 8, padding: '6px 12px', marginRight: 6, fontSize: 13,
            }}
          >
            ✏️ Изменить
          </button>
          <button
            onClick={() => onDelete(p)}
            style={{
              background: '#e74c3c', color: '#fff', border: 'none',
              borderRadius: 8, padding: '6px 12px', fontSize: 13,
            }}
          >
            🗑️ Удалить
          </button>
        </td>
      )}
    </tr>
  )
}