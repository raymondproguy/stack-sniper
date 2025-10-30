import React, { useState } from 'react';
import { apiService } from '../../services/api';

interface DebugPanelProps {
  onHistoryUpdate: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ onHistoryUpdate }) => {
  const [activeFeature, setActiveFeature] = useState<'snipe' | 'debug' | 'review' | 'explain'>('snipe');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [concept, setConcept] = useState('');
  const [result, setResult] = useState<{ content: string; responseTime: number; source: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!error && activeFeature !== 'explain') return;

    setLoading(true);
    setResult(null);

    try {
      let response;
      let source = '';

      switch (activeFeature) {
        case 'snipe':
          response = await apiService.snipeError(error);
          source = 'Stack Overflow';
          break;
        
        case 'debug':
          response = await apiService.debugError(error, code);
          source = 'DeepSeek AI';
          break;
        
        case 'review':
          response = await apiService.reviewCode(code);
          source = 'DeepSeek AI';
          break;
        
        case 'explain':
          response = await apiService.explainConcept(concept);
          source = 'DeepSeek AI';
          break;
      }

      setResult({
        content: 'solution' in response ? response.solution : 
                'review' in response ? response.review : 
                response.explanation,
        responseTime: response.responseTime,
        source
      });

      onHistoryUpdate();
    } catch (error) {
      console.error('API call failed:', error);
      setResult({
        content: `Error: ${error instanceof Error ? error.message : 'Request failed'}`,
        responseTime: 0,
        source: 'System'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debug-panel">
      <div className="feature-tabs">
        <button 
          className={`tab-btn ${activeFeature === 'snipe' ? 'active' : ''}`}
          onClick={() => setActiveFeature('snipe')}
        >
          <i className="fas fa-crosshairs"></i>
          Stack Snipe
        </button>
        <button 
          className={`tab-btn ${activeFeature === 'debug' ? 'active' : ''}`}
          onClick={() => setActiveFeature('debug')}
        >
          <i className="fas fa-bug"></i>
          AI Debug
        </button>
        <button 
          className={`tab-btn ${activeFeature === 'review' ? 'active' : ''}`}
          onClick={() => setActiveFeature('review')}
        >
          <i className="fas fa-code"></i>
          Code Review
        </button>
        <button 
          className={`tab-btn ${activeFeature === 'explain' ? 'active' : ''}`}
          onClick={() => setActiveFeature('explain')}
        >
          <i className="fas fa-lightbulb"></i>
          Explain Concept
        </button>
      </div>

      <form onSubmit={handleSubmit} className="debug-form">
        {activeFeature !== 'explain' && (
          <div className="form-group">
            <label htmlFor="errorInput">
              {activeFeature === 'review' ? 'Code to Review' : 'Error Message'}
            </label>
            <textarea
              id="errorInput"
              value={error}
              onChange={(e) => setError(e.target.value)}
              placeholder={
                activeFeature === 'review' 
                  ? 'Paste your code here for review...'
                  : 'Paste your error message here...\nExample: TypeError: Cannot read properties of undefined'
              }
              rows={4}
              required={activeFeature !== 'review'}
            />
          </div>
        )}

        {(activeFeature === 'debug' || activeFeature === 'review') && (
          <div className="form-group">
            <label htmlFor="codeInput">Related Code (Optional)</label>
            <textarea
              id="codeInput"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste related code for better context..."
              rows={6}
            />
          </div>
        )}

        {activeFeature === 'explain' && (
          <div className="form-group">
            <label htmlFor="conceptInput">Programming Concept</label>
            <input
              id="conceptInput"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter a programming concept to explain..."
              required
            />
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Processing...
            </>
          ) : (
            <>
              <i className={`fas ${
                activeFeature === 'snipe' ? 'fa-crosshairs' :
                activeFeature === 'debug' ? 'fa-bug' :
                activeFeature === 'review' ? 'fa-code' : 'fa-lightbulb'
              }`}></i>
              {activeFeature === 'snipe' ? 'Snipe Error' :
               activeFeature === 'debug' ? 'Debug with AI' :
               activeFeature === 'review' ? 'Review Code' : 'Explain Concept'}
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="result-panel">
          <div className="result-header">
            <h3>
              <i className="fas fa-check-circle"></i>
              Solution Found
            </h3>
            <div className="result-meta">
              <span className="source-badge">{result.source}</span>
              <span className="time-badge">
                <i className="fas fa-clock"></i>
                {result.responseTime}ms
              </span>
            </div>
          </div>
          <div className="result-content">
            {result.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
