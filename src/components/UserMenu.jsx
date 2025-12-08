import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import StateSelection from './StateSelection';
import './UserMenu.css';

function UserMenu() {
  const { currentUser, logout, userState } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showStateSelection, setShowStateSelection] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!currentUser) return null;

  return (
    <>
      <div className="user-menu" ref={menuRef}>
        <button 
          className="user-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="user-avatar">
            {currentUser.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="user-email">{currentUser.email}</span>
          {userState && (
            <span className="user-state-badge">{userState}</span>
          )}
        </button>

        {showMenu && (
          <div className="dropdown-menu">
            <div className="menu-item" onClick={() => {
              setShowStateSelection(true);
              setShowMenu(false);
            }}>
              {userState ? `Change State (${userState})` : 'Select Your State'}
            </div>
            <div className="menu-item" onClick={logout}>
              Sign Out
            </div>
          </div>
        )}
      </div>

      {showStateSelection && (
        <StateSelection onClose={() => setShowStateSelection(false)} />
      )}
    </>
  );
}

export default UserMenu;

