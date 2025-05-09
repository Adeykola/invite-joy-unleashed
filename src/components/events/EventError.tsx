
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EventErrorProps {
  error: string | null;
}

export const EventError = ({ error }: EventErrorProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Error Loading Event</h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button asChild>
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
