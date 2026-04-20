import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate } from 'react-router-dom';
import Onboarding from '../components/Onboarding';
import toast, { Toaster } from 'react-hot-toast';

interface RegisterPageProps {
    onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
    const navigate = useNavigate(); 
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { email, password, confirmPassword } = formData;

        if(password.length < 8){
          toast.error('Password must be 8 characters or more')
        }

        if (password !== confirmPassword) {
            toast.error('Password does not match');
            return;
        }

        try {
            const result = await register({ email, password, confirmPassword });
            if (result.error) {
                toast.error(result.error);
            } else {
                setShowOnboarding(true);
            }
        } catch (err: any) {
            console.error('Register error', err);
            toast.error(err.message || 'Registration failed');
        }
    };

    const handleOnboardingComplete = (onboardingData: any) => {
        console.log("Saving user profile info:", onboardingData);
        toast.success('Account setup complete! ✨');
        onRegisterSuccess();
        navigate('/');
    };

    if (showOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="logo-box">
                <i className="fas fa-dumbbell"></i>
                <span>GymFlow</span>
              </div>
              <h2>Create Account</h2>
              <p>Join the community and track your fitness journey</p>
            </div>
      
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
      
              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
      
              <button type="submit" className="primary-btn">
                Sign Up
              </button>
            </form>
      
            <div className="auth-footer">
              <p>
                Already have an account? <a href="/login">Login here</a>
              </p>
            </div>
          </div>
        </div>
    );
};

export default RegisterPage;
