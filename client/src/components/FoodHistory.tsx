import React, { useState, useEffect } from 'react';
import { getFoods, getProfile, deleteFood } from '../api';
import toast, { Toaster } from 'react-hot-toast';

const FoodHistory: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewAll, setViewAll] = useState(false);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCalories, setTargetCalories] = useState(2000);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsResult, profileData] = await Promise.all([
        getFoods(selectedDate),
        getProfile()
      ]);
      
      setFoods(Array.isArray(foodsResult) ? foodsResult : []);
      
      if (profileData && (profileData.target_calories || profileData.tdee)) {
        setTargetCalories(profileData.target_calories || profileData.tdee);
      }
    } catch (err) {
      console.error('Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleDeleteFood = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteFood(id);
        // Refresh by updating local state for immediate feedback
        setFoods(prev => prev.filter(food => food.id !== id));
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Failed to delete food entry.');
      }
    }
  };

  // Calculations
  const totalCalories = foods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const totalProtein = foods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const totalCarbs = foods.reduce((acc, f) => acc + (Number(f.carbs) || 0), 0);
  const totalFat = foods.reduce((acc, f) => acc + (Number(f.fat) || 0), 0);

  const displayedFoods = viewAll ? foods : foods.slice(0, 3);

  return (
    <div className="food-history-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Total Calories on Top */}
      <div className="card calorie-summary-card" style={{ 
        background: 'var(--accent-indigo)', 
        color: 'white', 
        borderRadius: '16px', 
        border: 'none',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
      }}>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem', fontWeight: 500 }}>Total Calories Today</p>
        <h2 style={{ fontSize: '3.5rem', margin: '10px 0', fontWeight: 800 }}>
          {loading ? '...' : totalCalories} 
          <span style={{ fontSize: '1.2rem', fontWeight: 400, opacity: 0.8, marginLeft: '10px' }}>/ {targetCalories} kcal</span>
        </h2>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', margin: '15px 0' }}>
            <div style={{ 
              width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%`, 
              height: '100%', 
              background: 'white', 
              borderRadius: '4px', 
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <small style={{ opacity: 0.9 }}>
            {loading ? 'Calculating...' : `${Math.round((totalCalories / targetCalories) * 100)}% of your daily goal`}
          </small>
        </div>
      </div>

      <div className="history-content-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: viewAll ? '1fr' : '1fr 320px', 
        gap: '20px',
        transition: 'all 0.3s ease'
      }}>
        
        {/* 2. Meals & Snacks Section */}
        <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ 
            padding: '20px 25px', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               {viewAll && (
                 <button 
                   onClick={() => setViewAll(false)}
                   style={{ background: 'transparent', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                 >
                   <i className="fas fa-arrow-left"></i>
                 </button>
               )}
               <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>
                 {viewAll ? 'All Logged Foods' : 'Recent Meals & Snacks'}
               </h3>
             </div>

             {/* Calendar in Top Right */}
             <div className="date-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="desktop-only">
                 {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="header-search-input"
                 style={{ 
                   width: 'auto', 
                   padding: '6px 12px', 
                   background: 'var(--bg-dark)', 
                   border: '1px solid var(--border-color)', 
                   borderRadius: '8px',
                   color: 'white',
                   outline: 'none',
                   fontSize: '0.85rem'
                 }}
               />
             </div>
          </div>

          <div className="food-list">
            {loading ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner"></div>
              </div>
            ) : displayedFoods.length > 0 ? (
              displayedFoods.map((item, idx) => (
                <div key={item.id || idx} className="food-item-row" style={{ 
                  padding: '18px 25px', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{item.food_name || item.name}</h4>
                    <small className="text-muted">
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} • {item.calories} kcal
                    </small>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>P: {item.protein}g</span> • 
                      <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}> C: {item.carbs}g</span> • 
                      <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}> F: {item.fat}g</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteFood(item.id)}
                      style={{ 
                        background: 'rgba(255, 77, 77, 0.1)', 
                        border: 'none', 
                        color: '#ff4d4d', 
                        cursor: 'pointer',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Delete entry"
                    >
                      <i className="fas fa-trash-alt" style={{ fontSize: '0.9rem' }}></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 40px', textAlign: 'center' }} className="text-muted">
                <i className="fas fa-utensils" style={{ fontSize: '2rem', marginBottom: '15px', display: 'block', opacity: 0.3 }}></i>
                No entries found for this date.
              </div>
            )}
          </div>

          {/* View All Button */}
          {!viewAll && foods.length > 3 && (
            <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <button 
                onClick={() => setViewAll(true)}
                className="secondary-btn"
                style={{ width: 'auto', padding: '10px 30px', borderRadius: '10px' }}
              >
                View all logged foods today
              </button>
            </div>
          )}

          {viewAll && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <button 
                onClick={() => setViewAll(false)}
                className="text-muted"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                Return to summary view
              </button>
            </div>
          )}
        </div>

        {/* 3. Macro Breakdown Sidebar (Hidden when viewAll is true) */}
        {!viewAll && (
          <div className="history-summary" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '25px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-chart-pie" style={{ color: 'var(--accent-indigo)' }}></i>
                Macro Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <MacroBar label="Protein" value={`${totalProtein}g`} color="var(--accent-emerald)" percentage={`${Math.min((totalProtein / 150) * 100, 100)}%`} />
                <MacroBar label="Carbohydrates" value={`${totalCarbs}g`} color="var(--accent-amber)" percentage={`${Math.min((totalCarbs / 300) * 100, 100)}%`} />
                <MacroBar label="Fats" value={`${totalFat}g`} color="var(--accent-indigo)" percentage={`${Math.min((totalFat / 80) * 100, 100)}%`} />
              </div>
              
              <div style={{ marginTop: '30px', padding: '15px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  <span>Nutrient Summary</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>Active</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Tracking {foods.length} items</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const MacroBar = ({ label, value, color, percentage }: any) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{value}</span>
    </div>
    <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ 
        width: percentage, 
        height: '100%', 
        background: color, 
        borderRadius: '4px',
        transition: 'width 0.5s ease'
      }}></div>
    </div>
  </div>
);

export default FoodHistory;
