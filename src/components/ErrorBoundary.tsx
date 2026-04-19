import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary] render crash', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', color: '#f6efe2', background: '#0b0a0e', minHeight: '100vh' }}>
        <h1 style={{ color: '#ff4d4d', fontSize: 28, margin: 0 }}>Something broke.</h1>
        <p style={{ color: '#c9c1b2', maxWidth: 640 }}>The page crashed before it could render. Details below (also in the console):</p>
        <pre style={{ background: '#14131a', border: '1px solid rgba(255,235,180,0.12)', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ffb238', fontSize: 13 }}>
          {this.state.error.name}: {this.state.error.message}
          {this.state.error.stack ? '\n\n' + this.state.error.stack : ''}
        </pre>
        <button onClick={() => { this.setState({ error: null }); location.href = '/'; }} style={{ background: '#ffb238', color: '#0b0a0e', border: 0, padding: '10px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
          Back to home
        </button>
      </div>
    );
  }
}
