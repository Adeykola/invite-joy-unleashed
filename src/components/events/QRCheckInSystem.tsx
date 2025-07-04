
import { RealCheckInSystem } from "@/components/check-in/RealCheckInSystem";

interface QRCheckInSystemProps {
  eventId: string;
}

export function QRCheckInSystem({ eventId }: QRCheckInSystemProps) {
  return <RealCheckInSystem eventId={eventId} />;
}
