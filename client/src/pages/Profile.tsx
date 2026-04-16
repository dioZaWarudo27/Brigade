import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';
import { Layout } from './Dashboard'; // Reusing the Layout from Dashboard for consistency
import { patchTdee } from '../api';
import toast from 'react-hot-toast';

const Profile = ({ onLogout }: { onLogout: () => void }) => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    activity_level: '',
    goal: '',
    bodyfat: '',
    tdee: 0,
    target_calories: 0,
    total_workouts: 0,
    total_volume: 0,
    streak: 0
  });
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    activity_level: '',
    goal: '',
    bodyfat: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await getProfile();
        const initialData = {
          username: data.username || '',
          email: data.email || '',
          gender: data.gender || '',
          age: data.age?.toString() || '',
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          activity_level: data.activity_level || '',
          goal: data.goal || '',
          bodyfat: data.bodyfat?.toString() || '',
          tdee: data.tdee || 0,
          target_calories: data.target_calories || 0,
          total_workouts: data.total_workouts || 0,
          total_volume: data.total_volume || 0,
          streak: data.streak || 0
        };
        setProfile(initialData);
        setFormData({
          username: initialData.username,
          gender: initialData.gender,
          age: initialData.age,
          weight: initialData.weight,
          height: initialData.height,
          activity_level: initialData.activity_level,
          goal: initialData.goal,
          bodyfat: initialData.bodyfat
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleUpdate = async () => {
    try {
      // Use the patchTdee endpoint which handles partial updates correctly
      const dataToSend: any = {
        username: formData.username,
        gender: formData.gender,
        activity_level: formData.activity_level,
        goal: formData.goal,
      };

      // Only parse if values are not empty strings
      if (formData.age !== '') dataToSend.age = parseInt(formData.age);
      if (formData.weight !== '') dataToSend.weight = parseFloat(formData.weight);
      if (formData.height !== '') dataToSend.height = parseFloat(formData.height);
      if (formData.bodyfat !== '') dataToSend.bodyfat = parseFloat(formData.bodyfat);

      const updatedData = await patchTdee(dataToSend);
      
      setProfile(prev => ({
        ...prev,
        ...updatedData,
        age: updatedData.age?.toString() || '',
        weight: updatedData.weight?.toString() || '',
        height: updatedData.height?.toString() || '',
        bodyfat: updatedData.bodyfat?.toString() || ''
      }));
      
      toast.success("Profile updated successfully! ✨");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <Layout title="My Profile" onLogout={onLogout}>
      <div className="profile-wrapper">
        {/* Profile Header Card */}
        <div className="profile-card-hero">
          <div className="hero-content">
            <div className="avatar-container">
              <img 
                src={`https://ui-avatars.com/api/?name=${profile.username || 'User'}&background=6366f1&color=fff&size=150&bold=true`} 
                alt="Avatar" 
                className="hero-avatar" 
              />
              <div className="status-indicator"></div>
            </div>
            <div className="hero-info">
              <h1>{profile.username || 'GymFlow Athlete'}</h1>
              <p className="email-tag">{profile.email}</p>
              <div className="badge-row">
                <span className="profile-badge">Pro Member</span>
                <span className="profile-badge goal" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                  {profile.goal?.toUpperCase()}
                </span>
                <span className="profile-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  {profile.activity_level?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon indigo"><i className="fas fa-bolt"></i></div>
            <div className="stat-info">
              <h3>{profile.tdee} <small>kcal</small></h3>
              <p>Daily TDEE</p>
            </div>
          </div>  
          <div className="stat-card">
            <div className="stat-icon amber"><i className="fas fa-weight"></i></div>
            <div className="stat-info">
              <h3>{profile.weight} <small>kg</small></h3>
              <p>Current Weight</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon indigo"><i className="fas fa-dumbbell"></i></div>
            <div className="stat-info">
              <h3>{profile.total_workouts}</h3>
              <p>Total Workouts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><i className="fas fa-fire"></i></div>
            <div className="stat-info">
              <h3>{profile.streak}</h3>
              <p>Current Streak</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald"><i className="fas fa-chart-line"></i></div>
            <div className="stat-info">
              <h3>{profile.total_volume.toLocaleString()} <small>kg</small></h3>
              <p>Total Volume</p>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="card settings-card">
          <div className="card-header">
            <h2>Account & Physical Stats</h2>
            <i className="fas fa-cog text-muted"></i>
          </div>
          
          <div className="settings-grid">
            <div className="form-group">
              <label><i className="fas fa-user-edit"></i> Display Name</label>
              <input 
                type="text" 
                className="styled-input"
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="How should we call you?" 
              />
            </div>

            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email Address</label>
              <input type="email" className="styled-input disabled" value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label><i className="fas fa-venus-mars"></i> Gender</label>
              <select className="styled-input" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label><i className="fas fa-calendar-alt"></i> Age</label>
              <input type="number" className="styled-input" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="e.g. 25" />
            </div>

            <div className="form-group">
              <label><i className="fas fa-weight"></i> Weight (kg)</label>
              <input type="number" className="styled-input" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 70" />
            </div>

            <div className="form-group">
              <label><i className="fas fa-ruler-vertical"></i> Height (cm)</label>
              <input type="number" className="styled-input" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} placeholder="e.g. 175" />
            </div>

            <div className="form-group">
              <label><i className="fas fa-running"></i> Activity Level</label>
              <select className="styled-input" value={formData.activity_level} onChange={(e) => setFormData({...formData, activity_level: e.target.value})}>
                <option value="">Select Activity</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extra_active">Extra Active</option>
              </select>
            </div>

            <div className="form-group">
              <label><i className="fas fa-bullseye"></i> Fitness Goal</label>
              <select className="styled-input" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})}>
                <option value="">Select Goal</option>
                <option value="maintain">Maintain</option>
                <option value="lose">Lose Weight</option>
                <option value="gain">Gain Muscle</option>
              </select>
            </div>

            <div className="form-group full-width">
               <label><i className="fas fa-percent"></i> Body Fat % (Optional)</label>
               <input type="number" className="styled-input" value={formData.bodyfat} onChange={(e) => setFormData({...formData, bodyfat: e.target.value})} placeholder="e.g. 15" />
            </div>
          </div>

          <div className="profile-actions">
            <button className="primary-btn save-btn" onClick={handleUpdate}>
              <i className="fas fa-check-circle"></i> Save Changes
            </button>
            <button className="outline-btn logout-btn" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;