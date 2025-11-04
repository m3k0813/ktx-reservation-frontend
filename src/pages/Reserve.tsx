import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

type Seat = {
  id: number;
  seatNumber: string;
  reserved: boolean;
};

export default function Reserve() {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState((location.state as any)?.selectedSeat || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const seatsPerPage = 20; // 각 행당 최대 좌석 수

  useEffect(() => {
    if (trainId) {
      (async () => {
        try {
          const res = await api.get(`/api/v1/seats?trainId=${trainId}`);
          setSeats(res.data);
        } catch (e: any) {
          setError(e?.response?.data?.message || '좌석 정보를 불러오지 못했습니다');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [trainId]);

  // 선택한 좌석이 있으면 해당 페이지로 이동
  useEffect(() => {
    if (selectedSeat && seats.length > 0) {
      // Group seats by letter to find the seat's position
      const seatsByRow: { [key: string]: Seat[] } = { A: [], B: [], C: [], D: [] };
      seats.forEach((seat) => {
        const letter = seat.seatNumber.match(/[A-D]/i)?.[0]?.toUpperCase();
        if (letter && seatsByRow[letter]) {
          seatsByRow[letter].push(seat);
        }
      });

      // Sort seats within each row by number
      Object.keys(seatsByRow).forEach((row) => {
        seatsByRow[row].sort((a, b) => {
          const numA = parseInt(a.seatNumber.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.seatNumber.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });
      });

      // Find the selected seat's index in its row
      const letter = selectedSeat.match(/[A-D]/i)?.[0]?.toUpperCase();
      if (letter && seatsByRow[letter]) {
        const seatIndex = seatsByRow[letter].findIndex(s => s.seatNumber === selectedSeat);
        if (seatIndex !== -1) {
          const pageNum = Math.floor(seatIndex / seatsPerPage);
          setCurrentPage(pageNum);
        }
      }
    }
  }, [selectedSeat, seats, seatsPerPage]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedSeat) return;
    // 확정 페이지로 이동
    navigate(`/confirm/${trainId}/${selectedSeat}`);
  }

  if (loading) return <p className="loading-text">좌석 정보를 불러오는 중...</p>;

  // Group seats by letter (A, B, C, D)
  const seatsByRow: { [key: string]: Seat[] } = { A: [], B: [], C: [], D: [] };
  seats.forEach((seat) => {
    // Extract letter from seat number (supports both "1A" and "A1" formats)
    const letter = seat.seatNumber.match(/[A-D]/i)?.[0]?.toUpperCase();
    if (letter && seatsByRow[letter]) {
      seatsByRow[letter].push(seat);
    }
  });

  // Sort seats within each row by number
  Object.keys(seatsByRow).forEach((row) => {
    seatsByRow[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.seatNumber.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  });

  // Calculate pagination
  const maxSeatsInAnyRow = Math.max(...Object.values(seatsByRow).map(row => row.length));
  const totalPages = Math.ceil(maxSeatsInAnyRow / seatsPerPage);
  const startIdx = currentPage * seatsPerPage;
  const endIdx = startIdx + seatsPerPage;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3em', marginBottom: 16 }}>🎫</div>
        <h2 style={{ marginBottom: 8 }}>좌석 선택</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>원하시는 좌석을 선택해주세요</p>
      </div>
      <div style={{
        backgroundColor: 'var(--card-background)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>열차 번호</span>
        <div style={{ fontSize: '1.2em', fontWeight: 600, color: 'var(--primary-color)', marginTop: 4 }}>
          {trainId}
        </div>
      </div>

      {/* Seat Selection Grid - KTX Style */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, backgroundColor: '#E0E0E0', borderRadius: 4, border: '1px solid var(--border-color)' }}></div>
            <span style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>예약 가능</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, backgroundColor: 'var(--primary-color)', borderRadius: 4 }}></div>
            <span style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>선택됨</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, backgroundColor: '#E57373', borderRadius: 4, opacity: 0.85 }}></div>
            <span style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>예약 완료</span>
          </div>
        </div>

        {/* Seat layout by rows */}
        <div style={{ margin: '0 auto', maxWidth: '100%', overflowX: 'auto' }}>
          {/* Row A */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                width: 40,
                fontWeight: 700,
                fontSize: '1.1em',
                color: 'var(--primary-color)',
                textAlign: 'center'
              }}>A</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {seatsByRow['A'].slice(startIdx, endIdx).map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.reserved}
                    onClick={() => setSelectedSeat(seat.seatNumber)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 6,
                      border: selectedSeat === seat.seatNumber ? '2px solid var(--primary-color)' : seat.reserved ? '1px solid #E57373' : '1px solid var(--border-color)',
                      backgroundColor: seat.reserved ? '#E57373' : selectedSeat === seat.seatNumber ? 'var(--primary-color)' : '#E0E0E0',
                      color: seat.reserved || selectedSeat === seat.seatNumber ? 'white' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9em',
                      cursor: seat.reserved ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedSeat === seat.seatNumber ? 'var(--shadow-md)' : 'none',
                      transform: selectedSeat === seat.seatNumber ? 'scale(1.05)' : 'scale(1)',
                      opacity: seat.reserved ? 0.85 : 1,
                      minWidth: '60px'
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row B */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                width: 40,
                fontWeight: 700,
                fontSize: '1.1em',
                color: 'var(--primary-color)',
                textAlign: 'center'
              }}>B</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {seatsByRow['B'].slice(startIdx, endIdx).map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.reserved}
                    onClick={() => setSelectedSeat(seat.seatNumber)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 6,
                      border: selectedSeat === seat.seatNumber ? '2px solid var(--primary-color)' : seat.reserved ? '1px solid #E57373' : '1px solid var(--border-color)',
                      backgroundColor: seat.reserved ? '#E57373' : selectedSeat === seat.seatNumber ? 'var(--primary-color)' : '#E0E0E0',
                      color: seat.reserved || selectedSeat === seat.seatNumber ? 'white' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9em',
                      cursor: seat.reserved ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedSeat === seat.seatNumber ? 'var(--shadow-md)' : 'none',
                      transform: selectedSeat === seat.seatNumber ? 'scale(1.05)' : 'scale(1)',
                      opacity: seat.reserved ? 0.85 : 1,
                      minWidth: '60px'
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aisle */}
          <div style={{
            borderTop: '2px dashed var(--border-color)',
            margin: '20px 0',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--card-background)',
              padding: '0 16px',
              color: 'var(--text-secondary)',
              fontSize: '0.85em',
              fontWeight: 600
            }}>통로</span>
          </div>

          {/* Row C */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                width: 40,
                fontWeight: 700,
                fontSize: '1.1em',
                color: 'var(--primary-color)',
                textAlign: 'center'
              }}>C</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {seatsByRow['C'].slice(startIdx, endIdx).map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.reserved}
                    onClick={() => setSelectedSeat(seat.seatNumber)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 6,
                      border: selectedSeat === seat.seatNumber ? '2px solid var(--primary-color)' : seat.reserved ? '1px solid #E57373' : '1px solid var(--border-color)',
                      backgroundColor: seat.reserved ? '#E57373' : selectedSeat === seat.seatNumber ? 'var(--primary-color)' : '#E0E0E0',
                      color: seat.reserved || selectedSeat === seat.seatNumber ? 'white' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9em',
                      cursor: seat.reserved ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedSeat === seat.seatNumber ? 'var(--shadow-md)' : 'none',
                      transform: selectedSeat === seat.seatNumber ? 'scale(1.05)' : 'scale(1)',
                      opacity: seat.reserved ? 0.85 : 1,
                      minWidth: '60px'
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row D */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                width: 40,
                fontWeight: 700,
                fontSize: '1.1em',
                color: 'var(--primary-color)',
                textAlign: 'center'
              }}>D</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {seatsByRow['D'].slice(startIdx, endIdx).map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.reserved}
                    onClick={() => setSelectedSeat(seat.seatNumber)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 6,
                      border: selectedSeat === seat.seatNumber ? '2px solid var(--primary-color)' : seat.reserved ? '1px solid #E57373' : '1px solid var(--border-color)',
                      backgroundColor: seat.reserved ? '#E57373' : selectedSeat === seat.seatNumber ? 'var(--primary-color)' : '#E0E0E0',
                      color: seat.reserved || selectedSeat === seat.seatNumber ? 'white' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9em',
                      cursor: seat.reserved ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedSeat === seat.seatNumber ? 'var(--shadow-md)' : 'none',
                      transform: selectedSeat === seat.seatNumber ? 'scale(1.05)' : 'scale(1)',
                      opacity: seat.reserved ? 0.85 : 1,
                      minWidth: '60px'
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: currentPage === 0 ? '#BDBDBD' : 'var(--primary-color)',
                color: 'white',
                fontWeight: 600,
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              이전
            </button>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: currentPage === totalPages - 1 ? '#BDBDBD' : 'var(--primary-color)',
                color: 'white',
                fontWeight: 600,
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Reservation Form */}
      <form onSubmit={onSubmit}>
        <div className="card" style={{ padding: 24 }}>
          {selectedSeat ? (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-secondary)' }}>선택한 좌석: </span>
              <span style={{ fontSize: '1.3em', fontWeight: 600, color: 'var(--primary-color)' }}>
                {selectedSeat}
              </span>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 16 }}>
              좌석을 선택해주세요
            </p>
          )}
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            disabled={!selectedSeat}
            style={{ width: '100%' }}
          >
            다음 단계로
          </button>
        </div>
      </form>
    </div>
  );
}


