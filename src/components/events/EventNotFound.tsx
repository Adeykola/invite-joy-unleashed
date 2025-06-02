
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const EventNotFound = () => {
  const { profile } = useAuth();
  
  const getHostDashboardRoute = () => {
    if (profile?.role === 'host') return '/host/events';
    if (profile?.role === 'admin') return '/admin';
    return '/host/events'; // fallback
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Event Not Found</h2>
          <p className="mb-6 text-muted-foreground">Sorry, we couldn't find the event you're looking for.</p>
          <div className="space-x-2">
            <Button asChild>
              <Link to="/events">View All Events</Link>
            </Button>
            {(profile?.role === 'host' || profile?.role === 'admin') && (
              <Button variant="outline" asChild>
                <Link to={getHostDashboardRoute()}>Manage Events</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
