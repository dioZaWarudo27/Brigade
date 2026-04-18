import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) =>{
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async(e:React.SubmitEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setLoading(true);
        setError('');
       try{
        await login(email,password)
        onLoginSuccess();
        navigate('/')
       }catch(err: any){
            setError(err.message)
       } finally {
         setLoading(false);
       }
    };
    return (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                  <i className="fas fa-dumbbell"></i>
                  <span>Barbell's Brigade</span>
              </div>
              <h2>Welcome Back</h2>
              <p>Log in to track your progress</p>
            </div>
            
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            
            <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                          <label>Email Address</label>
                          <input 
                            type="email" 
                            placeholder="name@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                          />
                        </div>
                        <button type="submit" className="primary-btn" disabled={loading}>
                          {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        </div>

                        <a 
                          href="/api/auth/google" 
                          className="secondary-btn" 
                          style={{ 
                            textDecoration: 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            background: '#fff',
                            color: '#000',
                            border: 'none'
                          }}
                        >
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                          Sign in with Google
                        </a>
                      </form>

            <div className="auth-footer">
              <p>
                Don't have an account? <a href="/register">Register</a>
              </p>
            </div>
          </div>
        </div>
    );
}

export default LoginPage;
