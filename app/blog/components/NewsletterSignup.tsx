'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: existingSubscribers, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingSubscribers && existingSubscribers.length > 0) {
        toast.info("This email is already subscribed to our newsletter.");
        setEmail('');
        return;
      }
      
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { email: email.toLowerCase().trim() }
        ]);
      
      if (insertError) throw insertError;
      
      toast.success("Thank you for subscribing to our newsletter!");
      
      setEmail('');
      
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.error('Error submitting newsletter subscription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black text-white py-12 px-6 rounded-lg">
      <div className="max-w-xl mx-auto text-center">
        <Mail className="mx-auto h-12 w-12 text-white mb-4" />
        <h3 className="text-2xl font-playfair mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
          Subscribe to Our Newsletter
        </h3>
        <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Stay updated with our latest articles, exclusive offers, and curated content.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            required
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-black hover:bg-black/90 text-white"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        <p className="text-xs mt-4 text-white/70">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;
