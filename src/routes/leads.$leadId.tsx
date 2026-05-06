import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, Globe, Mail, Phone, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Diagnosis = Database["public"]["Tables"]["diagnoses"]["Row"];
type LandingPage = Database["public"]["Tables"]["landing_pages"]["Row"];
type Outreach = Database["public"]["Tables"]["outreach"]["Row"];

export const Route = createFileRoute("/leads/$leadId")({
  component: LeadDetail,
});

function LeadDetail() {
  const { leadId } = Route.useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [page, setPage] = useState<LandingPage | null>(null);
  const [outreachHistory, setOutreachHistory] = useState<Outreach[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [l, d, p, o] = await Promise.all([
        supabase.from("leads").select("*").eq("id", leadId).single(),
        supabase.from("diagnoses").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("landing_pages").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("outreach").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      ]);
      if (l.data) setLead(l.data);
      if (d.data) setDiagnosis(d.data);
      if (p.data) setPage(p.data);
      if (o.data) setOutreachHistory(o.data);
    };
    fetchAll();
  }, [leadId]);

  if (!lead) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link to="/pipeline" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Pipeline
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lead.business_name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{lead.city}</span>
            <Badge variant="outline">{lead.niche}</Badge>
            {lead.rating && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />{lead.rating}</span>}
            {lead.review_count !== null && <span>{lead.review_count} reviews</span>}
          </div>
        </div>
        <Badge className="w-fit capitalize">{lead.status}</Badge>
      </div>

      {/* Contact info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Contact & Web</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {lead.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{lead.email}</p>}
          {lead.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{lead.phone}</p>}
          {lead.website_url && (
            <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
              <Globe className="h-4 w-4" />{lead.website_url} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {lead.google_maps_url && (
            <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
              <MapPin className="h-4 w-4" />Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {lead.website_age && <p className="text-muted-foreground">Website age: {lead.website_age}</p>}
          {lead.deal_value && <p className="font-medium">Deal value: ${Number(lead.deal_value).toLocaleString()}</p>}
        </CardContent>
      </Card>

      {/* Diagnosis */}
      {diagnosis && (
        <Card>
          <CardHeader><CardTitle className="text-base">AI Diagnosis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{diagnosis.diagnosis_text}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Hero Angle</p><p className="font-medium">{diagnosis.hero_angle}</p></div>
              <div><p className="text-xs text-muted-foreground">Tone</p><p className="font-medium capitalize">{diagnosis.tone}</p></div>
              <div><p className="text-xs text-muted-foreground">Channel</p><Badge variant="outline" className="capitalize">{diagnosis.channel}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Score</p><p className="font-medium">{diagnosis.score}/100</p></div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cold Message</p>
              <div className="p-3 rounded-lg bg-muted text-sm">{diagnosis.cold_message}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Landing Page Preview */}
      {page && (
        <Card>
          <CardHeader><CardTitle className="text-base">Landing Page</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Badge variant="outline">{page.template_used}</Badge>
              {page.color_scheme && <span>Theme: {page.color_scheme}</span>}
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <iframe srcDoc={page.html_content} className="w-full h-[400px]" title="Landing page preview" sandbox="" />
            </div>
            {page.video_url && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Video</p>
                <a href={page.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{page.video_url}</a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outreach History */}
      {outreachHistory.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Outreach History</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {outreachHistory.map((o) => (
              <div key={o.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">{o.channel}</Badge>
                  <Badge variant={o.status === "positive" ? "default" : "secondary"} className="capitalize text-xs">{o.status}</Badge>
                  {o.sent_at && <span className="text-xs text-muted-foreground">{new Date(o.sent_at).toLocaleDateString()}</span>}
                </div>
                <p className="text-sm">{o.message_content}</p>
                {o.reply_text && (
                  <div className="mt-2 p-2 rounded bg-accent/50">
                    <p className="text-xs text-muted-foreground">Reply:</p>
                    <p className="text-sm">{o.reply_text}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
