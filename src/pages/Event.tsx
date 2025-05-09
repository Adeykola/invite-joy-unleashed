
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layouts/PageLayout';
import { ArrowLeft } from 'lucide-react';
import { useEventDetails } from '@/hooks/useEventDetails';
import { EventBanner } from '@/components/events/EventBanner';
import { EventDetails } from '@/components/events/EventDetails';
import { EventLoadingState } from '@/components/events/EventLoadingState';
import { EventError } from '@/components/events/EventError';
import { EventNotFound } from '@/components/events/EventNotFound';

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const navigate = useNavigate();
  const { event, hostProfile, isLoading, error } = useEventDetails(id);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <PageLayout>
      <div className="container max-w-4xl py-8">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex-1"></div>
        </div>

        {isLoading ? (
          <EventLoadingState />
        ) : error ? (
          <EventError error={error} />
        ) : event ? (
          <div className="space-y-6">
            <EventBanner title={event.title} meta={event.meta} />
            <EventDetails 
              event={event}
              hostProfile={hostProfile}
              showRsvpDialog={showRsvpDialog}
              setShowRsvpDialog={setShowRsvpDialog}
            />
          </div>
        ) : (
          <EventNotFound />
        )}
      </div>
    </PageLayout>
  );
}
