import { Component, type ReactNode } from 'react'

interface BoundaryState {
  message: string | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { message: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('[kingdom] Не удалось показать игровой мир.', error)
  }

  render() {
    if (!this.state.message) return this.props.children
    return (
      <div className="loading">
        <div className="loading-card">
          <h1>The kingdom could not be loaded</h1>
          <p>WebGL failed to start. Try a current desktop browser such as Chrome, Edge or Firefox.</p>
        </div>
      </div>
    )
  }
}
