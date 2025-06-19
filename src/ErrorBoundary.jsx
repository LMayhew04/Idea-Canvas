import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fff3f3',
          border: '1px solid #ffcdd2',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>Something went wrong</h2>
          <p>We apologize for the inconvenience. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2271f5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              overflow: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
