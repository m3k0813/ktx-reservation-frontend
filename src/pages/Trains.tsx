import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

type Train = {
  id: number;
  name: string;
  price: number;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
};

export default function Trains() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/v1/trains');
        setTrains(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || '기차 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Format time only (HH:mm)
  const formatTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return dateTimeStr;
    }
  };

  // Calculate duration between two times
  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = Math.abs(end.getTime() - start.getTime());
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      if (hours === 0 && minutes === 0) return '-';
      return `${hours}시간 ${minutes}분`;
    } catch {
      return '-';
    }
  };

  if (loading) return <p className="loading-text">불러오는 중...</p>;
  if (error) return <p className="error-message" style={{ maxWidth: 600, margin: '40px auto' }}>{error}</p>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '2em', marginBottom: 8 }}>기차 목록</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1em' }}>원하시는 열차를 선택해주세요</p>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {trains.map((t) => (
          <div key={t.id} className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.4em', color: 'var(--text-primary)' }}>{t.name.trim()}</h3>
                  <div style={{
                    padding: '4px 12px',
                    backgroundColor: t.availableSeats < 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    borderRadius: 6,
                    fontSize: '0.8em',
                    color: t.availableSeats < 10 ? 'var(--error-color)' : 'var(--success-color)',
                    fontWeight: 600
                  }}>
                    잔여 {t.availableSeats}석
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6em', fontWeight: 700, color: 'var(--primary-color)', marginBottom: 4 }}>
                  ₩{t.price.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {formatTime(t.departureTime)}
                  </div>
                  <div style={{ fontSize: '1.05em', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {t.departureStation.trim()}
                  </div>
                </div>
                <div style={{ flex: 1, maxWidth: 200, textAlign: 'center', padding: '0 20px' }}>
                  <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>
                    {calculateDuration(t.departureTime, t.arrivalTime)}
                  </div>
                  <div style={{
                    width: '100%',
                    height: 3,
                    background: 'linear-gradient(to right, var(--primary-color), var(--primary-light))',
                    borderRadius: 2,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '50%'
                    }} />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      backgroundColor: 'var(--primary-light)',
                      borderRadius: '50%'
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {formatTime(t.arrivalTime)}
                  </div>
                  <div style={{ fontSize: '1.05em', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {t.arrivalStation.trim()}
                  </div>
                </div>
              </div>
              <Link
                to={`/reserve/${t.id}`}
                style={{
                  padding: '16px 40px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '1.05em',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 127, 255, 0.25)',
                  marginLeft: 32
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 127, 255, 0.35)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 127, 255, 0.25)';
                }}
              >
                예약하기
              </Link>
            </div>
          </div>
        ))}
      </div>
      {trains.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3em', marginBottom: 16 }}>🚄</div>
          <p>현재 운행중인 기차가 없습니다</p>
        </div>
      )}
    </div>
  );
}


