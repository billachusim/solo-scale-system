import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Send, Edit } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Outreach = Database["public"]["Tables"]["outreach"]["Row"];

export const Route = createFileRoute("/outreach")({
  component: OutreachPage,
});

function OutreachPage() {
  const [messages, setMessages] = useState<Outreach[]>([]);
  const [leadNames, setLeadNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: msgs } = await supabase.from("outreach").select("*").order("created_at", { ascending: false });
      if (msgs) {
        setMessages(msgs);
        const leadIds = [...new Set(msgs.map((m) => m.lead_id))];
        if (leadIds.length > 0) {
          const { data: leads } = await supabase.from("leads").select("id, business_name").in("id", leadIds);
          if (leads) {
            const map: Record<string, string> = {};
            leads.forEach((l) => { map[l.id] = l.business_name; });
            setLeadNames(map);
          }
        }
      }
    };
    fetchData();
  }, []);

  const approve = async (id: string) => {
    await supabase.from("outreach").update({ status: "approved" }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "approved" as const } : m));
    toast.success("Message approved");
  };

  const reject = async (id: string) => {
    await supabase.from("outreach").update({ status: "negative" }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "negative" as const } : m));
    toast.info("Message rejected");
  };

  const pending = messages.filter((m) => m.status === "pending_review");
  const approved = messages.filter((m) => m.status === "approved");
  const sent = messages.filter((m) => m.status === "sent" || m.status === "replied" || m.status === "positive");

  const totalSent = messages.filter((m) => ["sent", "replied", "positive", "negative"].includes(m.status)).length;
  const totalReplied = messages.filter((m) => ["replied", "positive", "negative"].includes(m.status)).length;
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outreach</h1>
          <p className="text-muted-foreground text-sm">{messages.length} total messages · {replyRate}% reply rate</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{pending.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{approved.length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{totalSent}</p><p className="text-xs text-muted-foreground">Sent</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{replyRate}%</p><p className="text-xs text-muted-foreground">Reply Rate</p></CardContent></Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">No messages pending review</p>
          ) : pending.map((m) => (
            <MessageCard key={m.id} message={m} leadName={leadNames[m.lead_id]} onApprove={() => approve(m.id)} onReject={() => reject(m.id)} showActions />
          ))}
        </TabsContent>
        <TabsContent value="approved" className="space-y-3 mt-4">
          {approved.length === 0 ? (
            <p className="text-muted-foreground text-sm">No approved messages waiting to send</p>
          ) : approved.map((m) => (
            <MessageCard key={m.id} message={m} leadName={leadNames[m.lead_id]} />
          ))}
        </TabsContent>
        <TabsContent value="sent" className="space-y-3 mt-4">
          {sent.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sent messages yet</p>
          ) : sent.map((m) => (
            <MessageCard key={m.id} message={m} leadName={leadNames[m.lead_id]} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MessageCard({
  message, leadName, onApprove, onReject, showActions,
}: {
  message: Outreach; leadName?: string; onApprove?: () => void; onReject?: () => void; showActions?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{leadName || "Unknown"}</p>
            <Badge variant="outline" className="capitalize text-xs">{message.channel}</Badge>
          </div>
          <Badge variant={message.status === "positive" ? "default" : "secondary"} className="capitalize text-xs">{message.status.replace("_", " ")}</Badge>
        </div>
        <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{message.message_content}</p>
        {message.eval_result && (
          <div className="text-xs text-muted-foreground">
            Eval: {typeof message.eval_result === "object" ? JSON.stringify(message.eval_result) : String(message.eval_result)}
          </div>
        )}
        {message.reply_text && (
          <div className="p-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground">Reply:</p>
            <p className="text-sm">{message.reply_text}</p>
          </div>
        )}
        {showActions && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={onApprove}><Check className="h-4 w-4 mr-1" />Approve</Button>
            <Button size="sm" variant="outline" onClick={onReject}><X className="h-4 w-4 mr-1" />Reject</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
