import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './StateSelection.css';

const US_STATES = [
  { value: 'Alabama', label: 'Alabama' },
  { value: 'Alaska', label: 'Alaska' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Arkansas', label: 'Arkansas' },
  { value: 'California', label: 'California' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Connecticut', label: 'Connecticut' },
  { value: 'Delaware', label: 'Delaware' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Hawaii', label: 'Hawaii' },
  { value: 'Idaho', label: 'Idaho' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Kansas', label: 'Kansas' },
  { value: 'Kentucky', label: 'Kentucky' },
  { value: 'Louisiana', label: 'Louisiana' },
  { value: 'Maine', label: 'Maine' },
  { value: 'Maryland', label: 'Maryland' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Mississippi', label: 'Mississippi' },
  { value: 'Missouri', label: 'Missouri' },
  { value: 'Montana', label: 'Montana' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Nevada', label: 'Nevada' },
  { value: 'New Hampshire', label: 'New Hampshire' },
  { value: 'New Jersey', label: 'New Jersey' },
  { value: 'New Mexico', label: 'New Mexico' },
  { value: 'New York', label: 'New York' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'North Dakota', label: 'North Dakota' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Oklahoma', label: 'Oklahoma' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Rhode Island', label: 'Rhode Island' },
  { value: 'South Carolina', label: 'South Carolina' },
  { value: 'South Dakota', label: 'South Dakota' },
  { value: 'Tennessee', label: 'Tennessee' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Utah', label: 'Utah' },
  { value: 'Vermont', label: 'Vermont' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Washington', label: 'Washington' },
  { value: 'West Virginia', label: 'West Virginia' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Wyoming', label: 'Wyoming' }
];

function StateSelection({ onClose }) {
  const { currentUser, userState, saveUserState } = useAuth();
  const [selectedState, setSelectedState] = useState(userState || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSelectedState(userState || '');
  }, [userState]);

  const handleSave = async () => {
    if (!selectedState) {
      setMessage('Please select a state');
      return;
    }

    setSaving(true);
    setMessage('');
    
    try {
      await saveUserState(selectedState);
      setMessage('State saved successfully! Your state will be highlighted on the chart.');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setMessage('Error saving state. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="state-selection-overlay" onClick={onClose}>
      <div className="state-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="state-selection-header">
          <h3>Select Your State</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="state-selection-content">
          <p className="explanation-text">
            Select your home state to have it <strong style={{ color: '#FFD700' }}>highlighted</strong> on the transportation chart. 
            This makes it easy to find and compare your state's transportation data at a glance. 
            Your selection will be saved and remembered between sessions.
          </p>

          <div className="form-group">
            <label htmlFor="state-select">Choose Your State:</label>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="state-select"
            >
              <option value="">-- Select a State --</option>
              {US_STATES.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="button-group">
            <button
              onClick={handleSave}
              disabled={saving || !selectedState}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save State'}
            </button>
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StateSelection;

