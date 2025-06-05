import { EventManagement } from "@/components/EventManagement";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { checkStorageAvailability } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ArrowLeft, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { ensureStorageBuckets } from "@/lib/supabase";

const HostEvents = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [checkCount, setCheckCount] = useState(0);
  
  // Check storage availability when page loads with retry mechanism
  const checkStorage = useCallback(async () => {
    try {
      setIsInitializing(true);
      setErrorMessage(null);
      console.log("Checking storage availability from HostEvents page...");
      
      if (!user) {
        setErrorMessage("Authentication required to access storage features.");
        setIsInitializing(false);
        return false;
      }
      
      // First try simple check
      const isAvailable = await checkStorageAvailability(2);
      
      if (isAvailable) {
        console.log("Storage buckets are available");
        setStorageInitialized(true);
        return true;
      }
      
      // If storage isn't available, try to create buckets
      console.log("Storage not available, attempting to create buckets...");
      const createSuccess = await ensureStorageBuckets();
      
      if (createSuccess) {
        console.log("Successfully created storage buckets");
        setStorageInitialized(true);
        toast({
          title: "Storage Ready",
          description: "File storage for event images is now available.",
        });
        return true;
      } else {
        // If we couldn't create buckets, set partial initialization for core features
        console.log("Couldn't create storage buckets, proceeding with limited functionality");
        setStorageInitialized(false);
        setErrorMessage("Some storage features are unavailable. You can still manage events, but image uploads may not work.");
        return false;
      }
    } catch (error: any) {
      console.error("Error checking storage:", error);
      const errorMsg = error?.message || "Could not access storage for uploads";
      setErrorMessage(errorMsg);
      
      toast({
        title: "Storage Access Limited",
        description: "Some features may not work properly. Core event functionality will still be available.",
      });
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    checkStorage();
  }, [retryAttempt, checkStorage]);
  
  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
    setCheckCount(prev => prev + 1);
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <HostDashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Event Management</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/host-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
        
        {errorMessage && !storageInitialized && (
          <Alert>
            <AlertTitle className="font-medium mb-1">Storage Access Notice</AlertTitle>
            <AlertDescription>
              <p className="text-sm">{errorMessage}</p>
              <p className="text-sm mt-2">
                Core event management features will still work properly.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 bg-background" 
                onClick={handleRetry}
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {!errorMessage && !storageInitialized && !isInitializing && (
          <Alert>
            <Info className="h-4 w-4 mr-2" />
            <AlertDescription>
              Storage features partially initialized. Custom images may not work properly.
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2 bg-background" 
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isInitializing && (
          <Alert>
            <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
            <AlertDescription className="inline-block">Checking file storage availability...</AlertDescription>
          </Alert>
        )}
        
        <Card className="p-6">
          <EventManagement 
            storageInitialized={storageInitialized} 
          />
        </Card>
      </div>
    </HostDashboardLayout>
  );
};

export default HostEvents;
