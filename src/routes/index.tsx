import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { AgentLogFeed } from "@/components/AgentLogFeed";
import { RunAgents } from "@/components/RunAgents";
import {
  Search,
  Stethoscope,
  Hammer,
  Send,
  MessageSquare,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

interface Stats {
  totalLeads: number;
  diagnosed: number;
  pagesBuilt: number;
  messagesSent: number;
  replies: number;
  booked: number;
  pendingApprovals: number;
  replyRate: number;
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0, diagnosed: 0, pagesBuilt: 0, messagesSent: 0,
    replies: 0, booked: 0, pendingApprovals: 0, replyRate: 0,
  });
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [leads, diagnoses, pages, outreach] = await Promise.all([
        supabase.from("leads").select("status, deal_value"),
        supabase.from("diagnoses").select("id"),
        supabase.from("landing_pages").select("id"),
        supabase.from("outreach").select("status"),
      ]);

      const leadsData = leads.data || [];
      const outreachData = outreach.data || [];
      const sent = outreachData.filter((o) => o.status === "sent" || o.status === "replied" || o.status === "positive" || o.status === "negative").length;
      const replied = outreachData.filter((o) => o.status === "replied" || o.status === "positive" || o.status === "negative").length;
      const positive = outreachData.filter((o) => o.status === "positive").length;
      const rate = sent > 0 ? Math.round((replied / sent) * 100) : 0;
      const pendingReview = outreachData.filter((o) => o.status === "pending_review").length;

      const newAlerts: string[] = [];
      if (rate > 0 && rate < 12) newAlerts.push(`⚠️ Reply rate is ${rate}% — below 12% threshold`);
      const bigDeals = leadsData.filter((l) => l.deal_value && Number(l.deal_value) > 3000);
      if (bigDeals.length > 0) newAlerts.push(`💰 ${bigDeals.length} deal(s) exceed $3,000 — needs approval`);

      setStats({
        totalLeads: leadsData.length,
        diagnosed: diagnoses.data?.length || 0,
        pagesBuilt: pages.data?.length || 0,
        messagesSent: sent,
        replies: replied,
        booked: leadsData.filter((l) => l.status === "booked").length,
        pendingApprovals: pendingReview + bigDeals.length,
        replyRate: rate,
      });
      setAlerts(newAlerts);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your AI agency at a glance</p>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{alert}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Leads Scouted" value={stats.totalLeads} icon={Search} description="Total in pipeline" />
        <StatCard title="Diagnosed" value={stats.diagnosed} icon={Stethoscope} description="Briefs generated" />
        <StatCard title="Pages Built" value={stats.pagesBuilt} icon={Hammer} description="Landing pages" />
        <StatCard title="Messages Sent" value={stats.messagesSent} icon={Send} description="Across all channels" />
        <StatCard title="Replies" value={stats.replies} icon={MessageSquare} description={`${stats.replyRate}% rate`} />
        <StatCard title="Booked" value={stats.booked} icon={CalendarCheck} description="Zoom calls" />
        <StatCard title="Reply Rate" value={`${stats.replyRate}%`} icon={TrendingUp} description="Target: 14%" />
        <StatCard title="Pending" value={stats.pendingApprovals} icon={AlertTriangle} description="Need your input" />
      </div>

      <RunAgents />

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Agent Activity</h2>
        <AgentLogFeed />
      </div>
    </div>
  );
}
