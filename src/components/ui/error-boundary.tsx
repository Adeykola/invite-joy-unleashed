
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">An unexpected error occurred. Please try refreshing the page.</p>
            <Button variant="outline" size="sm" onClick={this.resetError}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export const DefaultErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <Alert variant="destructive" className="m-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Something went wrong</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="mb-3">
        {error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
      </p>
      {resetError && (
        <Button variant="outline" size="sm" onClick={resetError}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </AlertDescription>
  </Alert>
);
