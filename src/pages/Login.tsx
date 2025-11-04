import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || '로그인에 실패했습니다');
    }
  }

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3em', marginBottom: 16 }}>🚄</div>
        <h2 style={{ marginBottom: 8 }}>로그인</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>KTX 예매 서비스에 오신 것을 환영합니다</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" style={{ width: '100%', marginTop: 8 }}>로그인</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>
        계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}


