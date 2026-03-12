// Базовый адрес API — через vite proxy всё /api/* идёт на Windows VM
const BASE = '/api'

// Получаем токен из localStorage
function getToken() {
  return localStorage.getItem('token')
}

// Базовая функция запроса
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, options)

  // Если сервер вернул пустой ответ (например DELETE)
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    throw new Error(data.message || `Ошибка ${res.status}`)
  }

  return data
}

// Удобные методы
export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  delete: (path)         => request('DELETE', path),
}

// Загрузка файла (картинка товара) — отдельный метод, без Content-Type
export async function uploadImage(productId, file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE}/products/${productId}/image`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) throw new Error(data.message || `Ошибка ${res.status}`)
  return data
}