import React, { useState } from 'react';
import { searchFood, getFatSecretFood, logToFatSecret, connectFatSecret } from '../api';
import toast from 'react-hot-toast';

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

const FatSecretLog: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [selectedServingId, setSelectedServingId] = useState('');
  const [units, setUnits] = useState(1);
  const [meal, setMeal] = useState('breakfast');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchFood(query);
      setResults(data);
    } catch (err) {
      console.error('Search failed', err);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = async (foodId: string) => {
    setLoading(true);
    try {
      const data = await getFatSecretFood(foodId);
      setSelectedFood(data);
      if (data.servings?.serving) {
        const servings = Array.isArray(data.servings.serving) 
          ? data.servings.serving 
          : [data.servings.serving];
        setSelectedServingId(servings[0].serving_id);
      }
    } catch (err) {
      console.error('Failed to get food details', err);
      toast.error('Failed to load food details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogToDiary = async () => {
    if (!selectedFood || !selectedServingId) return;

    try {
      const payload = {
        food_id: selectedFood.food_id,
        food_entry_name: selectedFood.food_name,
        serving_id: selectedServingId,
        number_of_units: units,
        meal,
        date
      };

      const data = await logToFatSecret(payload);

      if (data.error) {
        toast.error('Error: ' + data.error);
      } else {
        toast.success('Food logged to FatSecret diary!');
        setSelectedFood(null);
      }
    } catch (err) {
      console.error('Logging failed', err);
      toast.error('Logging failed. Check your connection.');
    }
  };

  const handleConnect = async () => {
    try {
      const data = await connectFatSecret();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Connect failed', err);
      toast.error('Failed to initiate connection.');
    }
  };

  return (
    <div className="fatsecret-log card p-4">
      <h3 className="mb-3">Log to FatSecret Diary</h3>
      <button onClick={handleConnect} className="btn btn-outline-primary mb-4 w-100">
        <i className="fas fa-link me-2"></i> Connect FatSecret Account
      </button>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search FatSecret database..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Search'}
          </button>
        </div>
      </form>

      {results.length > 0 && !selectedFood && (
        <div className="list-group mb-4 shadow-sm">
          {results.map((f) => (
            <button 
              key={f.food_id} 
              type="button"
              className="list-group-item list-group-item-action py-3"
              onClick={() => handleSelectFood(f.food_id)}
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{f.food_name}</h5>
              </div>
              <small className="text-muted">{f.food_description}</small>
            </button>
          ))}
        </div>
      )}

      {selectedFood && (
        <div className="logging-form border p-4 rounded shadow-sm bg-light">
          <h4 className="border-bottom pb-2 mb-3">{selectedFood.food_name}</h4>
          
          <div className="mb-3">
            <label className="form-label fw-bold">Serving Type</label>
            <select 
              className="form-select"
              value={selectedServingId}
              onChange={(e) => setSelectedServingId(e.target.value)}
            >
              {(Array.isArray(selectedFood.servings.serving) 
                ? selectedFood.servings.serving 
                : [selectedFood.servings.serving]
              ).map((s: any) => (
                <option key={s.serving_id} value={s.serving_id}>
                  {s.serving_description} ({s.calories} kcal)
                </option>
              ))}
            </select>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label fw-bold">Units</label>
              <input 
                type="number" 
                step="0.1"
                className="form-control"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">Meal</label>
              <select 
                className="form-select"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Date</label>
            <input 
              type="date" 
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="d-grid gap-2">
            <button onClick={handleLogToDiary} className="btn btn-success btn-lg">
              <i className="fas fa-check-circle me-2"></i> Log to FatSecret
            </button>
            <button onClick={() => setSelectedFood(null)} className="btn btn-outline-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FatSecretLog;