
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EventLoadingStateProps {
  message?: string;
}

export const EventLoadingState = ({ message }: EventLoadingStateProps) => {
  return (
    <div className="space-y-4">
      {message && (
        <div className="text-center p-2 text-sm text-muted-foreground mb-2">
          {message}
        </div>
      )}
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};
