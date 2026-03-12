import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import Header from './components/Header.jsx'

export default function App() {
  // Текущая страница: 'login' | 'products' | 'orders'
  const [page, setPage] = useState('login')

  // Данные авторизованного пользователя
  const [user, setUser] = useState(null)

  // При запуске проверяем — вдруг токен уже есть в localStorage
  useEffect(() => {
    const token    = localStorage.getItem('token')
    const fullName = localStorage.getItem('fullName')
    const role     = localStorage.getItem('role')
    const userId   = localStorage.getItem('userId')

    if (token && role) {
      setUser({ token, fullName, role, userId: +userId })
      setPage('products')
    }
  }, [])

  // Вызывается после успешного логина
  function handleLogin(userData) {
    localStorage.setItem('token',    userData.token)
    localStorage.setItem('fullName', userData.fullName)
    localStorage.setItem('role',     userData.role)
    localStorage.setItem('userId',   userData.userId)
    setUser(userData)
    setPage('products')
  }

  // Выход
  function handleLogout() {
    localStorage.clear()
    setUser(null)
    setPage('login')
  }

  // Вход как гость — без логина
  function handleGuest() {
    setUser({ role: 'guest', fullName: 'Гость' })
    setPage('products')
  }

  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} onGuest={handleGuest} />
  }

  return (
    <>
      <Header
        user={user}
        page={page}
        onNavigate={setPage}
        onLogout={handleLogout}
      />

      {page === 'products' && <ProductsPage user={user} />}
      {page === 'orders'   && <OrdersPage   user={user} />}
    </>
  )
}