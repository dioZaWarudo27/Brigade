import React from 'react';
import { Layout } from './Dashboard';
import FoodLog from '../components/FoodLog';

const LogFoodPage = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Layout title="Log Food" onLogout={onLogout}>
      <div className="workspace-grid" style={{ gridTemplateColumns: '1fr' }}>
        <FoodLog />
      </div>
    </Layout>
  );
};

export default LogFoodPage;
