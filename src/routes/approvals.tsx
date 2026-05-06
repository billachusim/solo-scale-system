import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, AlertTriangle, MessageSquare, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Outreach = Database["public"]["Tables"]["outreach"]["Row"];

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

interface ApprovalItem {
  type: "high_value_deal" | "positive_reply" | "pending_message";
  lead: Lead;
  outreach?: Outreach;
}

function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [calendlyUrl, setCalendlyUrl] = useState("");

  useEffect(() => {
    const fetchApprovals = async () => {
      const [leadsRes, outreachRes, settingsRes] = await Promise.all([
        supabase.from("leads").select("*"),
        supabase.from("outreach").select("*").in("status", ["pending_review", "positive"]),
        supabase.from("settings").select("value").eq("key", "calendly_url").maybeSingle(),
      ]);

      const leads = leadsRes.data || [];
      const outreach = outreachRes.data || [];
      if (settingsRes.data?.value) setCalendlyUrl(String(settingsRes.data.value));

      const leadsMap = new Map(leads.map((l) => [l.id, l]));
      const approvalItems: ApprovalItem[] = [];

      // High value deals needing approval
      leads.filter((l) => l.deal_value && Number(l.deal_value) > 3000 && l.status !== "closed" && l.status !== "rejected")
        .forEach((l) => approvalItems.push({ type: "high_value_deal", lead: l }));

      // Positive replies needing follow-up
      outreach.filter((o) => o.status === "positive").forEach((o) => {
        const lead = leadsMap.get(o.lead_id);
        if (lead) approvalItems.push({ type: "positive_reply", lead, outreach: o });
      });

      // Messages pending review
      outreach.filter((o) => o.status === "pending_review").forEach((o) => {
        const lead = leadsMap.get(o.lead_id);
        if (lead) approvalItems.push({ type: "pending_message", lead, outreach: o });
      });

      setItems(approvalItems);
    };
    fetchApprovals();
  }, []);

  const approveMessage = async (outreachId: string) => {
    await supabase.from("outreach").update({ status: "approved" }).eq("id", outreachId);
    setItems((prev) => prev.filter((i) => i.outreach?.id !== outreachId));
    toast.success("Approved!");
  };

  const rejectMessage = async (outreachId: string) => {
    await supabase.from("outreach").update({ status: "negative" }).eq("id", outreachId);
    setItems((prev) => prev.filter((i) => i.outreach?.id !== outreachId));
    toast.info("Rejected");
  };

  const bookCall = async (lead: Lead) => {
    if (calendlyUrl) {
      window.open(calendlyUrl, "_blank");
    }
    await supabase.from("leads").update({ status: "booked" }).eq("id", lead.id);
    await supabase.from("agent_logs").insert({
      agent_name: "mobile",
      action: `Zoom call booked for ${lead.business_name}`,
      lead_id: lead.id,
    });
    setItems((prev) => prev.filter((i) => i.lead.id !== lead.id || i.type !== "positive_reply"));
    toast.success("Call booked!");
  };

  const approveDeal = async (lead: Lead) => {
    await supabase.from("agent_logs").insert({
      agent_name: "orchestrator",
      action: `High-value deal approved for ${lead.business_name} ($${Number(lead.deal_value).toLocaleString()})`,
      lead_id: lead.id,
    });
    setItems((prev) => prev.filter((i) => i.lead.id !== lead.id || i.type !== "high_value_deal"));
    toast.success("Deal approved!");
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground text-sm">{items.length} items need your attention</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Check className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">All clear! No pending approvals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <Card key={`${item.type}-${item.lead.id}-${item.outreach?.id || i}`}>
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2">
                  {item.type === "high_value_deal" && <DollarSign className="h-5 w-5 text-yellow-500" />}
                  {item.type === "positive_reply" && <MessageSquare className="h-5 w-5 text-green-500" />}
                  {item.type === "pending_message" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.lead.business_name}</p>
                    <p className="text-xs text-muted-foreground">{item.lead.city} · {item.lead.niche}</p>
                  </div>
                  <Badge variant={item.type === "high_value_deal" ? "destructive" : item.type === "positive_reply" ? "default" : "secondary"} className="text-xs">
                    {item.type === "high_value_deal" ? `$${Number(item.lead.deal_value).toLocaleString()}` : item.type === "positive_reply" ? "Positive Reply" : "Pending Review"}
                  </Badge>
                </div>

                {/* Content */}
                {item.outreach && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    {item.outreach.reply_text || item.outreach.message_content}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {item.type === "high_value_deal" && (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => approveDeal(item.lead)}>
                        <Check className="h-4 w-4 mr-1" /> Approve Deal
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                        supabase.from("leads").update({ status: "rejected" }).eq("id", item.lead.id);
                        setItems((prev) => prev.filter((x) => x.lead.id !== item.lead.id || x.type !== "high_value_deal"));
                      }}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {item.type === "positive_reply" && (
                    <Button size="sm" className="flex-1" onClick={() => bookCall(item.lead)}>
                      <Calendar className="h-4 w-4 mr-1" /> Book Zoom
                    </Button>
                  )}
                  {item.type === "pending_message" && item.outreach && (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => approveMessage(item.outreach!.id)}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => rejectMessage(item.outreach!.id)}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
