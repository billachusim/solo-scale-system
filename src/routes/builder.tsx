import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hammer, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type LandingPage = Database["public"]["Tables"]["landing_pages"]["Row"];

export const Route = createFileRoute("/builder")({
  component: BuilderPage,
});

const templates = [
  { id: "dental", name: "Dental / Medical", color: "Soft Beige", sections: ["Hero", "Services", "Testimonials", "About", "Contact"] },
  { id: "salon", name: "Salon / Beauty", color: "Rose Gold", sections: ["Hero", "Gallery", "Services", "Pricing", "Book Now"] },
  { id: "trades", name: "Trades / Contractor", color: "Navy & Orange", sections: ["Hero", "Services", "Projects", "Reviews", "Free Quote"] },
  { id: "realestate", name: "Real Estate", color: "Slate Blue", sections: ["Hero", "Listings", "About", "Testimonials", "Contact"] },
  { id: "restaurant", name: "Restaurant / Food", color: "Warm Earth", sections: ["Hero", "Menu Highlights", "About", "Reviews", "Reservation"] },
];

function BuilderPage() {
  const [diagnosedLeads, setDiagnosedLeads] = useState<Lead[]>([]);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [building, setBuilding] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [l, p] = await Promise.all([
        supabase.from("leads").select("*").eq("status", "diagnosed").order("created_at", { ascending: false }),
        supabase.from("landing_pages").select("*").order("created_at", { ascending: false }),
      ]);
      if (l.data) setDiagnosedLeads(l.data);
      if (p.data) setPages(p.data);
    };
    fetchData();
  }, []);

  const buildPage = async (lead: Lead) => {
    setBuilding(lead.id);
    try {
      const template = pickTemplate(lead.niche);
      const html = generateHtml(lead, template);

      const { error } = await supabase.from("landing_pages").insert({
        lead_id: lead.id,
        html_content: html,
        template_used: template.id,
        sections: template.sections,
        color_scheme: template.color,
      });

      if (error) throw error;

      await supabase.from("leads").update({ status: "built" }).eq("id", lead.id);
      await supabase.from("agent_logs").insert({
        agent_name: "builder",
        action: `Landing page built for ${lead.business_name} using ${template.name} template`,
        lead_id: lead.id,
        details: { template: template.id, sections: template.sections.length },
      });

      setDiagnosedLeads((prev) => prev.filter((l) => l.id !== lead.id));
      toast.success(`Page built for ${lead.business_name}`);
    } catch (err) {
      toast.error("Failed to build page");
    } finally {
      setBuilding(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Landing Page Builder</h1>
        <p className="text-muted-foreground text-sm">{diagnosedLeads.length} leads ready for page generation</p>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {templates.map((t) => (
            <Card key={t.id} className="border-border">
              <CardContent className="p-4">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.color}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.sections.length} sections</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ready to build */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Ready to Build</h2>
        {diagnosedLeads.length === 0 ? (
          <p className="text-muted-foreground text-sm">No diagnosed leads waiting. Run the Diagnoser first.</p>
        ) : (
          <div className="space-y-3">
            {diagnosedLeads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lead.business_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{lead.niche}</Badge>
                      <span className="text-xs text-muted-foreground">{lead.city}</span>
                    </div>
                  </div>
                  <Button onClick={() => buildPage(lead)} disabled={building === lead.id} size="sm">
                    {building === lead.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Hammer className="h-4 w-4 mr-1" />}
                    Build Page
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
          <div className="w-full max-w-4xl h-[80vh] bg-card rounded-lg border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-border">
              <p className="text-sm font-medium">Page Preview</p>
              <Button variant="ghost" size="sm" onClick={() => setPreviewHtml(null)}>Close</Button>
            </div>
            <iframe srcDoc={previewHtml} className="w-full h-full" title="Preview" sandbox="" />
          </div>
        </div>
      )}

      {/* Recent builds */}
      {pages.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recent Builds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pages.slice(0, 6).map((p) => (
              <Card key={p.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setPreviewHtml(p.html_content)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{p.template_used}</Badge>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{p.color_scheme}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function pickTemplate(niche: string) {
  const n = niche.toLowerCase();
  if (n.includes("dent") || n.includes("medic") || n.includes("doctor") || n.includes("clinic")) return templates[0];
  if (n.includes("salon") || n.includes("beauty") || n.includes("spa") || n.includes("hair")) return templates[1];
  if (n.includes("roof") || n.includes("plumb") || n.includes("electric") || n.includes("hvac") || n.includes("contractor") || n.includes("trade")) return templates[2];
  if (n.includes("real") || n.includes("estate") || n.includes("realtor")) return templates[3];
  if (n.includes("restaurant") || n.includes("food") || n.includes("cafe") || n.includes("pizza")) return templates[4];
  return templates[2]; // default to trades
}

function generateHtml(lead: Lead, template: { id: string; name: string; color: string; sections: string[] }) {
  const colorMap: Record<string, { bg: string; accent: string; text: string }> = {
    "Soft Beige": { bg: "#f5f0e8", accent: "#8b7355", text: "#2d2418" },
    "Rose Gold": { bg: "#fff0f0", accent: "#b76e79", text: "#3d1f25" },
    "Navy & Orange": { bg: "#f0f4f8", accent: "#e8731a", text: "#1a2744" },
    "Slate Blue": { bg: "#f0f3f8", accent: "#4a6fa5", text: "#1a2744" },
    "Warm Earth": { bg: "#faf5f0", accent: "#c5713a", text: "#2d1f10" },
  };
  const colors = colorMap[template.color] || colorMap["Navy & Orange"];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.business_name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:${colors.bg};color:${colors.text}}
.hero{padding:80px 20px;text-align:center;background:${colors.text};color:${colors.bg}}
.hero h1{font-size:2.5rem;margin-bottom:16px}.hero p{font-size:1.1rem;opacity:.85;max-width:600px;margin:0 auto 24px}
.btn{display:inline-block;padding:14px 32px;background:${colors.accent};color:white;border-radius:8px;text-decoration:none;font-weight:600}
section{padding:60px 20px;max-width:900px;margin:0 auto}h2{font-size:1.8rem;margin-bottom:24px;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.card{background:white;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
footer{padding:40px 20px;text-align:center;background:${colors.text};color:${colors.bg};opacity:.7;font-size:.9rem}
</style></head>
<body>
<div class="hero">
<h1>${lead.business_name}</h1>
<p>Quality ${lead.niche.toLowerCase()} services in ${lead.city}. Trusted by the local community.</p>
<a href="#contact" class="btn">Get in Touch</a>
</div>
<section><h2>Our Services</h2><div class="grid">
<div class="card"><h3>Professional Service</h3><p>Dedicated to providing the best ${lead.niche.toLowerCase()} experience for every customer.</p></div>
<div class="card"><h3>Local Expertise</h3><p>Serving ${lead.city} and surrounding areas with years of trusted experience.</p></div>
<div class="card"><h3>Customer First</h3><p>Your satisfaction is our priority. See why our customers keep coming back.</p></div>
</div></section>
<section><h2>Why Choose Us</h2><div class="grid">
<div class="card"><h3>⭐ ${lead.rating || "5.0"} Rating</h3><p>${lead.review_count || 0} satisfied customers and counting.</p></div>
<div class="card"><h3>📍 Local Business</h3><p>Proudly serving the ${lead.city} community.</p></div>
</div></section>
<section id="contact"><h2>Contact Us</h2><div class="card" style="text-align:center">
<p>Ready to get started? Reach out today!</p>
${lead.phone ? `<p style="margin-top:12px">📞 ${lead.phone}</p>` : ""}
${lead.email ? `<p>✉️ ${lead.email}</p>` : ""}
${lead.address ? `<p>📍 ${lead.address}</p>` : ""}
</div></section>
<footer>© ${new Date().getFullYear()} ${lead.business_name}. All rights reserved.</footer>
</body></html>`;
}
