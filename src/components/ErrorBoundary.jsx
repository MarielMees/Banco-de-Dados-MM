import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-300 space-y-4 my-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">{this.props.fallbackTitle || 'Aviso de Inconsistência'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {this.props.fallbackMessage || 'Ocorreu uma inconsistência no componente, mas seus dados continuam seguros.'}
              </p>
            </div>
          </div>
          {this.state.error && (
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-rose-300/80 overflow-x-auto">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Fechar / Tentar Novamente</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
