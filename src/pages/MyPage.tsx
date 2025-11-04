import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

type Me = {
  id: string | number;
  email: string;
  name?: string;
  username?: string;
};

export default function MyPage() {
  const { logout } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('로그인이 필요합니다');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/v1/users/${userId}`);
        setMe(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || '내 정보를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="loading-text">불러오는 중...</p>;
  if (error) return <p className="error-message" style={{ maxWidth: 600, margin: '40px auto' }}>{error}</p>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '2em', marginBottom: 8 }}>마이페이지</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1em' }}>내 계정 정보를 확인하세요</p>
      </div>
      {me && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5em',
              flexShrink: 0
            }}>
              👤
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5em', color: 'var(--text-primary)' }}>
                {me.name || me.username || '사용자'}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{me.email}</p>
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--background-color)',
            padding: 24,
            borderRadius: 12,
            marginBottom: 24
          }}>
            <h4 style={{ marginTop: 0, marginBottom: 16, color: 'var(--text-primary)' }}>계정 정보</h4>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: 4 }}>사용자 ID</div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {me.id}
                </div>
              </div>
              {me.username && (
                <div>
                  <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: 4 }}>아이디</div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{me.username}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: 4 }}>이메일</div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{me.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: 4 }}>이름</div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{me.name || '-'}</div>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              backgroundColor: 'var(--error-color)',
              color: 'white'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--error-color)'}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}


