import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Trains from './pages/Trains'
import Reserve from './pages/Reserve'
import Confirm from './pages/Confirm'
import MyReservations from './pages/MyReservations'
import MyPage from './pages/MyPage'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🚄 KTX 예매
          </Link>
          <div className="navbar-links">
            <Link to="/">기차 목록</Link>
            {user && (
              <>
                <Link to="/reservations">예매내역</Link>
                <Link to="/me">마이페이지</Link>
              </>
            )}
          </div>
          <div className="navbar-auth">
            {user ? (
              <>
                <span style={{ color: 'white' }}>👤 {user.name || user.username || user.email}</span>
                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '6px 16px',
                    fontSize: '0.9em',
                    borderRadius: 6,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login">로그인</Link>
                <span className="navbar-divider">|</span>
                <Link to="/signup">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route index element={<Trains />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/reserve/:trainId" element={<Reserve />} />
            <Route path="/confirm/:trainId/:seatNumber" element={<Confirm />} />
            <Route path="/reservations" element={<MyReservations />} />
            <Route path="/me" element={<MyPage />} />
          </Route>
          <Route path="*" element={<div className="page-container" style={{ textAlign: 'center' }}>페이지를 찾을 수 없습니다</div>} />
        </Routes>
      </main>
    </>
  )
}

export default App
