
// Helper to send an invitation email via the Supabase edge function
export async function sendInvitationEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(
      "https://ttlqxvpcjpxpbzkgbyod.supabase.co/functions/v1/send-invitation-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, html, from }),
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      return { success: false, error: data.error || "Failed to send email." };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}
