
-- Create enum types for lead status and outreach channels
CREATE TYPE public.lead_status AS ENUM (
  'new', 'diagnosed', 'built', 'pitched', 'replied', 'booked', 'closed', 'rejected'
);

CREATE TYPE public.outreach_channel AS ENUM (
  'email', 'sms', 'ig_dm', 'linkedin'
);

CREATE TYPE public.outreach_status AS ENUM (
  'pending_review', 'approved', 'sent', 'replied', 'positive', 'negative'
);

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  niche TEXT NOT NULL,
  google_maps_url TEXT,
  website_url TEXT,
  email TEXT,
  phone TEXT,
  rating NUMERIC(2,1),
  review_count INTEGER DEFAULT 0,
  website_age TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  deal_value NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diagnoses table
CREATE TABLE public.diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  diagnosis_text TEXT NOT NULL,
  hero_angle TEXT NOT NULL,
  tone TEXT NOT NULL,
  cold_message TEXT NOT NULL,
  channel public.outreach_channel NOT NULL DEFAULT 'email',
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Landing pages table
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  html_content TEXT NOT NULL,
  template_used TEXT NOT NULL,
  sections JSONB DEFAULT '[]'::jsonb,
  color_scheme TEXT,
  screenshot_urls JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Outreach table
CREATE TABLE public.outreach (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  channel public.outreach_channel NOT NULL,
  message_content TEXT NOT NULL,
  eval_result JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  status public.outreach_status NOT NULL DEFAULT 'pending_review',
  reply_text TEXT,
  reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent logs table
CREATE TABLE public.agent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings table (key-value store)
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS on all tables (single-user agency tool, no auth needed)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow full access via anon key (single-user tool)
CREATE POLICY "Allow all access" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.diagnoses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.landing_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.outreach FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.agent_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for agent_logs and outreach
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outreach;
