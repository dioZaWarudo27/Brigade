import React, { useState, useEffect } from 'react';
import { Layout } from './Dashboard';
import { getWorkouts } from '../api';
import type { Workout } from '../types/workout';

const History = ({ onLogout }: { onLogout: () => void }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getWorkouts(); //get the workouts
        setWorkouts(data); //put all the workouts in the usestate where takes an argument as array
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory(); // fetch the history
  }, []);

  // for mapping the date 
  const filteredWorkouts = selectedDate 
    ? workouts.filter(w => w.created_at && new Date(w.created_at).toDateString() === selectedDate)
    : workouts;

  if (loading) {
    return (
      <Layout title="History" onLogout={onLogout}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="History" onLogout={onLogout}>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
            >
              Clear Filter
            </button>
          )}
          <button 
            className="calendar-toggle-btn"
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>{selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Calendar'}</span>
          </button>
        </div>

        {showCalendar && (
          <div className="calendar-popup" style={{
            position: 'absolute',
            top: '55px',
            right: '0',
            width: '300px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            padding: '15px',
            zIndex: 100,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                const hasWorkout = workouts.some(w => w.created_at && new Date(w.created_at).toDateString() === dateStr);
                const isToday = new Date().toDateString() === dateStr;
                const isSelected = selectedDate === dateStr;

                return (
                  <div 
                    key={day}
                    onClick={() => {
                      setSelectedDate(isSelected ? null : dateStr);
                      setShowCalendar(false);
                    }}
                    style={{
                      padding: '8px 0',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--accent-indigo)' : (hasWorkout ? 'rgba(79, 70, 229, 0.2)' : 'transparent'),
                      border: isToday ? '1px solid var(--accent-indigo)' : 'none',
                      color: isSelected ? '#fff' : (hasWorkout ? 'var(--accent-indigo)' : 'var(--text-main)'),
                      fontWeight: hasWorkout || isToday || isSelected ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                    title={hasWorkout ? 'Workout logged' : ''}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => setShowCalendar(false)}
              style={{ width: '100%', marginTop: '15px', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <div className="history-list">
        {selectedDate && (
          <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Workouts for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {filteredWorkouts.length} found
            </span>
          </div>
        )}

        {filteredWorkouts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <i className="fas fa-dumbbell" style={{ fontSize: '2rem', color: 'var(--border-color)', marginBottom: '15px', display: 'block' }}></i>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {selectedDate ? 'No workouts logged for this day.' : 'No workouts found in your history.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredWorkouts.map(workout => (
              <div key={workout.id} className="history-card" style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                padding: '20px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize', fontSize: '1.1rem' }}>{workout.exercise}</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {workout.sets} sets × {workout.reps} reps @ {workout.weight}kg
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-indigo)', fontSize: '1.1rem' }}>
                    {(workout.sets * workout.reps * workout.weight).toLocaleString()}kg
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Total Volume
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;