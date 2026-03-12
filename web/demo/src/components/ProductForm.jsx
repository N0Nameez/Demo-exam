import { useState, useEffect } from 'react'
import { api, uploadImage } from '../api/api.js'

export default function ProductForm({ product, lookups, onSave, onClose }) {
  const isEdit = !!product

  const [form, setForm] = useState({
    name:           product?.name           ?? '',
    categoryId:     product?.categoryId     ?? lookups.categories[0]?.id ?? 1,
    description:    product?.description    ?? '',
    manufacturerId: product?.manufacturerId ?? lookups.manufacturers[0]?.id ?? 1,
    supplierId:     product?.supplierId     ?? lookups.suppliers[0]?.id ?? 1,
    price:          product?.price          ?? '',
    unit:           product?.unit           ?? 'пара',
    stock:          product?.stock          ?? '',
    discount:       product?.discount       ?? 0,
  })
  const [errors, setErrors]       = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview]     = useState(product?.imageUrl ?? null)
  const [loading, setLoading]     = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())                          e.name     = 'Введите наименование'
    if (form.price === '' || +form.price <= 0)      e.price    = 'Цена должна быть больше 0'
    if (form.stock === '' || +form.stock <= 0)      e.stock    = 'Количество должно быть больше 0'
    if (+form.discount !== 0 && (+form.discount < 1 || +form.discount > 99))
                                                    e.discount = 'Скидка должна быть от 1 до 99 (или 0 — без скидки)'
    return e
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      const body = {
        name:           form.name,
        categoryId:     +form.categoryId,
        description:    form.description,
        manufacturerId: +form.manufacturerId,
        supplierId:     +form.supplierId,
        price:          +form.price,
        unit:           form.unit,
        stock:          +form.stock,
        discount:       +form.discount,
      }

      let savedId = product?.id
      if (isEdit) {
        await api.put(`/products/${product.id}`, body)
      } else {
        const res = await api.post('/products', body)
        savedId = res.id
      }

      if (imageFile && savedId) {
        await uploadImage(savedId, imageFile)
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

  const sel = (field, label, items) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>
        {label}
      </label>
      <select
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14, background: '#fff' }}
      >
        {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
  )

  return (
    <div>
      {isEdit && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 13, color: '#666' }}>
          ID: {product.id} (только для чтения)
        </div>
      )}

      {/* Фото */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 120, height: 90, background: '#f0f0f0', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {preview
            ? <img
                src={preview.startsWith('blob') ? preview : `http://localhost:5244${preview}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt=""
              />
            : <span style={{ fontSize: 40 }}>👟</span>
          }
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>
            Фото товара
          </label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 13 }} />
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Рекомендуемый размер: 300×200 пикселей</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ gridColumn: '1/-1' }}>{inp('name', 'Наименование *')}</div>
        {sel('categoryId', 'Категория *', lookups.categories)}
        {sel('manufacturerId', 'Производитель *', lookups.manufacturers)}
        <div style={{ gridColumn: '1/-1', marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' }}>Описание</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14, resize: 'vertical', minHeight: 70 }}
          />
        </div>
        {sel('supplierId', 'Поставщик *', lookups.suppliers)}
        {inp('unit', 'Единица измерения')}
        {inp('price', 'Цена (₽) *', 'number')}
        {inp('stock', 'Количество на складе *', 'number')}
        {inp('discount', 'Скидка (%, 0 — без скидки)', 'number')}
      </div>

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
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Добавить товар'}
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