
import React, { useState, useEffect } from 'react';
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
import { checkStorageAvailability } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const navigate = useNavigate();
  const { event, hostProfile, isLoading, error } = useEventDetails(id);
  const { toast } = useToast();
  
  // Storage state - for view-only pages, we don't show this as a critical error
  const [storageStatus, setStorageStatus] = useState<{
    isChecking: boolean;
    isAvailable: boolean;
    error: string | null;
  }>({
    isChecking: true,
    isAvailable: false,
    error: null
  });
  
  // Check storage availability for displaying images
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const isAvailable = await checkStorageAvailability();
        setStorageStatus({
          isChecking: false,
          isAvailable,
          error: isAvailable ? null : "Storage may not be fully accessible. Some event images may not display correctly."
        });
        
        if (!isAvailable) {
          // Just show a toast instead of an error screen
          toast({
            title: "Media Storage Limited",
            description: "Some event images may not display correctly.",
            duration: 5000,
          });
        }
      } catch (err) {
        console.log("Storage check error (non-critical):", err);
        setStorageStatus({
          isChecking: false,
          isAvailable: false,
          error: "Storage check failed. Some event images may not display correctly."
        });
      }
    };
    
    checkStorage();
  }, [toast]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const getLoadingMessage = () => {
    if (isLoading) {
      return storageStatus.isChecking ? "Loading event details..." : undefined;
    }
    return undefined;
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
          <EventLoadingState message={getLoadingMessage()} />
        ) : error ? (
          <EventError error={error} />
        ) : event ? (
          <>
            {/* Only show storage error as a non-critical warning if there's an issue but we have event data */}
            {storageStatus.error && !storageStatus.isAvailable && (
              <div className="mb-6">
                <EventError 
                  error={storageStatus.error} 
                  showBackButton={false}
                  isCritical={false}
                  isStorageError={true}
                />
              </div>
            )}
            
            <div className="space-y-6">
              <EventBanner 
                title={event.title} 
                meta={event.meta} 
                fallbackColor="#4f46e5" 
              />
              <EventDetails 
                event={event}
                hostProfile={hostProfile}
                showRsvpDialog={showRsvpDialog}
                setShowRsvpDialog={setShowRsvpDialog}
              />
            </div>
          </>
        ) : (
          <EventNotFound />
        )}
      </div>
    </PageLayout>
  );
}
