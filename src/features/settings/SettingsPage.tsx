import { useState } from "react";
import { User, Database, Bell, Palette, Shield, ChevronRight, Check, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-700/60 bg-[#0F172A]/50">
        <Icon className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <div className="divide-y divide-slate-700/40">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={"relative w-11 h-6 rounded-full transition-colors " + (checked ? "bg-indigo-600" : "bg-slate-700")}>
      <span className={"absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform " + (checked ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("Admin User");
  const [email] = useState(user?.email ?? "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [deployAlerts, setDeployAlerts] = useState(true);
  const [auditSummaries, setAuditSummaries] = useState(false);
  const [animations, setAnimations] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast("success", "Settings saved");
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast("success", "Signed out");
    } catch {
      toast("error", "Failed to sign out");
    }
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isConnected = supabaseUrl && !supabaseUrl.includes("your-project");

  return (
    <div className="space-y-4">
      <Section icon={User} title="Profile">
        <div className="p-4 space-y-3">
          <div>
            <label className="label">Display name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center">
            {saving ? "Saving..." : <><Check className="w-4 h-4" />Save profile</>}
          </button>
        </div>
      </Section>

      <Section icon={Database} title="Database">
        <div className="p-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-slate-700/60">
            <div className="min-w-0 mr-3">
              <p className="text-sm font-medium text-slate-200">Supabase</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{supabaseUrl ?? "Not configured"}</p>
            </div>
            <span className={"badge border flex-shrink-0 " + (isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30")}>
              <span className={"w-1.5 h-1.5 rounded-full mr-1.5 " + (isConnected ? "bg-emerald-400" : "bg-red-400")} />
              {isConnected ? "Connected" : "Not set"}
            </span>
          </div>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <Row label="Email notifications" desc="Receive updates by email"><Toggle checked={emailNotifs} onChange={setEmailNotifs} /></Row>
        <Row label="Deployment alerts" desc="When a project goes live"><Toggle checked={deployAlerts} onChange={setDeployAlerts} /></Row>
        <Row label="Audit summaries" desc="Weekly digest"><Toggle checked={auditSummaries} onChange={setAuditSummaries} /></Row>
      </Section>

      <Section icon={Palette} title="Appearance">
        <Row label="Animations" desc="Motion and transitions"><Toggle checked={animations} onChange={setAnimations} /></Row>
      </Section>

      <Section icon={Shield} title="Account">
        {["Change password", "Two-factor auth", "Active sessions"].map((label) => (
          <button key={label} className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#1E2939] transition-colors">
            <span className="text-sm text-slate-200">{label}</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        ))}
        <button onClick={handleSignOut} className="w-full flex items-center justify-between px-4 py-3.5 active:bg-red-500/10 transition-colors">
          <span className="text-sm text-red-400 flex items-center gap-2"><LogOut className="w-4 h-4" />Sign out</span>
          <ChevronRight className="w-4 h-4 text-red-500/50" />
        </button>
      </Section>

      <p className="text-center text-xs text-slate-600 pb-2">
        {user?.email} · AI Factory v1.0.0
      </p>
    </div>
  );
}
