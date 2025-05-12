
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EventLoadingStateProps {
  message?: string;
  isStorage?: boolean;
}

export const EventLoadingState = ({ message, isStorage = false }: EventLoadingStateProps) => {
  return (
    <div className="space-y-4">
      {message && (
        <div className={`text-center p-3 text-sm ${isStorage ? 'text-amber-600' : 'text-muted-foreground'} mb-2 rounded-md ${isStorage ? 'bg-amber-50 border border-amber-100' : ''}`}>
          {message}
          {isStorage && (
            <div className="text-xs mt-1 text-amber-500">
              (This won't affect viewing event details)
            </div>
          )}
        </div>
      )}
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};
