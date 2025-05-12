
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface EventLoadingStateProps {
  message?: string;
  isStorage?: boolean;
  retryFn?: () => void;
}

export const EventLoadingState = ({ 
  message, 
  isStorage = false,
  retryFn 
}: EventLoadingStateProps) => {
  return (
    <div className="space-y-4">
      {message && (
        <div className={`${isStorage ? 'flex items-center gap-2' : ''} text-center p-3 text-sm ${isStorage ? 'text-amber-600' : 'text-muted-foreground'} mb-2 rounded-md ${isStorage ? 'bg-amber-50 border border-amber-100' : ''}`}>
          {isStorage && (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
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
                className="text-xs mt-1 text-blue-500 hover:text-blue-700 hover:underline"
              >
                Try again
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
