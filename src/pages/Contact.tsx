import { useState } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { Mail, Send, Clock, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
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
      description: 'We\'ll get back to you within 24 hours.',
    });
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <PageLayout>
      <SEOHead title="Contact VOVV.AI — Get in Touch" description="Have a question about AI product photography? Contact the VOVV.AI team for support, partnerships, or feature requests." canonical={`${SITE_URL}/contact`} />
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Contact Us
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Get in touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Have a question, feature request, or need help? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                        <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
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
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                      <Textarea placeholder="How can we help?" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </div>
                    <Button type="submit" className="rounded-full px-8 gap-2" disabled={submitting}>
                      <Send className="w-4 h-4" />
                      {submitting ? 'Sending…' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <Mail className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                  <a href="mailto:hello@vovv.ai" className="text-sm text-primary hover:underline">hello@vovv.ai</a>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <Clock className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                  <p className="text-sm text-muted-foreground">We typically respond within 2 hours during business hours (Mon–Fri, 9am–6pm EST).</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
