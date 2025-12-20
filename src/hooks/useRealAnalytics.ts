
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlatformAnalytics {
  total_events: number;
  total_confirmed_rsvps: number;
  total_checked_in: number;
  active_hosts: number;
  total_users: number;
  upcoming_events: number;
  past_events: number;
}

export interface EventPerformance {
  id: string;
  title: string;
  date: string;
  capacity: number;
  total_rsvps: number;
  confirmed_rsvps: number;
  declined_rsvps: number;
  pending_rsvps: number;
  checked_in_count: number;
  fill_rate: number;
  response_rate: number;
}

export const useRealAnalytics = () => {
  const { user, profile } = useAuth();

  // Platform analytics - Admin only via secure RPC
  const { data: platformAnalytics, isLoading: isLoadingPlatform } = useQuery({
    queryKey: ["platform-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_analytics');

      if (error) {
        // Non-admins will get an error, return null gracefully
        console.log('Platform analytics not available:', error.message);
        return null;
      }
      return data?.[0] as PlatformAnalytics | null;
    },
    enabled: profile?.role === 'admin',
  });

  // Event performance - Hosts see their events, Admins see all via secure RPC
  const { data: eventPerformance, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["event-performance", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_host_event_performance');

      if (error) {
        console.log('Event performance not available:', error.message);
        return [];
      }
      return (data || []).map((item: any) => ({
        ...item,
        date: item.event_date, // Map event_date to date for compatibility
      })) as EventPerformance[];
    },
    enabled: !!user?.id,
  });

  const { data: hostEventStats } = useQuery({
    queryKey: ["host-event-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date, capacity")
        .eq("host_id", user.id);

      if (eventsError) throw eventsError;

      const { data: rsvps, error: rsvpsError } = await supabase
        .from("rsvps")
        .select("event_id, response_status, checked_in, created_at")
        .in("event_id", events?.map(e => e.id) || []);

      if (rsvpsError) throw rsvpsError;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const totalEvents = events?.length || 0;
      const upcomingEvents = events?.filter(e => new Date(e.date) > now).length || 0;
      const eventsThisMonth = events?.filter(e => new Date(e.date) > thirtyDaysAgo).length || 0;
      const totalRsvps = rsvps?.length || 0;
      const confirmedRsvps = rsvps?.filter(r => r.response_status === 'confirmed').length || 0;
      const pendingRsvps = rsvps?.filter(r => r.response_status === 'pending').length || 0;
      const checkedInCount = rsvps?.filter(r => r.checked_in).length || 0;
      const conversionRate = totalRsvps > 0 ? Math.round((confirmedRsvps / totalRsvps) * 100) : 0;

      return {
        totalEvents,
        upcomingEvents,
        eventsThisMonth,
        totalRsvps,
        confirmedRsvps,
        pendingRsvps,
        checkedInCount,
        conversionRate
      };
    },
    enabled: !!user?.id,
  });

  return {
    platformAnalytics,
    eventPerformance,
    hostEventStats,
    isLoadingPlatform,
    isLoadingEvents,
  };
};
