import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

type Train = {
  id: number;
  name: string;
  price: number;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
};

export default function Confirm() {
  const { trainId, seatNumber } = useParams();
  const navigate = useNavigate();
  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/v1/trains');
        const trains = res.data;
        const foundTrain = trains.find((t: Train) => t.id === Number(trainId));
        if (foundTrain) {
          setTrain(foundTrain);
        } else {
          setError('열차 정보를 찾을 수 없습니다');
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || '열차 정보를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    })();
  }, [trainId]);

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

  const formatDate = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch {
      return '';
    }
  };

  async function confirmReservation() {
    setError(null);
    setSubmitting(true);
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('로그인이 필요합니다');
      setSubmitting(false);
      return;
    }
    try {
      await api.post(`/api/v1/reservations?userId=${userId}`, {
        trainId: Number(trainId),
        seatNumber: seatNumber
      });
      navigate('/reservations');
    } catch (err: any) {
      setError(err?.response?.data?.message || '예약에 실패했습니다');
      setSubmitting(false);
    }
  }

  if (loading) return <p className="loading-text">불러오는 중...</p>;
  if (error && !train) return <p className="error-message" style={{ maxWidth: 600, margin: '40px auto' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3em', marginBottom: 16 }}>✅</div>
        <h2 style={{ marginBottom: 8 }}>예매 확인</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>예매 정보를 확인하고 결제를 진행해주세요</p>
      </div>

      {train && (
        <>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3em', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: 12 }}>
              열차 정보
            </h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>열차명</span>
                <span style={{ fontWeight: 700, fontSize: '1.1em', color: 'var(--text-primary)' }}>{train.name.trim()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>출발</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{train.departureStation.trim()}</div>
                  <div style={{ fontSize: '0.9em', color: 'var(--primary-color)', fontWeight: 600 }}>
                    {formatDate(train.departureTime)} {formatTime(train.departureTime)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>도착</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{train.arrivalStation.trim()}</div>
                  <div style={{ fontSize: '0.9em', color: 'var(--primary-color)', fontWeight: 600 }}>
                    {formatDate(train.arrivalTime)} {formatTime(train.arrivalTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3em', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: 12 }}>
              좌석 정보
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>선택한 좌석</span>
              <span style={{
                fontSize: '1.8em',
                fontWeight: 700,
                color: 'var(--primary-color)',
                fontFamily: 'monospace'
              }}>
                {seatNumber}
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 24, backgroundColor: 'var(--background-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2em', fontWeight: 600, color: 'var(--text-primary)' }}>총 결제 금액</span>
              <span style={{ fontSize: '2em', fontWeight: 700, color: 'var(--primary-color)' }}>
                ₩{train.price.toLocaleString()}
              </span>
            </div>
          </div>

          {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate(`/reserve/${trainId}`, { state: { selectedSeat: seatNumber } })}
              disabled={submitting}
              style={{
                flex: 1,
                backgroundColor: 'var(--background-color)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              이전
            </button>
            <button
              onClick={confirmReservation}
              disabled={submitting}
              style={{
                flex: 2,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? '예약 중...' : '결제 및 예약 확정'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
