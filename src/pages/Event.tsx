
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { EventDetails } from '@/components/events/EventDetails';
import { useEventDetails } from '@/hooks/useEventDetails';

const Event = () => {
  const { id } = useParams();
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const { event, hostProfile, isLoading, error } = useEventDetails(id);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !event) {
    return (
      <PageLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Event not found'}
            </h1>
            <p className="text-gray-600">
              The event you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        <EventDetails 
          event={event}
          hostProfile={hostProfile}
          showRsvpDialog={showRsvpDialog}
          setShowRsvpDialog={setShowRsvpDialog}
        />
      </div>
    </PageLayout>
  );
};

export default Event;
