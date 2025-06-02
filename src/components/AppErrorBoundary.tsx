
import React from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from 'react-router-dom';

interface AppErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({ error, resetError }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              Something went wrong with the application. This error has been logged for investigation.
            </p>
            {error?.message && (
              <div className="bg-gray-100 p-3 rounded text-sm mb-4 font-mono">
                {error.message}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {resetError && (
                <Button variant="outline" onClick={resetError} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button onClick={handleReload} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;
