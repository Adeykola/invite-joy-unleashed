
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const EventNotFound = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Event Not Found</h2>
          <p className="mb-6 text-muted-foreground">Sorry, we couldn't find the event you're looking for.</p>
          <Button asChild>
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
