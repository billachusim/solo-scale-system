import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type LeadStatus = Database["public"]["Enums"]["lead_status"];

export const Route = createFileRoute("/pipeline")({
  component: Pipeline,
});

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: "new", label: "New", color: "bg-blue-500" },
  { status: "diagnosed", label: "Diagnosed", color: "bg-purple-500" },
  { status: "built", label: "Page Built", color: "bg-green-500" },
  { status: "pitched", label: "Pitched", color: "bg-orange-500" },
  { status: "replied", label: "Replied", color: "bg-yellow-500" },
  { status: "booked", label: "Booked", color: "bg-cyan-500" },
  { status: "closed", label: "Closed", color: "bg-emerald-500" },
];

function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (data) setLeads(data);
    };
    fetch();
  }, []);

  const getLeadsByStatus = (status: LeadStatus) => leads.filter((l) => l.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
        <p className="text-muted-foreground text-sm">{leads.length} leads in pipeline</p>
      </div>

      {/* Mobile: stacked list view */}
      <div className="md:hidden space-y-4">
        {columns.map((col) => {
          const colLeads = getLeadsByStatus(col.status);
          if (colLeads.length === 0) return null;
          return (
            <div key={col.status}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">{colLeads.length}</Badge>
              </div>
              <div className="space-y-2">
                {colLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: kanban */}
      <div className="hidden md:grid md:grid-cols-7 gap-3 min-h-[600px]">
        {columns.map((col) => {
          const colLeads = getLeadsByStatus(col.status);
          return (
            <div key={col.status} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-xs font-semibold text-foreground uppercase">{col.label}</h3>
                <Badge variant="secondary" className="text-xs h-5">{colLeads.length}</Badge>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {colLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadCard({ lead, compact }: { lead: Lead; compact?: boolean }) {
  return (
    <Link
      to="/leads/$leadId"
      params={{ leadId: lead.id }}
      className="block p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
    >
      <p className={`font-medium text-foreground ${compact ? "text-xs" : "text-sm"}`}>
        {lead.business_name}
      </p>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span>{lead.city}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="outline" className="text-xs">{lead.niche}</Badge>
        {lead.rating && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            {lead.rating}
          </span>
        )}
      </div>
      {!compact && lead.website_url && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span className="truncate">{lead.website_url}</span>
        </div>
      )}
      {lead.deal_value && Number(lead.deal_value) > 0 && (
        <p className="mt-1 text-xs font-medium text-foreground">${Number(lead.deal_value).toLocaleString()}</p>
      )}
    </Link>
  );
}
