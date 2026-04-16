import React, { useState, useEffect } from 'react';

interface PhysicalFact {
  injury?: string[];
  weight?: string;
  diet_goal?: string;
  limitations?: string[];
}

interface AgentInsight {
  extracted_data: PhysicalFact;
  reasoning: string;
}

const AgentOneInsights = () => {
  const [insight, setInsight] = useState<AgentInsight | null>(null);
  const [loading, setLoading] = useState(true);

  // Senior Tip: We fetch this from the user's profile metadata 
  // where Agent 1 saves its findings.
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        const data = await response.json();
        
        // Assuming coach_notes is where Agent 1 stores its R1 reasoning/data
        if (data.coach_notes) {
          setInsight(data.coach_notes);
        }
      } catch (err) {
        console.error("Failed to load AI insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <div className="text-muted">Analyzing physical data...</div>;
  if (!insight) return null;

  return (
    <div className="agent-insight-card" style={{
      background: 'rgba(99, 102, 241, 0.05)',
      border: '1px solid var(--accent-indigo)',
      borderRadius: '12px',
      padding: '15px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <i className="fas fa-brain" style={{ color: 'var(--accent-indigo)' }}></i>
        <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Agent 1: Physical Intelligence
        </h4>
      </div>

      <div className="insight-content" style={{ fontSize: '0.85rem' }}>
        {insight.extracted_data.weight && (
          <div style={{ marginBottom: '5px' }}>
            <strong>Weight Trend:</strong> {insight.extracted_data.weight}
          </div>
        )}
        {insight.extracted_data.injury && insight.extracted_data.injury.length > 0 && (
          <div style={{ marginBottom: '5px', color: '#ef4444' }}>
            <strong>Active Injuries:</strong> {insight.extracted_data.injury.join(', ')}
          </div>
        )}
        
        <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />
        
        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', margin: 0 }}>
          "{insight.reasoning}"
        </p>
      </div>
    </div>
  );
};

export default AgentOneInsights;
