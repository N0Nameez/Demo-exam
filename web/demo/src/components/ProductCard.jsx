export default function ProductCard({ product: p, cartQty, onAddToCart, isClient }) {
  const outOfStock  = p.stock === 0
  const limitReached = !outOfStock && cartQty >= p.stock
  const disabled    = outOfStock || limitReached

  // Цвет фона по скидке и остатку
  let bg = '#fff'
  let color = '#1a1a1a'
  if (p.discount > 15) { bg = '#2E8B57'; color = '#fff' }
  else if (outOfStock)  { bg = '#e0f7fa' }

  // Текст кнопки
  const btnLabel = outOfStock
    ? 'Нет в наличии'
    : limitReached
      ? `Максимум (${p.stock} ${p.unit})`
      : cartQty > 0
        ? `В корзине: ${cartQty}  +`
        : 'В корзину'

  return (
    <div style={{
      background: bg, color, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Фото */}
      <div style={{
        height: 160, background: p.discount > 15 ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {p.imageUrl
          ? <img src={`http://localhost:5244${p.imageUrl}`} alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 52, opacity: 0.4 }}>👟</span>
        }
        {p.discount > 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#e74c3c', color: '#fff',
            borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
          }}>
            -{p.discount}%
          </div>
        )}
        {outOfStock && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            borderRadius: 6, padding: '3px 8px', fontSize: 11,
          }}>
            Нет в наличии
          </div>
        )}
      </div>

      {/* Информация */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>
          {p.category}
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16 }}>
          {p.name}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{p.description}</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          <span style={{ opacity: 0.6 }}>Производитель: </span>{p.manufacturer}
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ opacity: 0.6 }}>Поставщик: </span>{p.supplier}
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ opacity: 0.6 }}>На складе: </span>{p.stock} {p.unit}
        </div>

        {/* Цена */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {p.discount > 0 ? (
            <>
              <span style={{
                textDecoration: 'line-through',
                color: p.discount > 15 ? 'rgba(255,255,255,0.6)' : '#e74c3c',
                fontSize: 13,
              }}>
                {p.price.toLocaleString('ru')} ₽
              </span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>
                {p.finalPrice.toLocaleString('ru')} ₽
              </span>
            </>
          ) : (
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              {p.price.toLocaleString('ru')} ₽
            </span>
          )}
        </div>
      </div>

      {/* Кнопка корзины — только для клиента */}
      {isClient && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={() => !disabled && onAddToCart(p)}
            disabled={disabled}
            title={limitReached ? `На складе только ${p.stock} ${p.unit}` : undefined}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
              background: disabled
                ? '#ddd'
                : cartQty > 0 ? '#2d3436' : '#1a1a1a',
              color: disabled ? '#999' : '#fff',
              fontSize: 14, fontWeight: 600, transition: 'background 0.2s',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {btnLabel}
          </button>
          {limitReached && (
            <div style={{ fontSize: 11, color: '#e74c3c', textAlign: 'center', marginTop: 4 }}>
              Больше нет на складе
            </div>
          )}
        </div>
      )}
    </div>
  )
}