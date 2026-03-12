import { useState } from 'react'
import { api } from '../api/api.js'

export default function LoginPage({ onLogin, onGuest }) {
  const [login,    setLogin]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!login.trim() || !password.trim()) {
      setError('Введите логин и пароль')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/auth/login', { login, password })
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin()
  }

  const s = {
    page: {
      minHeight: '100vh', display: 'flex', background: '#0d0d0d',
    },
    left: {
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: 48,
    },
    right: {
      width: 440, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: 56, background: '#fff',
    },
    input: {
      width: '100%', padding: '14px 16px', borderRadius: 12,
      border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 16,
      outline: 'none',
    },
    btnPrimary: {
      width: '100%', padding: '14px 0', background: '#1a1a1a', color: '#fff',
      border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
      fontFamily: "'Playfair Display', serif", marginBottom: 12,
    },
    btnSecondary: {
      width: '100%', padding: '14px 0', background: 'transparent',
      color: '#1a1a1a', border: '1.5px solid #1a1a1a', borderRadius: 12,
      fontSize: 16, fontFamily: "'Playfair Display', serif", fontWeight: 600,
    },
  }

  return (
    <div style={s.page}>
      {/* Левая панель */}
      <div style={s.left}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>👟</div>
        <h1 style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: 48, margin: 0, letterSpacing: -1 }}>
          SoleVault
        </h1>
        <p style={{ color: '#888', fontSize: 16, marginTop: 8, letterSpacing: 3, textTransform: 'uppercase' }}>
          Premium Footwear
        </p>

        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['👤', 'Гость',         'Просмотр каталога'],
            ['🛍', 'Клиент',        'Корзина и заказы'],
            ['📊', 'Менеджер',      'Поиск и аналитика'],
            ['⚙️', 'Администратор', 'Полное управление'],
          ].map(([icon, role, desc]) => (
            <div key={role} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ color: '#ccc', fontWeight: 600, fontSize: 14 }}>{role}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Правая панель */}
      <div style={s.right}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>
          Добро пожаловать
        </h2>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 15 }}>
          Войдите в аккаунт или продолжите как гость
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>Логин</label>
        <input
          style={s.input}
          value={login}
          onChange={e => setLogin(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите логин"
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>Пароль</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите пароль"
        />

        {error && (
          <div style={{
            background: '#fff0f0', color: '#c0392b', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, marginBottom: 12, border: '1px solid #ffd0d0',
          }}>
            ⛔ {error}
          </div>
        )}

        <button style={s.btnPrimary} onClick={handleLogin} disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        <button style={s.btnSecondary} onClick={onGuest}>
          Продолжить как гость
        </button>

        <div style={{ marginTop: 32, padding: 16, background: '#f9f9f9', borderRadius: 10, fontSize: 12, color: '#888' }}>
          <strong style={{ color: '#555' }}>Тестовые аккаунты:</strong><br />
          admin / admin123 · manager / manager123 · client / client123
        </div>
      </div>
    </div>
  )
}