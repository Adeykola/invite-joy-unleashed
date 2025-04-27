
import { CreateEventDialog } from "./events/CreateEventDialog";
import { EventList } from "./events/EventList";

export function EventManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events</h2>
        <CreateEventDialog />
      </div>
      <EventList />
    </div>
  );
}
