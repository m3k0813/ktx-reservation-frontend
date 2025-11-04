import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signup({ username, password, name, email });
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || '회원가입에 실패했습니다');
    }
  }

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3em', marginBottom: 16 }}>🚄</div>
        <h2 style={{ marginBottom: 8 }}>회원가입</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>KTX 예매 서비스를 이용하시려면 가입해주세요</p>
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
        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" style={{ width: '100%', marginTop: 8 }}>가입하기</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}


