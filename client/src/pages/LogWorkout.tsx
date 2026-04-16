import React, { useState, useEffect } from 'react';
import { Layout } from './Dashboard';
import { addWorkouts, getWorkouts, deleteWorkout, updateWorkout, getWorkoutLibrary, searchWorkoutHistory } from '../api';
import type { Workout } from '../types/workout';
import toast from 'react-hot-toast';

const LogWorkout = ({ onLogout }: { onLogout: () => void }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryExpanded, setLibraryExpanded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    body_part: ''
  });

  const fetchInitialData = async () => {
    try {
      const [allWorkouts, libData] = await Promise.all([
        getWorkouts(),
        getWorkoutLibrary()
      ]);
      setWorkouts(allWorkouts);
      setLibrary(libData);
    } catch (error) {
      console.error('error', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debouncer Implementation (500ms)
  useEffect(() => {
    if (formData.exercise.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch(formData.exercise);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.exercise]);

  const handleSearch = async (val: string) => {
    setLoading(true);
    try {
      const historyResults = await searchWorkoutHistory(val);
      let globalResults: any[] = [];
      if (historyResults.length < 5) {
        const globalRes = await fetch(`/api/workoutninja?query=${val}`);
        if (globalRes.ok) globalResults = await globalRes.json();
      }

      const merged = [
        ...historyResults.map((h: any) => ({ ...h, isHistory: true })),
        ...globalResults.filter(g => !historyResults.some((h: any) => h.exercise.toLowerCase() === g.exercise.toLowerCase()))
      ];

      setSuggestions(merged.slice(0, 10));
    } catch (err) {
      toast.error('Failed to fetch data')
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const selectExercise = (item: { exercise: string, body_part: string }) => {
    setFormData(prev => ({
      ...prev,
      exercise: item.exercise,
      body_part: item.body_part
    }));
    setSuggestions([]);
    setShowLibrary(false);
    setLibraryExpanded(false);
  };

  const handleEdit = (workout: Workout) => {
    setFormData({
      exercise: workout.exercise,
      sets: workout.sets.toString(),
      reps: workout.reps.toString(),
      weight: workout.weight.toString(),
      body_part: (workout.body_part || '').toString()
    });
    setEditingId(workout.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dataToSend = {
      exercise: formData.exercise,
      sets: parseInt(formData.sets) || 0,
      reps: parseInt(formData.reps) || 0,
      weight: parseFloat(formData.weight) || 0,
      body_part: formData.body_part || 'other',
    };

    try {
      if (editingId) {
        await updateWorkout(editingId, dataToSend);
        toast.success('Succesfully Patched')
        setEditingId(null);
      } else {
        await addWorkouts(dataToSend);
        toast.success('Workout added')
      }
      setFormData({ exercise: '', sets: '', reps: '', weight: '', body_part: '' });
      setSuggestions([]);
      fetchInitialData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  const handleDelete = (id: number) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>Delete this workout?</span>
        <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
          <button 
            onClick={async () => {
              toast.dismiss(t.id); // Senior Fix: Immediate dismissal
              const deletePromise = deleteWorkout(id);
              toast.promise(deletePromise, {
                loading: 'Removing...',
                success: 'Workout deleted.',
                error: 'Failed to delete.',
              }, {
                id: `delete-workout-${id}` // Static ID prevents duplication
              });
              try {
                await deletePromise;
                fetchInitialData();
              } catch (err) {
                console.error('Delete error:', err);
              }
            }}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      id: 'confirm-delete-workout', // Unique ID for confirmation
      duration: Infinity,
      position: 'bottom-center',
      style: {
        background: 'var(--card-bg)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        padding: '16px',
      }
    });
  };

  const displayedLibrary = libraryExpanded ? library : library.slice(0, 5);
  const todayStr = new Date().toDateString();
  const todaysWorkouts = workouts.filter(w => w.created_at && new Date(w.created_at).toDateString() === todayStr);
  const displayedWorkouts = isExpanded ? todaysWorkouts : todaysWorkouts.slice(0, 3);

  return (
    <Layout title="Log Workout" onLogout={onLogout}>
      <div className="workspace-grid" style={{ gridTemplateColumns: '1fr' }}>
        <section className="card workout-log">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{editingId ? 'Edit Workout' : 'Quick Log'}</h2>
            {!editingId && (
              <button 
                onClick={() => { setShowLibrary(!showLibrary); if(showLibrary) setLibraryExpanded(false); }}
                style={{
                  background: showLibrary ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  padding: '6px 15px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <i className={showLibrary ? "fas fa-times" : "fas fa-book"}></i>
                {showLibrary ? "Close Library" : "My Library"}
              </button>
            )}
          </div>

          {/* Dedicated Library Section */}
          {showLibrary && !editingId && (
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '12px', 
              padding: '15px', 
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              maxHeight: libraryExpanded ? '400px' : 'auto',
              overflowY: libraryExpanded ? 'auto' : 'visible',
              position: 'relative'
            }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {libraryExpanded ? "Full Exercise Library" : "Recent Movements"}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {library.length === 0 ? (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Your library is empty. Log some workouts to fill it!</p>
                ) : (
                  displayedLibrary.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => selectExercise(item)}
                      style={{
                        background: 'var(--bg-dark)',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-indigo)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' }}>{item.exercise}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.body_part}</div>
                    </div>
                  ))
                )}
              </div>
              
              {library.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    onClick={() => setLibraryExpanded(!libraryExpanded)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {libraryExpanded ? "See Less" : `See All (${library.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          <form className="log-form" onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="exercise">Exercise</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="exercise" 
                  autoComplete="off"
                  placeholder="Search your library or global exercises..." 
                  value={formData.exercise}
                  onChange={handleChange}
                  required 
                />
                {loading && <div style={{ position: 'absolute', right: '15px', top: '12px' }}><i className="fas fa-spinner fa-spin"></i></div>}
              </div>

              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--sidebar-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  zIndex: 100,
                  maxHeight: '250px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  marginTop: '5px'
                }}>
                  {suggestions.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectExercise(item)}
                      style={{
                        padding: '12px 15px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.isHistory && <i className="fas fa-bookmark" style={{ color: 'var(--accent-indigo)', fontSize: '0.8rem' }} title="From your library"></i>}
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.exercise}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize' }}>
                        {item.body_part}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sets">Sets</label>
                <input type="number" id="sets" value={formData.sets} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="reps">Reps</label>
                <input type="number" id="reps" value={formData.reps} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input type="number" id="weight" value={formData.weight} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="secondary-btn">
                {editingId ? 'Update Workout' : 'Log Workout'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="delete-btn" 
                  style={{ border: '1px solid #ef4444', padding: '10px 20px' }}
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ exercise: '', sets: '', reps: '', weight: '', body_part: '' });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card recent-activity">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Today's Workouts</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
              {todaysWorkouts.length} Today
            </span>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Muscle</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Weight</th>
                <th>Volume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysWorkouts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                    No workouts logged today.
                  </td>
                </tr>
              ) : (
                displayedWorkouts.map(w => (
                  <tr key={w.id}>
                    <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>{w.exercise}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize' }}>
                        {w.body_part || 'Other'}
                      </span>
                    </td>
                    <td>{w.sets}</td>
                    <td>{w.reps}</td>
                    <td>{w.weight}kg</td>
                    <td>{(w.sets * w.reps * w.weight).toLocaleString()}kg</td>
                    <td>
                      <button className="edit-btn" title="Edit Workout" onClick={() => handleEdit(w)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(w.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {todaysWorkouts.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <button 
                className="outline-btn" 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--accent-indigo)', 
                  color: 'var(--accent-indigo)', 
                  padding: '8px 20px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <><i className="fas fa-chevron-up"></i> Show Less</>
                ) : (
                  <><i className="fas fa-chevron-down"></i> Show More ({todaysWorkouts.length - 3} hidden)</>
                )}
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default LogWorkout;
