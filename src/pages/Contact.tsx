import { useState } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { Mail, Send, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error('Fill in all fields to continue');
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke('send-contact', {
      body: {
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        inquiryType: subject,
        message: message.trim().slice(0, 5000),
      },
    });

    setSubmitting(false);

    if (error || data?.error) {
      toast.error(data?.error || 'Failed to send message. Please try again.');
      return;
    }

    toast.success('Message sent!', {
      description: "We'll get back to you within 24 hours.",
    });
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <PageLayout>
      <SEOHead
        title="Contact VOVV.AI — Get in Touch"
        description="Have a question about AI product photography? Contact the VOVV.AI team for support, partnerships, or feature requests."
        canonical={`${SITE_URL}/contact`}
      />

      {/* HERO — editorial cream, matches Library / Home */}
      <section className="bg-[#FAFAF8]">
        <div className="mx-auto max-w-3xl px-6 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Contact us
          </p>
          <h1 className="text-foreground text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
            Get in touch
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground text-lg leading-relaxed">
            Have a question, feature request, or need help? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Form card */}
            <div className="md:col-span-2">
              <div className="rounded-3xl border border-foreground/10 bg-background p-6 sm:p-10 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                      <Input
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Choose a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Question</SelectItem>
                        <SelectItem value="billing">Billing & Plans</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="enterprise">Enterprise Inquiry</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                    <Textarea
                      placeholder="How can we help?"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-[3.25rem] w-full rounded-full bg-foreground px-8 font-semibold text-background hover:bg-foreground/90 sm:w-auto"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? 'Sending…' : 'Send message'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Side info — editorial blocks */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-foreground/10 bg-[#FAFAF8] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background">
                  <Mail className="h-4 w-4 text-foreground/70" strokeWidth={1.75} />
                </div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Email us
                </p>
                <a
                  href="mailto:hello@vovv.ai"
                  className="text-base font-medium text-foreground hover:underline"
                >
                  hello@vovv.ai
                </a>
              </div>

              <div className="rounded-3xl border border-foreground/10 bg-[#FAFAF8] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background">
                  <Clock className="h-4 w-4 text-foreground/70" strokeWidth={1.75} />
                </div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Response time
                </p>
                <p className="text-sm leading-relaxed text-foreground/70">
                  We typically respond within 2 hours during business hours (Mon–Fri, 9am–6pm EST).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
