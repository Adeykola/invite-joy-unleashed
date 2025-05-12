
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface EventLoadingStateProps {
  message?: string;
  isStorage?: boolean;
  retryFn?: () => void;
  isRetrying?: boolean;
}

export const EventLoadingState = ({ 
  message, 
  isStorage = false,
  retryFn,
  isRetrying = false
}: EventLoadingStateProps) => {
  return (
    <div className="space-y-4">
      {message && (
        <div className={`${isStorage ? 'flex items-center gap-2' : ''} text-center p-3 text-sm ${isStorage ? 'text-amber-600' : 'text-muted-foreground'} mb-2 rounded-md ${isStorage ? 'bg-amber-50 border border-amber-100' : ''}`}>
          {isStorage && (
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          )}
          <div>
            {message}
            {isStorage && (
              <div className="text-xs mt-1 text-amber-500">
                (This won't affect viewing event details)
              </div>
            )}
            {isStorage && retryFn && (
              <button 
                onClick={retryFn}
                disabled={isRetrying}
                className="text-xs mt-1 text-blue-500 hover:text-blue-700 hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>Check again</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};
