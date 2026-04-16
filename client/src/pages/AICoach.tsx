import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './Dashboard';
import { askAICoach } from '../api';

interface Message {
  role: 'user' | 'coach';
  text: string;
}

const AICoach = ({ onLogout }: { onLogout: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'coach', text: "I'm your AI Coach. The fuck do you want? Don't waste my time." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const response = await askAICoach(userMsg);
        setMessages(prev => [...prev, { role: 'coach', text: response.aiFeedback }]);
        success = true;
      } catch (err) {
        attempt++;
        if (attempt < maxRetries) {
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          setMessages(prev => [...prev, { role: 'coach', text: "busy or connections dead. I'm not repeating myself." }]);
        }
      } finally {
        if (success || attempt >= maxRetries) {
          setLoading(false);
        }
      }
    }
  };

  return (
    <Layout title="Cuck AI" onLogout={onLogout}>
      <div className="ai-coach-container" style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        height: 'calc(100vh - 180px)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ width: '45px', height: '45px', background: 'var(--accent-indigo)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff' }}>
            <i className="fas fa-robot"></i>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Cuck</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: '#10b981' }}><i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i> Online & Analyzing Data</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#ef4444' }}><i className="fas fa-exclamation-triangle"></i> Chat history is NOT saved/cached after leaving.</span>
                <span><i className="fas fa-info-circle"></i> AI can make mistakes. Verify critical info.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              background: msg.role === 'user' ? 'var(--accent-indigo)' : 'var(--bg-dark)',
              color: '#fff',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              border: msg.role === 'coach' ? '1px solid var(--border-color)' : 'none'
            }}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-dark)', padding: '12px 16px', borderRadius: '16px 16px 16px 2px', border: '1px solid var(--border-color)' }}>
              <div className="typing-loader" style={{ display: 'flex', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></span>
                <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s ease-in-out' }}></span>
                <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s ease-in-out' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Ask about your stats, diet, or training..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ 
              flex: 1, 
              padding: '12px 20px', 
              borderRadius: '25px', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-dark)', 
              color: 'var(--text-main)', 
              outline: 'none' 
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            style={{ 
              width: '45px', 
              height: '45px', 
              borderRadius: '50%', 
              background: 'var(--accent-indigo)', 
              color: '#fff', 
              border: 'none', 
              cursor: (loading || !input.trim()) ? 'default' : 'pointer',
              opacity: (loading || !input.trim()) ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </Layout>
  );
};

export default AICoach;
