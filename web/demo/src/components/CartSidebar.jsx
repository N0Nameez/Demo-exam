import { useState } from 'react'
import { api } from '../api/api.js'

export default function CartSidebar({ cart, products, onClose, onOrderPlaced }) {
  const [step, setStep]             = useState('cart') // cart | checkout | success
  const [address, setAddress]       = useState('')
  const [deliveryDate, setDelivery] = useState('')
  const [loading, setLoading]       = useState(false)
  const [orderError, setOrderError] = useState('')     // ← ошибка от сервера

  // Собираем позиции корзины
  const items = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find(p => p.id === +id), qty }))
    .filter(i => i.product)

  const total = items.reduce((s, i) => s + i.product.finalPrice * i.qty, 0)

  async function placeOrder() {
    if (!address.trim() || !deliveryDate) {
      setOrderError('Заполните адрес и дату доставки')
      return
    }

    setLoading(true)
    setOrderError('')
    try {
      await api.post('/orders', {
        statusId:     1,
        address,
        orderDate:    new Date().toISOString().split('T')[0],
        deliveryDate,
        clientId:     null,
        items:        items.map(i => ({ productId: i.product.id, quantity: i.qty })),
      })
      setStep('success')
      onOrderPlaced() // ← перезагружает продукты, обновляет остатки в карточках
    } catch (err) {
      setOrderError(err.message) // сервер вернёт точное сообщение о нехватке товара
    } finally {
      setLoading(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
  }
  const panel = {
    background: '#fff', width: 400, height: '100%',
    overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column',
  }

  if (step === 'success') return (
    <div style={overlay}>
      <div style={{ ...panel, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Заказ оформлен!</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Ваш заказ принят. Ожидайте доставку по адресу:<br /><strong>{address}</strong>
        </p>
        <button
          onClick={onClose}
          style={{
            background: '#1a1a1a', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 32px', fontSize: 15,
            fontFamily: "'Playfair Display', serif", fontWeight: 600,
          }}
        >
          Отлично!
        </button>
      </div>
    </div>
  )

  return (
    <div style={overlay}>
      <div style={panel}>
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }}>
            {step === 'cart' ? '🛒 Корзина' : '📋 Оформление заказа'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24 }}>×</button>
        </div>

        {/* Шаг 1 — корзина */}
        {step === 'cart' && (
          <>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#aaa', marginTop: 60 }}>
                <div style={{ fontSize: 48 }}>🛒</div>
                <p style={{ marginTop: 12 }}>Корзина пуста</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {items.map(({ product, qty }) => (
                    <div key={product.id} style={{
                      display: 'flex', gap: 12, marginBottom: 16,
                      paddingBottom: 16, borderBottom: '1px solid #f0f0f0',
                    }}>
                      <div style={{
                        width: 60, height: 60, background: '#f5f5f5', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
                      }}>
                        {product.imageUrl
                          ? <img src={`http://localhost:5244${product.imageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} alt="" />
                          : '👟'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14 }}>{product.name}</div>
                        <div style={{ fontSize: 13, color: '#888' }}>{qty} × {product.finalPrice.toLocaleString('ru')} ₽</div>
                        {/* Предупреждение если в корзине больше чем на складе */}
                        {qty > product.stock && (
                          <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2 }}>
                            ⚠ На складе только {product.stock} {product.unit}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                        {(product.finalPrice * qty).toLocaleString('ru')} ₽
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
                    <span>Итого:</span>
                    <span>{total.toLocaleString('ru')} ₽</span>
                  </div>
                  <button
                    onClick={() => setStep('checkout')}
                    style={{
                      width: '100%', padding: '14px 0', background: '#1a1a1a', color: '#fff',
                      border: 'none', borderRadius: 12, fontFamily: "'Playfair Display', serif",
                      fontWeight: 600, fontSize: 16,
                    }}
                  >
                    Оформить заказ →
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Шаг 2 — оформление */}
        {step === 'checkout' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>
                Адрес пункта выдачи *
              </label>
              <input
                value={address}
                onChange={e => { setAddress(e.target.value); setOrderError('') }}
                placeholder="г. Москва, ул. Ленина, д. 1"
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>
                Желаемая дата доставки *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => { setDelivery(e.target.value); setOrderError('') }}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14 }}
              />
            </div>

            {/* Итог */}
            <div style={{ background: '#f9f9f9', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              {items.map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>{product.name} × {qty}</span>
                  <span style={{ fontWeight: 600 }}>{(product.finalPrice * qty).toLocaleString('ru')} ₽</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid #e0e0e0' }}>
                <span>Итого:</span>
                <span>{total.toLocaleString('ru')} ₽</span>
              </div>
            </div>

            {/* Блок ошибки от сервера */}
            {orderError && (
              <div style={{
                background: '#fff5f5', border: '1px solid #f5c6cb',
                borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                color: '#e74c3c', fontSize: 13, lineHeight: 1.5,
              }}>
                ⚠ {orderError}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', background: loading ? '#888' : '#1a1a1a',
                color: '#fff', border: 'none', borderRadius: 12,
                fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16, marginBottom: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Оформляем...' : 'Подтвердить заказ ✓'}
            </button>
            <button
              onClick={() => { setStep('cart'); setOrderError('') }}
              style={{ width: '100%', padding: '10px 0', background: '#f0f0f0', border: 'none', borderRadius: 12, fontSize: 14 }}
            >
              ← Назад в корзину
            </button>
          </div>
        )}
      </div>
    </div>
  )
}