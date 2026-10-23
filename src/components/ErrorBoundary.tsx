import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.hash = '';
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('khurshid_cart');
      window.location.hash = '';
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F1EAD9] flex items-center justify-center p-4 text-[#241F18]">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-[6px_20px_6px_20px] border-[1.5px] border-[#241F18] shadow-[4px_4px_0_#241F18] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#B14B2C]/10 text-[#B14B2C] border border-[#B14B2C] flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <h1 className="font-display font-bold text-xl text-[#152A1C]">
              Kuch gadbad hui (Something went wrong)
            </h1>
            <p className="text-xs sm:text-sm text-[#4E4639] leading-relaxed">
              Website par ek takneeki samasya aayi hai. Kripya niche diye gaye button se page ko refresh karein.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 bg-[#2B4430] text-[#F1EAD9] py-2.5 px-4 rounded-[4px_12px_4px_12px] font-bold text-xs sm:text-sm border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18] hover:bg-[#152A1C] transition-colors cursor-pointer min-h-[48px]"
              >
                Page Refresh Karein ↻
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 bg-white text-[#241F18] py-2.5 px-4 rounded-[4px_12px_4px_12px] font-bold text-xs border border-[#241F18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[48px]"
              >
                Reset &amp; Open Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
