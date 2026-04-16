import React, { useState, useEffect } from 'react';
import { searchFoodNinja, saveFoodNinja, getFoods } from '../api';
import toast from 'react-hot-toast';

const FoodLog: React.FC = () => {
  const [query, setQuery] = useState('');
  const [recentQuery, setRecentQuery] = useState('');
  const [foodSearch, setFoodSearch] = useState<any[]>([]);
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  
  // Selection state
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'search' | 'recent'>('search');

  // 1. Fetch Ninja Foods (API)
  const performNinjaSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSelectedFood(null); 
    try {
      const data = await searchFoodNinja(searchTerm);
      setFoodSearch(data);
    } catch (error) {
      console.error('API search failed', error);
      setFoodSearch([]);
      toast.error('Food search failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Recent Foods (Database)
  const performRecentSearch = async (searchTerm: string) => {
    setRecentLoading(true);
    try {
      const data = await getFoods(undefined, searchTerm);
      // Filter unique foods by name for the "recent" list
      const unique = data.filter((f: any, index: number, self: any[]) => 
        index === self.findIndex((t) => t.food_name === f.food_name)
      );
      setRecentFoods(unique);
    } catch (error) {
      console.error('Database search failed', error);
    } finally {
      setRecentLoading(false);
    }
  };

  // tab switching
  useEffect(() => {
    if (activeTab === 'recent') {
      performRecentSearch(recentQuery);
    }
  }, [activeTab, recentQuery]);

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setQuantity(1);
  };

  const handleLogFood = async() =>{
    if (!selectedFood) return;
    setLoggingId(selectedFood.food_name);
    try{
      const logData = {
        food_name: selectedFood.food_name,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        serving_description: quantity // Multiplier
      }

      await saveFoodNinja(logData);
      
      toast.success(`Successfully logged ${logData.food_name}`);
      setSelectedFood(null); 
      setQuery('');
      // Refresh recents if we were on that tab
      if (activeTab === 'recent') performRecentSearch(recentQuery);

    } catch(error: any){
      console.error('Logging error:', error)
      toast.error(error.message || 'Error logging food.');
    } finally {
      setLoggingId(null);
    }
  }

  //debounce
  useEffect(() => {
    if (activeTab !== 'search' || query.trim().length < 2) {
      setFoodSearch([]);
      return;
    }
    const timeoutId = setTimeout(() => performNinjaSearch(query), 1000);
    return () => clearTimeout(timeoutId);
  }, [query, activeTab]);

  useEffect(() => {
    if (activeTab !== 'recent') return;
    const timeoutId = setTimeout(() => performRecentSearch(recentQuery), 500);
    return () => clearTimeout(timeoutId);
  }, [recentQuery, activeTab]);

  return (
    <section className="card food-log" style={{ 
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <div className="card-header" style={{
        padding: '20px 25px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-utensils" style={{ color: 'var(--accent-indigo)' }}></i>
          {selectedFood ? 'Log Details' : 'Food Tracker'}
        </h2>
        
        {!selectedFood && (
          <div className="tab-buttons" style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setActiveTab('search')}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'search' ? 'var(--accent-indigo)' : 'transparent',
                color: activeTab === 'search' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              API Search
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'recent' ? 'var(--accent-indigo)' : 'transparent',
                color: activeTab === 'recent' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              Recent Foods
            </button>
          </div>
        )}
      </div>

      <div className="search-container" style={{ padding: '30px 25px' }}>
        {!selectedFood ? (
          <>
            {activeTab === 'search' ? (
              <>
                <form onSubmit={(e) => { e.preventDefault(); performNinjaSearch(query); }} className="form-group">
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Search Ninja API (e.g. 100g Steak)..." 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '12px 15px', outline: 'none' }}
                    />
                    <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '0 20px', borderRadius: '8px' }}>
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </form>

                <div className="search-results" style={{ marginTop: '20px' }}>
                  {foodSearch.map((food, index) => (
                    <div key={index} onClick={() => handleSelectFood(food)} className="result-item" style={{ 
                      padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' 
                    }}>
                      <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize' }}>{food.food_name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{food.calories} kcal | P: {food.protein}g C: {food.carbs}g F: {food.fat}g</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Filter your recent logs..." 
                      value={recentQuery}
                      onChange={(e) => setRecentQuery(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '12px 15px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="recent-results" style={{ marginTop: '20px' }}>
                  {recentLoading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</p>
                  ) : recentFoods.length > 0 ? (
                    recentFoods.map((food) => (
                      <div key={food.id} onClick={() => handleSelectFood(food)} className="result-item" style={{ 
                        padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' 
                      }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{food.food_name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{food.calories} kcal | Last logged: {new Date(food.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent foods found.</p>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="detailed-log-view">
            <button onClick={() => setSelectedFood(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', marginBottom: '20px' }}>
              <i className="fas fa-arrow-left"></i> Back
            </button>

            <h3 style={{ textTransform: 'capitalize' }}>{selectedFood.food_name}</h3>
            
            <div className="macros-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '20px 0' }}>
              <div className="macro-box">
                <strong>{Number((selectedFood.calories * quantity).toFixed(1))}</strong>
                <span>Cals</span>
              </div>
              <div className="macro-box" style={{ borderColor: 'rgba(255, 77, 77, 0.3)' }}>
                <strong style={{ color: '#ff4d4d' }}>{Number((selectedFood.protein * quantity).toFixed(1))}g</strong>
                <span>Prot</span>
              </div>
              <div className="macro-box" style={{ borderColor: 'rgba(77, 148, 255, 0.3)' }}>
                <strong style={{ color: '#4d94ff' }}>{Number((selectedFood.carbs * quantity).toFixed(1))}g</strong>
                <span>Carb</span>
              </div>
              <div className="macro-box" style={{ borderColor: 'rgba(255, 204, 0, 0.3)' }}>
                <strong style={{ color: '#ffcc00' }}>{Number((selectedFood.fat * quantity).toFixed(1))}g</strong>
                <span>Fat</span>
              </div>
            </div>

            <div className="quantity-control" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quantity Multiplier</label>
              <input 
                type="number" 
                step="0.1" 
                value={quantity} 
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
              />
            </div>

            <button 
              className="primary-btn" 
              onClick={handleLogFood}
              disabled={loggingId !== null}
              style={{ width: '100%', padding: '15px', borderRadius: '12px' }}
            >
              {loggingId ? 'Saving...' : 'Save to Diary'}
            </button>
          </div>
        )}
      </div>
      <style>{`
        .macro-box { text-align: center; padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); borderRadius: 12px; }
        .macro-box strong { display: block; fontSize: 1.2rem; }
        .macro-box span { fontSize: 0.7rem; color: var(--text-muted); textTransform: uppercase; }
        .result-item:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>
    </section>
  );
};

export default FoodLog;