export default function Header({ user, page, onNavigate, onLogout }) {
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin'

  const s = {
    header: {
      background: '#1a1a1a', color: '#fff', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
    },
    logo: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 22, fontWeight: 700, color: '#c9a96e',
    },
    nav: { display: 'flex', gap: 8 },
    navBtn: (active) => ({
      background: active ? 'rgba(201,169,110,0.2)' : 'none',
      border: 'none', color: '#fff', padding: '8px 16px',
      borderRadius: 8, fontSize: 15, transition: 'background 0.2s',
    }),
    right: { display: 'flex', alignItems: 'center', gap: 16 },
    userInfo: { textAlign: 'right' },
    userName: { fontSize: 14, fontWeight: 600 },
    userRole: { fontSize: 11, color: '#c9a96e', textTransform: 'uppercase', letterSpacing: 1 },
    logoutBtn: {
      background: 'rgba(255,255,255,0.1)', border: 'none',
      color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 13,
    },
  }

  const roleLabel = {
    admin:   'Администратор',
    manager: 'Менеджер',
    client:  'Клиент',
    guest:   'Гость',
  }

  return (
    <header style={s.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={s.logo}>👟 SoleVault</div>
        <nav style={s.nav}>
          <button style={s.navBtn(page === 'products')} onClick={() => onNavigate('products')}>
            Каталог
          </button>
          {isManagerOrAdmin && (
            <button style={s.navBtn(page === 'orders')} onClick={() => onNavigate('orders')}>
              Заказы
            </button>
          )}
        </nav>
      </div>

      <div style={s.right}>
        <div style={s.userInfo}>
          <div style={s.userName}>{user?.fullName}</div>
          <div style={s.userRole}>{roleLabel[user?.role] ?? 'Гость'}</div>
        </div>
        <button style={s.logoutBtn} onClick={onLogout}>Выйти</button>
      </div>
    </header>
  )
}