
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRealCheckIn } from "@/hooks/useRealCheckIn";
import { QrCode, Upload, CheckCircle, AlertCircle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RealCheckInSystemProps {
  eventId: string;
}

export function RealCheckInSystem({ eventId }: RealCheckInSystemProps) {
  const [ticketCode, setTicketCode] = useState("");
  const [bulkCodes, setBulkCodes] = useState("");
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  
  const { singleCheckIn, bulkCheckIn, getEventCheckInStats, isCheckingIn } = useRealCheckIn();
  const { data: checkInStats, isLoading: isLoadingStats } = getEventCheckInStats(eventId);

  const handleSingleCheckIn = () => {
    if (!ticketCode.trim()) return;
    singleCheckIn({ eventId, ticketCode: ticketCode.trim() });
    setTicketCode("");
  };

  const handleBulkCheckIn = () => {
    const codes = bulkCodes
      .split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0);
    
    if (codes.length === 0) return;
    
    bulkCheckIn({ eventId, ticketCodes: codes });
    setBulkCodes("");
  };

  return (
    <div className="space-y-6">
      {/* Check-in Stats */}
      {checkInStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Check-in Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{checkInStats.total_rsvps}</div>
                <div className="text-sm text-gray-500">Total RSVPs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{checkInStats.confirmed_rsvps}</div>
                <div className="text-sm text-gray-500">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{checkInStats.checked_in_count}</div>
                <div className="text-sm text-gray-500">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{checkInStats.check_in_rate}%</div>
                <div className="text-sm text-gray-500">Check-in Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            Guest Check-in
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("single")}
            >
              Single Check-in
            </Button>
            <Button
              variant={activeTab === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("bulk")}
            >
              Bulk Check-in
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === "single" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticket-code">Ticket Code</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="ticket-code"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Enter or scan ticket code (e.g., TKT-ABC12345)"
                    onKeyPress={(e) => e.key === 'Enter' && handleSingleCheckIn()}
                  />
                  <Button 
                    onClick={handleSingleCheckIn}
                    disabled={!ticketCode.trim() || isCheckingIn}
                  >
                    {isCheckingIn ? "Checking..." : "Check In"}
                  </Button>
                </div>
              </div>
              
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  Scan QR codes from guest tickets or manually enter ticket codes. 
                  Each ticket has a unique code like "TKT-ABC12345".
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-codes">Bulk Ticket Codes</Label>
                <Textarea
                  id="bulk-codes"
                  value={bulkCodes}
                  onChange={(e) => setBulkCodes(e.target.value)}
                  placeholder="Enter multiple ticket codes, one per line:&#10;TKT-ABC12345&#10;TKT-DEF67890&#10;TKT-GHI11111"
                  rows={6}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {bulkCodes.split('\n').filter(code => code.trim()).length} codes ready
                </span>
                <Button 
                  onClick={handleBulkCheckIn}
                  disabled={!bulkCodes.trim() || isCheckingIn}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isCheckingIn ? "Processing..." : "Bulk Check In"}
                </Button>
              </div>
              
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Paste multiple ticket codes, one per line. The system will process all codes 
                  and show you the results for each attempt.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Check-in System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Single Check-in</h4>
              <p className="text-sm text-gray-600">
                Use this for checking in guests one at a time. Scan QR codes or type ticket codes manually.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Upload className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Bulk Check-in</h4>
              <p className="text-sm text-gray-600">
                Process multiple ticket codes at once. Great for pre-processing or handling large groups.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Important Notes</h4>
              <p className="text-sm text-gray-600">
                Only confirmed RSVPs can be checked in. The system will prevent duplicate check-ins 
                and provide clear feedback for each attempt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
