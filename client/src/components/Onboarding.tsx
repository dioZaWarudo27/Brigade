import React, { useState } from 'react';
import { addTdee } from '../api';
import toast, { Toaster } from 'react-hot-toast';
interface OnboardingProps {
  onComplete: (data: any) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    age: '',
    weight: '', // Added to match NOT NULL in database
    height: '',
    activity_level: '',
    goal: '',
    body_fat: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async(e: React.SubmitEvent) => {
    e.preventDefault();
    const dataToSend = {
      username: formData.username,
      gender: formData.gender,
      age: parseInt(formData.age),
      weight: parseInt(formData.weight),
      height: parseInt(formData.height),
      activity_level: formData.activity_level,
      goal: formData.goal,
      
      ...(formData.body_fat && { bodyfat: parseInt(formData.body_fat) })
    }
    try{
      const result = await addTdee(dataToSend)
      onComplete(result)
    }catch(err){
      console.error('Error', err)
      toast.error("Failed to save profile. Please check your inputs.");
    }
  };

  const isStep1Valid = !!(formData.username && formData.gender && formData.age && formData.goal);
  const isStep2Valid = !!(formData.weight && formData.height && formData.activity_level);

  return (
    <div className="auth-container" style={{ background: 'var(--bg-dark)' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="logo-box">
            <i className="fas fa-magic"></i>
            <span>Step {step} of 2</span>
          </div>
          <h2>{step === 1 ? 'Profile Setup' : 'Physical Stats'}</h2>
          <p>{step === 1 ? 'Let\'s start with the basics' : 'Help us calculate your metrics'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? (
            /* STEP 1: Profile Setup (Username, Gender, Age, Goal) */
            <div className="step-content">
              <div className="form-group">
                <label>Username <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. IronLift99" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Age <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="number" 
                    placeholder="25" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    className="styled-input" 
                    style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Your Fitness Goal <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  className="styled-input" 
                  style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  required
                >
                  <option value="">Select Goal</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="lose">Lose Weight</option>
                  <option value="gain">Gain Muscle</option>
                </select>
              </div>

              <button type="button" className="primary-btn" style={{ width: '100%', marginTop: '20px' }} onClick={handleNext} disabled={!isStep1Valid}>
                Next <i className="fas fa-arrow-right" style={{ marginLeft: '10px' }}></i>
              </button>
            </div>
          ) : (
            /* STEP 2: Physical Stats (Weight, Height, Activity Level, Body Fat) */
            <div className="step-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Weight (kg) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="number" 
                    placeholder="75" 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Height (cm) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="number" 
                    placeholder="180" 
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Activity Level <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  className="styled-input" 
                  style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  value={formData.activity_level}
                  onChange={(e) => setFormData({...formData, activity_level: e.target.value})}
                  required
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary (Office job)</option>
                  <option value="lightly_active">Lightly Active (1-2 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extra_active">Extra Active (Athlete/Physical job)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Body Fat % <span className="text-muted">(Optional)</span></label>
                <input 
                  type="number" 
                  placeholder="e.g. 15" 
                  value={formData.body_fat}
                  onChange={(e) => setFormData({...formData, body_fat: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" className="outline-btn" style={{ flex: 1, border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 2 }} disabled={!isStep2Valid}>
                  Finish Setup <i className="fas fa-check-circle" style={{ marginLeft: '10px' }}></i>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
