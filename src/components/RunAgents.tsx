import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Stethoscope, Send, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { runDiagnoser, runChecker } from "@/server/agents.functions";

export function RunAgents() {
  const [runningScout, setRunningScout] = useState(false);
  const [runningDiagnoser, setRunningDiagnoser] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);

  const runScout = async () => {
    setRunningScout(true);
    try {
      // Generate demo leads for now (Firecrawl integration can be added later)
      const demoLeads = generateDemoLeads();
      for (const lead of demoLeads) {
        await supabase.from("leads").insert(lead);
      }
      await supabase.from("agent_logs").insert({
        agent_name: "scout",
        action: `Scouted ${demoLeads.length} businesses across configured cities. ${demoLeads.length} qualified leads added.`,
        details: { count: demoLeads.length, cities: [...new Set(demoLeads.map((l) => l.city))] },
      });
      toast.success(`Scout found ${demoLeads.length} leads`);
    } catch (err) {
      toast.error("Scout failed");
    } finally {
      setRunningScout(false);
    }
  };

  const runDiagnoserAgent = async () => {
    setRunningDiagnoser(true);
    try {
      const { data: newLeads } = await supabase.from("leads").select("*").eq("status", "new").order("created_at", { ascending: true }).limit(5);
      if (!newLeads || newLeads.length === 0) {
        toast.info("No new leads to diagnose");
        setRunningDiagnoser(false);
        return;
      }

      let diagnosed = 0;
      for (const lead of newLeads) {
        try {
          const result = await runDiagnoser({
            data: {
              leadId: lead.id,
              businessName: lead.business_name,
              city: lead.city,
              niche: lead.niche,
              rating: lead.rating,
              reviewCount: lead.review_count,
              websiteUrl: lead.website_url,
              websiteAge: lead.website_age,
            },
          });

          await supabase.from("diagnoses").insert({
            lead_id: lead.id,
            diagnosis_text: result.diagnosis_text,
            hero_angle: result.hero_angle,
            tone: result.tone,
            cold_message: result.cold_message,
            channel: result.channel,
            score: result.score,
          });

          await supabase.from("leads").update({ status: "diagnosed" }).eq("id", lead.id);
          diagnosed++;
        } catch (err) {
          console.error(`Failed to diagnose ${lead.business_name}:`, err);
        }
      }

      await supabase.from("agent_logs").insert({
        agent_name: "diagnoser",
        action: `Diagnosed ${diagnosed} leads with hero angles, tones, and cold messages`,
        details: { diagnosed, total: newLeads.length },
      });
      toast.success(`Diagnosed ${diagnosed} leads`);
    } catch (err) {
      toast.error("Diagnoser failed");
    } finally {
      setRunningDiagnoser(false);
    }
  };

  const runFullPipeline = async () => {
    setRunningPipeline(true);
    toast.info("Running full pipeline: Scout → Diagnoser...");
    await runScout();
    await runDiagnoserAgent();
    setRunningPipeline(false);
    toast.success("Pipeline complete!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Run Agents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={runScout} disabled={runningScout} variant="outline" size="sm" className="w-full">
            {runningScout ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
            Scout
          </Button>
          <Button onClick={runDiagnoserAgent} disabled={runningDiagnoser} variant="outline" size="sm" className="w-full">
            {runningDiagnoser ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Stethoscope className="h-4 w-4 mr-1" />}
            Diagnose
          </Button>
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Send className="h-4 w-4 mr-1" />
            Pitch
          </Button>
          <Button onClick={runFullPipeline} disabled={runningPipeline} size="sm" className="w-full">
            {runningPipeline ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Run All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Scout finds leads → Diagnoser generates briefs → Builder creates pages → Pitcher sends messages
        </p>
      </CardContent>
    </Card>
  );
}

function generateDemoLeads() {
  const cities = ["Austin", "Denver", "Miami"];
  const niches = [
    { name: "Dentist", businesses: ["Bright Smile Dental", "Westside Cosmetic Dentistry", "Family Dental Care"] },
    { name: "Salon", businesses: ["The Lotus Salon", "Urban Cuts Studio", "Bella Hair & Beauty"] },
    { name: "Roofing", businesses: ["Summit Roofing Co", "Eagle Shield Roofing", "Premier Roof Solutions"] },
    { name: "Plumbing", businesses: ["AquaFix Plumbing", "Pro Drain Solutions"] },
    { name: "Real Estate", businesses: ["HomeFirst Realty", "Cornerstone Properties"] },
  ];

  const leads: Array<{
    business_name: string; city: string; niche: string;
    rating: number; review_count: number; website_url: string | null;
    website_age: string | null; google_maps_url: string;
    address: string; email: string; phone: string;
  }> = [];

  const shuffledNiches = niches.sort(() => Math.random() - 0.5);
  for (const niche of shuffledNiches.slice(0, 3)) {
    for (const biz of niche.businesses.slice(0, 2)) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const hasOldSite = Math.random() > 0.5;
      leads.push({
        business_name: biz,
        city,
        niche: niche.name,
        rating: Number((4 + Math.random()).toFixed(1)),
        review_count: Math.floor(Math.random() * 40) + 5,
        website_url: hasOldSite ? `http://www.${biz.toLowerCase().replace(/\s+/g, "")}.com` : null,
        website_age: hasOldSite ? "2014" : null,
        google_maps_url: `https://maps.google.com/?q=${encodeURIComponent(biz + " " + city)}`,
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St, ${city}`,
        email: `info@${biz.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      });
    }
  }

  return leads;
}
