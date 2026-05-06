import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

interface SettingsData {
  cities: string[];
  niches: string[];
  daily_scout_limit: number;
  daily_build_limit: number;
  daily_pitch_limit: number;
  calendly_url: string;
  approval_threshold: number;
  min_reply_rate: number;
}

const defaults: SettingsData = {
  cities: ["Austin", "Denver", "Miami", "Phoenix", "Nashville"],
  niches: ["Dentist", "Salon", "Roofing", "Plumbing", "Real Estate", "Restaurant"],
  daily_scout_limit: 220,
  daily_build_limit: 5,
  daily_pitch_limit: 30,
  calendly_url: "",
  approval_threshold: 3000,
  min_reply_rate: 12,
};

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaults);
  const [saving, setSaving] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newNiche, setNewNiche] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("settings").select("key, value");
      if (data && data.length > 0) {
        const merged = { ...defaults };
        data.forEach((row) => {
          const key = row.key as keyof SettingsData;
          if (key in merged) {
            (merged as Record<string, unknown>)[key] = row.value;
          }
        });
        setSettings(merged);
      }
    };
    fetch();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        await supabase.from("settings").upsert({ key, value: JSON.parse(JSON.stringify(value)) }, { onConflict: "key" });
      }
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addCity = () => {
    if (newCity.trim() && !settings.cities.includes(newCity.trim())) {
      setSettings({ ...settings, cities: [...settings.cities, newCity.trim()] });
      setNewCity("");
    }
  };

  const addNiche = () => {
    if (newNiche.trim() && !settings.niches.includes(newNiche.trim())) {
      setSettings({ ...settings, niches: [...settings.niches, newNiche.trim()] });
      setNewNiche("");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure your agency pipeline</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Target Cities</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {settings.cities.map((city) => (
              <Badge key={city} variant="secondary" className="gap-1">
                {city}
                <button onClick={() => setSettings({ ...settings, cities: settings.cities.filter((c) => c !== city) })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Add city..." onKeyDown={(e) => e.key === "Enter" && addCity()} />
            <Button variant="outline" size="sm" onClick={addCity}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Target Niches</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {settings.niches.map((niche) => (
              <Badge key={niche} variant="secondary" className="gap-1">
                {niche}
                <button onClick={() => setSettings({ ...settings, niches: settings.niches.filter((n) => n !== niche) })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newNiche} onChange={(e) => setNewNiche(e.target.value)} placeholder="Add niche..." onKeyDown={(e) => e.key === "Enter" && addNiche()} />
            <Button variant="outline" size="sm" onClick={addNiche}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Daily Limits</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Scout limit (businesses/day)</label>
            <Input type="number" value={settings.daily_scout_limit} onChange={(e) => setSettings({ ...settings, daily_scout_limit: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Build limit (pages/day)</label>
            <Input type="number" value={settings.daily_build_limit} onChange={(e) => setSettings({ ...settings, daily_build_limit: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Pitch limit (messages/day)</label>
            <Input type="number" value={settings.daily_pitch_limit} onChange={(e) => setSettings({ ...settings, daily_pitch_limit: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Calendly</CardTitle></CardHeader>
        <CardContent>
          <Input value={settings.calendly_url} onChange={(e) => setSettings({ ...settings, calendly_url: e.target.value })} placeholder="https://calendly.com/your-link" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Orchestrator Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Deal approval threshold ($)</label>
            <Input type="number" value={settings.approval_threshold} onChange={(e) => setSettings({ ...settings, approval_threshold: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Min reply rate alert (%)</label>
            <Input type="number" value={settings.min_reply_rate} onChange={(e) => setSettings({ ...settings, min_reply_rate: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
