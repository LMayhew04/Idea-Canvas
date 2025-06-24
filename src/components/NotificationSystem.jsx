import React, { useState, useEffect, useCallback } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // Expose the notification methods globally
  useEffect(() => {
    window.showNotification = (message, type = 'info', duration = 3000) => {
      const id = Date.now() + Math.random();
      const notification = { id, message, type, duration };
      
      setNotifications(prev => [...prev, notification]);
      
      if (duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
      }
      
      return id;
    };

    window.hideNotification = (id) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return () => {
      delete window.showNotification;
      delete window.hideNotification;
    };
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onClose }) => {
  const { message, type } = notification;
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          icon: '✅'
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f1b2b7',
          color: '#721c24',
          icon: '❌'
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          color: '#856404',
          icon: '⚠️'
        };
      case 'loading':
        return {
          backgroundColor: '#cce7ff',
          borderColor: '#b3d9ff',
          color: '#004085',
          icon: '⏳'
        };
      default: // info
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          color: '#0c5460',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div style={{
      backgroundColor: styles.backgroundColor,
      border: `1px solid ${styles.borderColor}`,
      color: styles.color,
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 300,
      maxWidth: 400,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <span style={{ fontSize: 16 }}>{styles.icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: styles.color,
          fontSize: 18,
          cursor: 'pointer',
          padding: 0,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        ×
      </button>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;
