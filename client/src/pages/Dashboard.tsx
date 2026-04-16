import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getWorkouts } from '../api';
import { type Workout } from '../types/workout';

// --- COMPONENTS ---

const Sidebar = ({ onLogout, mobileActive, setMobileActive }: { onLogout: () => void, mobileActive: boolean, setMobileActive: (active: boolean) => void }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <>
      <div 
        className={`sidebar-overlay ${mobileActive ? 'active' : ''}`} 
        onClick={() => setMobileActive(false)}
      ></div>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileActive ? 'active' : ''}`} id="sidebar">
        <div className="logo">
          <div className="logo-box">
            <i className="fas fa-dumbbell"></i>
            <span></span>
          </div>
          <button id="fold-sidebar" className="desktop-only" onClick={toggleCollapsed}>
            <i className={`fas ${collapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'}`}></i>
          </button>
        </div>
        <nav>
          <ul>
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/" onClick={() => setMobileActive(false)}><i className="fas fa-chart-line"></i> <span>Dashboard</span></Link>
            </li>
            <li className={location.pathname === '/log-workout' ? 'active' : ''}>
              <Link to="/log-workout" onClick={() => setMobileActive(false)}><i className="fas fa-plus-circle"></i> <span>Log Workout</span></Link>
            </li>
            <li className={location.pathname === '/log-food' ? 'active' : ''}>
              <Link to="/log-food" onClick={() => setMobileActive(false)}><i className="fas fa-apple-alt"></i> <span>Log Food</span></Link>
            </li>
            <li className={location.pathname === '/food-history' ? 'active' : ''}>
              <Link to="/food-history" onClick={() => setMobileActive(false)}><i className="fas fa-calendar-alt"></i> <span>Food History</span></Link>
            </li>
            <li className={location.pathname === '/history' ? 'active' : ''}>
              <Link to="/history" onClick={() => setMobileActive(false)}><i className="fas fa-history"></i> <span>History</span></Link>
            </li>
            <li className={location.pathname === '/feed' ? 'active' : ''}>
              <Link to="/feed" onClick={() => setMobileActive(false)}><i className="fas fa-rss"></i> <span>Feed</span></Link>
            </li>
            <li className={location.pathname === '/chat' ? 'active' : ''}>
              <Link to="/chat" onClick={() => setMobileActive(false)}><i className="fas fa-comments"></i> <span>Messages</span></Link>
            </li>
            <li className={location.pathname === '/notifications' ? 'active' : ''}>
              <Link to="/notifications" className="nav-link-with-badge" onClick={() => setMobileActive(false)}>
                <i className="fas fa-bell"></i> 
                <span>Notifications</span>
                <span className="notif-dot"></span>
              </Link>
            </li>
            <li className={location.pathname === '/profile' ? 'active' : ''}>
              <Link to="/profile" onClick={() => setMobileActive(false)}><i className="fas fa-user"></i> <span>Profile</span></Link>
            </li>
            <li className={location.pathname === '/ai-coach' ? 'active' : ''}>
              <Link to="/ai-coach" onClick={() => setMobileActive(false)}><i className="fas fa-robot"></i> <span>AI Coach</span></Link>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button id="logout-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ title, rightContent, onToggleMenu }: { title: string, rightContent?: React.ReactNode, onToggleMenu: () => void }) => {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <header className="top-header">
      <div className="header-left">
        <button id="mobile-toggle" className="mobile-only" onClick={onToggleMenu}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="header-titles">
          <h1>{title}</h1>
          <p className="date">{date}</p>
        </div>
      </div>
      {rightContent && <div className="header-right">{rightContent}</div>}
    </header>
  );
};

export const Layout = ({ children, title, onLogout, rightContent }: { children: React.ReactNode, title: string, onLogout: () => void, rightContent?: React.ReactNode }) => {
  const location = useLocation();
  const [mobileActive, setMobileActive] = useState(false);
  
  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} mobileActive={mobileActive} setMobileActive={setMobileActive} />
      <main className="main-content">
        <Header title={title} rightContent={rightContent} onToggleMenu={() => setMobileActive(!mobileActive)} />
        {children}
      </main>

      {/* Floating AI Coach FAB */}
      {location.pathname !== '/ai-coach' && (
        <Link 
          to="/ai-coach" 
          className="ai-fab"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            backgroundColor: 'var(--accent-indigo)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            zIndex: 999,
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <i className="fas fa-robot"></i>
          <span className="ai-pulse"></span>
        </Link>
      )}

      <style>{`
        .ai-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--accent-indigo);
          border-radius: 50%;
          opacity: 0.6;
          animation: pulse-ring 2s infinite;
          z-index: -1;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- DASHBOARD PAGE ---


const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getWorkouts();
        setWorkouts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const defaultStats = { totalWorkouts: 0, monthlyWorkouts: 0, totalVolume: 0, uniqueExercises: 0 };
    if (!Array.isArray(workouts)) return defaultStats;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalWorkouts = workouts.length;

    const monthlyWorkouts = workouts.filter(w => {
      const d = new Date(w.created_at || new Date());
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const totalVolume = workouts.reduce((acc, w) => acc + (w.sets * w.reps * w.weight), 0);

    const uniqueExercises = new Set(workouts.map(w => w.exercise)).size;

    return { totalWorkouts, monthlyWorkouts, totalVolume, uniqueExercises };
  }, [workouts]);

  if (loading) {
    return (
      <Layout title="Dashboard" onLogout={onLogout}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" onLogout={onLogout}>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon emerald"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info">
            <h3>{stats.totalWorkouts}</h3>
            <p>Total Workouts Logged</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon indigo"><i className="fas fa-weight-hanging"></i></div>
          <div className="stat-info" id="tvol">
            <h3>{stats.totalVolume.toLocaleString()}kg</h3>
            <p>Total Volume This Month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><i className="fas fa-trophy"></i></div>
          <div className="stat-info" id="precord">
            <h3>{stats.uniqueExercises}</h3>
            <p>Total Exercises</p>
          </div>
        </div>
      </section>

      <div className="card">
        <h2>Welcome to Barbell's Brigade</h2>
        <p>Track your progress and reach your fitness goals. Use the sidebar to log new workouts or view your history.</p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/log-workout" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Log a Workout</Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;