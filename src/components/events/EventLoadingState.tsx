
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const EventLoadingState = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};
