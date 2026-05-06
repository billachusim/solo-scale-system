import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  details: Record<string, unknown> | null;
  lead_id: string | null;
  created_at: string;
}

const agentColors: Record<string, string> = {
  scout: "bg-blue-500/10 text-blue-500",
  diagnoser: "bg-purple-500/10 text-purple-500",
  builder: "bg-green-500/10 text-green-500",
  filmer: "bg-yellow-500/10 text-yellow-500",
  pitcher: "bg-orange-500/10 text-orange-500",
  checker: "bg-red-500/10 text-red-500",
  mobile: "bg-cyan-500/10 text-cyan-500",
  orchestrator: "bg-pink-500/10 text-pink-500",
};

export function AgentLogFeed() {
  const [logs, setLogs] = useState<AgentLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLogs(data as AgentLog[]);
    };
    fetchLogs();

    const channel = supabase
      .channel("agent-logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_logs" }, (payload) => {
        setLogs((prev) => [payload.new as AgentLog, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No agent activity yet. Run Scout to start the pipeline.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${agentColors[log.agent_name] || "bg-muted text-muted-foreground"}`}>
            {log.agent_name}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{log.action}</p>
            {log.details && Object.keys(log.details).length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {JSON.stringify(log.details)}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
