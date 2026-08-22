import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { 
  HiOutlineAdjustmentsHorizontal, 
  HiOutlineCommandLine, 
  HiOutlineCpuChip,
  HiOutlineArrowPath,
  HiOutlineTrash,
  HiOutlineCircleStack,
  HiOutlineBolt
} from 'react-icons/hi2';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import './SettingsPage.css';

const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('preferences');

  // Dev tools states
  const [seedLoading, setSeedLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // ML panel states
  const [mlMetadata, setMlMetadata] = useState(null);
  const [mlStats, setMlStats] = useState(null);
  const [featureImportances, setFeatureImportances] = useState([]);
  const [mlLoading, setMlLoading] = useState(false);
  const [retrainLoading, setRetrainLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'mlpanel') {
      fetchMLInfo();
    }
  }, [activeTab]);

  const fetchMLInfo = async () => {
    setMlLoading(true);
    try {
      const [metaRes, statsRes, impRes] = await Promise.all([
        api.get('/models/metadata'),
        api.get('/models/statistics'),
        api.get('/models/feature-importances')
      ]);
      setMlMetadata(metaRes.data);
      setMlStats(statsRes.data);
      setFeatureImportances(impRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load machine learning model details.');
    } finally {
      setMlLoading(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully.');
  };

  const handleSeedData = async () => {
    setSeedLoading(true);
    try {
      const res = await api.post('/devtools/seed?count=200');
      toast.success(`Success! Seeded ${res.data.shipments_seeded} shipments, ${res.data.decisions_seeded} decisions, and ${res.data.feedback_logs_seeded} feedback loops.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to seed database.');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleClearData = async () => {
    const confirm = window.confirm("Are you sure you want to clear the entire database? All shipments, decisions, and analytics history will be permanently deleted.");
    if (!confirm) return;

    setClearLoading(true);
    try {
      await api.post('/devtools/clear');
      toast.success('Database successfully cleared.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear database.');
    } finally {
      setClearLoading(false);
    }
  };

  const handleRunFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await api.post('/analytics/feedback');
      toast.success(`Feedback loop execution complete. ${res.data.length} pending decisions evaluated.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to run feedback loop pipeline.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetrainLoading(true);
    try {
      await api.post('/models/retrain');
      toast.success('XGBoost model retraining finished successfully!');
      await fetchMLInfo();
    } catch (err) {
      console.error(err);
      toast.error('Model retraining failed.');
    } finally {
      setRetrainLoading(false);
    }
  };

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure preferences, manage data stores, and monitor the ML pipeline.</p>
      </div>

      {/* Tabs Menu */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <HiOutlineAdjustmentsHorizontal className="tab-icon" />
          Preferences
        </button>
        <button 
          className={`tab-btn ${activeTab === 'devtools' ? 'active' : ''}`}
          onClick={() => setActiveTab('devtools')}
        >
          <HiOutlineCommandLine className="tab-icon" />
          Developer Tools
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mlpanel' ? 'active' : ''}`}
          onClick={() => setActiveTab('mlpanel')}
        >
          <HiOutlineCpuChip className="tab-icon" />
          ML Control Panel
        </button>
      </div>

      <div className="settings-tab-content">
        {/* Tab 1: Preferences */}
        {activeTab === 'preferences' && (
          <div className="tab-panel">
            <div className="settings-card glass-panel">
              <h2>Appearance</h2>
              <div className="setting-item">
                <div>
                  <h3>Dark Mode</h3>
                  <p>Toggle dark mode for the application interface.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="settings-card glass-panel">
              <h2>Notifications</h2>
              <div className="setting-item">
                <div>
                  <h3>Email Alerts</h3>
                  <p>Receive email notifications for delayed shipments.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h3>System Feedback Loop</h3>
                  <p>Automatically trigger ML retraining alert flags on high variance.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-primary" onClick={handleSavePreferences}>Save Preferences</button>
            </div>
          </div>
        )}

        {/* Tab 2: Developer Tools */}
        {activeTab === 'devtools' && (
          <div className="tab-panel">
            <div className="settings-grid">
              <div className="devtools-card glass-panel">
                <div className="card-icon-wrapper seed">
                  <HiOutlineCircleStack />
                </div>
                <h2>Seed Database</h2>
                <p>Populate database with 200 random shipments, mock decisions, and feedback metrics directly from mock CSV datasets.</p>
                <button 
                  className="btn btn-seed" 
                  onClick={handleSeedData}
                  disabled={seedLoading}
                >
                  {seedLoading ? 'Seeding...' : 'Seed Mock Data'}
                </button>
              </div>

              <div className="devtools-card glass-panel">
                <div className="card-icon-wrapper clear">
                  <HiOutlineTrash />
                </div>
                <h2>Clear Database</h2>
                <p>Delete all shipment, decision history, analytics snapshots, and feedback logs. Hard system reset.</p>
                <button 
                  className="btn btn-clear" 
                  onClick={handleClearData}
                  disabled={clearLoading}
                >
                  {clearLoading ? 'Clearing...' : 'Clear Data'}
                </button>
              </div>

              <div className="devtools-card glass-panel">
                <div className="card-icon-wrapper run">
                  <HiOutlineBolt />
                </div>
                <h2>Run Feedback Pipeline</h2>
                <p>Force execution of closed-loop analytics feedback logic comparing predicted vs actual parameters.</p>
                <button 
                  className="btn btn-run" 
                  onClick={handleRunFeedback}
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? 'Processing...' : 'Run Pipeline'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ML Control Panel */}
        {activeTab === 'mlpanel' && (
          <div className="tab-panel">
            {mlLoading && <Spinner message="Fetching model statistics..." />}
            
            {!mlLoading && (
              <div className="ml-panel-grid">
                
                {/* Metrics Summary */}
                <div className="ml-stats-section">
                  <div className="settings-card glass-panel">
                    <h2>Model Overview</h2>
                    <div className="ml-metadata-grid">
                      <div className="meta-box">
                        <span className="label">Version</span>
                        <span className="val">{mlMetadata?.version || 'N/A'}</span>
                      </div>
                      <div className="meta-box">
                        <span className="label">Base Accuracy</span>
                        <span className="val">{mlMetadata ? `${(mlMetadata.accuracy * 100).toFixed(0)}%` : 'N/A'}</span>
                      </div>
                      <div className="meta-box">
                        <span className="label">Total Predictions Logged</span>
                        <span className="val">{mlStats?.total_predictions ?? 'N/A'}</span>
                      </div>
                      <div className="meta-box">
                        <span className="label">Retrain Flags Raised</span>
                        <span className="val highlight">{mlStats?.retraining_flags_raised ?? 0}</span>
                      </div>
                    </div>

                    <div className="retrain-action-section">
                      <h3>Retraining controls</h3>
                      <p>Trigger retraining of the XGBoost classifier. This will run 3-fold cross validation grid search on current datasets and refresh the loaded model binary in memory.</p>
                      <button 
                        className="btn btn-retrain"
                        onClick={handleRetrain}
                        disabled={retrainLoading}
                      >
                        <HiOutlineArrowPath className={`btn-icon ${retrainLoading ? 'spin' : ''}`} />
                        {retrainLoading ? 'Retraining...' : 'Retrain ML Model'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feature Importances list */}
                <div className="ml-features-section">
                  <div className="settings-card glass-panel">
                    <h2>Feature Importances</h2>
                    <p className="section-description">Calculated weights of each feature contributing to shipment delay classification predictions.</p>
                    
                    <div className="feature-list">
                      {featureImportances.length > 0 ? (
                        featureImportances.map((feat, index) => (
                          <div key={index} className="feature-item">
                            <div className="feature-info">
                              <span className="feature-name">{feat.name}</span>
                              <span className="feature-weight">{(feat.importance * 100).toFixed(1)}%</span>
                            </div>
                            <div className="feature-bar-bg">
                              <div 
                                className="feature-bar-fill" 
                                style={{ width: `${feat.importance * 100}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-features">No feature importances loaded.</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
