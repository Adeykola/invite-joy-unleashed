
// Update HostEvents to use the improved storage initialization
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { checkStorageAvailability } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const HostEvents = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  // Check storage availability when page loads
  useEffect(() => {
    checkStorage();
  }, [retryAttempt]);

  const checkStorage = async () => {
    try {
      setIsInitializing(true);
      setErrorMessage(null);
      console.log("Checking storage availability from HostEvents page...");
      
      const isAvailable = await checkStorageAvailability();
      
      if (isAvailable) {
        console.log("Storage buckets are available");
        setStorageInitialized(true);
        toast({
          title: "Storage Ready",
          description: "File storage for event images is available.",
        });
      } else {
        throw new Error("Unable to access storage buckets. This may be due to permissions or connectivity issues.");
      }
    } catch (error: any) {
      console.error("Error checking storage:", error);
      const errorMsg = error?.message || "Could not access storage for uploads";
      setErrorMessage(errorMsg);
      
      toast({
        title: "Storage Access Issue",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <DashboardLayout userType="host">
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
        
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle className="font-medium mb-1">Storage Access Issue</AlertTitle>
            <AlertDescription>
              <p className="text-sm">{errorMessage}</p>
              <p className="text-sm mt-2">
                Some event features may not work properly. Please try checking storage access again.
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
        ) : (
          !storageInitialized && isInitializing && (
            <Alert>
              <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
              <AlertDescription className="inline-block">Checking file storage availability...</AlertDescription>
            </Alert>
          )
        )}
        
        <Card className="p-6">
          <EventManagement storageInitialized={storageInitialized} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HostEvents;
