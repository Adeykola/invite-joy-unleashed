
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';

interface EventErrorProps {
  error: string | null;
  showBackButton?: boolean;
  isCritical?: boolean;
  isStorageError?: boolean;
}

export const EventError = ({ 
  error, 
  showBackButton = true, 
  isCritical = false,
  isStorageError = false 
}: EventErrorProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          {isStorageError ? (
            <Info className="h-10 w-10 text-blue-500 mx-auto mb-4" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          )}
          
          <h2 className="text-xl font-semibold mb-4">
            {isStorageError ? "Storage Notice" : 
             isCritical ? "Error Loading Event" : "Warning"}
          </h2>
          
          <p className="mb-6 text-muted-foreground max-w-md mx-auto">
            {error || "An error occurred while loading the event."}
            {!isCritical && !isStorageError && " However, you can still view the event details."}
            {isStorageError && " This only affects images and uploads."}
          </p>
          
          {showBackButton && (
            <Button asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
