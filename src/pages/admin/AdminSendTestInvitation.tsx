
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendInvitationEmail } from "@/lib/email";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_SUBJECT = "You're invited to our event!";
const DEFAULT_HTML = `<h2>Join Us!</h2>
<p>Click the link to RSVP and see event details.</p>`;

export default function AdminSendTestInvitation() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    to: "",
    subject: DEFAULT_SUBJECT,
    html: DEFAULT_HTML,
    from: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast({ title: "Sending...", description: "Sending test invitation email.", duration: 1200 });
    const resp = await sendInvitationEmail(form);
    setLoading(false);
    if (resp.success) {
      toast({
        title: "Email sent!",
        description: `The invitation was sent to ${form.to}.`,
        duration: 3500,
      });
    } else {
      toast({
        title: "Send failed",
        description: resp.error || "Unknown error",
        variant: "destructive",
        duration: 3500,
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Send Test Invitation Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="to">Recipient Email</Label>
              <Input
                name="to"
                id="to"
                type="email"
                required
                value={form.to}
                onChange={handleChange}
                placeholder="example@email.com"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                name="subject"
                id="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="html">HTML Message</Label>
              <Textarea
                name="html"
                id="html"
                rows={6}
                value={form.html}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="from">From (optional)</Label>
              <Input
                name="from"
                id="from"
                type="text"
                value={form.from}
                onChange={handleChange}
                placeholder='Your Event App <onboarding@resend.dev>'
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Test Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
