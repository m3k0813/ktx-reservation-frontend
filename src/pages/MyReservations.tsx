import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

type Reservation = {
  reservationId: number;
  trainName: string;
  price: number;
  departureStation: string;
  arrivalStation: string;
  seatNumber: string;
  reservedAt: string;
};

export default function MyReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchReservations() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await reservationApi.get(`/api/v1/reservations?userId=${userId}`);
      setReservations(res.data || []);
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e?.response?.data || '';
      if (e?.response?.status === 404 || errorMessage.includes('예매 내역이 없습니다')) {
        setReservations([]);
      } else {
        setError(errorMessage || '예매내역을 불러오지 못했습니다');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, [user]);

  async function cancelReservation(reservationId: number) {
    if (!window.confirm('예약을 취소하시겠습니까?')) return;
    try {
      await reservationApi.delete(`/api/v1/reservations/${reservationId}`);
      await fetchReservations();
    } catch (e: any) {
      alert(e?.response?.data?.message || '예약 취소에 실패했습니다');
    }
  }

  if (loading) return <p className="loading-text">불러오는 중...</p>;
  if (error) return <p className="error-message" style={{ maxWidth: 600, margin: '40px auto' }}>{error}</p>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '2em', marginBottom: 8 }}>내 예매내역</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1em' }}>예약한 열차 목록입니다</p>
      </div>
      {reservations.length > 0 ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {reservations.map((r) => (
            <div key={r.reservationId} className="card">
              <div style={{ display: 'flex', alignItems: 'start', gap: 20 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--secondary-color) 0%, #5c94ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5em',
                  flexShrink: 0
                }}>
                  🎫
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <h3 style={{ margin: 0, fontSize: '1.3em', color: 'var(--text-primary)' }}>{r.trainName.trim()}</h3>
                      <div style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--background-color)',
                        borderRadius: 6,
                        fontSize: '0.85em',
                        color: 'var(--text-secondary)',
                        fontWeight: 600
                      }}>
                        예약번호: {r.reservationId}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                      {new Date(r.reservedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 16px',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 8,
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>좌석</span>
                      <span style={{
                        fontSize: '1.2em',
                        fontWeight: 700,
                        color: 'var(--primary-color)',
                        fontFamily: 'monospace'
                      }}>
                        {r.seatNumber}
                      </span>
                    </div>
                    <div style={{
                      height: 20,
                      width: 1,
                      backgroundColor: 'var(--border-color)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{r.departureStation.trim()}</span>
                      <span style={{ color: 'var(--primary-color)' }}>→</span>
                      <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{r.arrivalStation.trim()}</span>
                    </div>
                    <div style={{
                      height: 20,
                      width: 1,
                      backgroundColor: 'var(--border-color)'
                    }} />
                    <div style={{ fontSize: '0.85em', fontWeight: 600, color: 'var(--primary-color)' }}>
                      ₩{r.price.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => cancelReservation(r.reservationId)}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: 'var(--error-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '0.9em',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--error-color)'}
                  >
                    예약 취소
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3em', marginBottom: 16 }}>🎫</div>
          <p>아직 예약 내역이 없습니다</p>
          <Link to="/" style={{
            display: 'inline-block',
            marginTop: 16,
            padding: '12px 24px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600
          }}>
            기차 예약하러 가기
          </Link>
        </div>
      )}
    </div>
  );
}


