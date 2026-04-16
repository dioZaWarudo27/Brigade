import React from 'react';
import { Layout } from './Dashboard';
import FoodHistory from '../components/FoodHistory';

const FoodHistoryPage = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Layout title="Food History" onLogout={onLogout}>
      <FoodHistory />
    </Layout>
  );
};

export default FoodHistoryPage;
