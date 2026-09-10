import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, ArrowDown, ArrowRight, BarChart3, Bell, Building2,
  Check, CheckCircle2, ChevronDown, ChevronRight, Circle, ClipboardList,
  Clock3, Copy, Download, ExternalLink, FileText, FolderKanban, Filter,
  Gauge, HelpCircle, LayoutDashboard, Lightbulb, LockKeyhole, LogOut,
  Mail, Menu, MessageCircleQuestion, MessageSquareText, MoreHorizontal,
  Pencil, Plus, Search, Send, Settings, Share2, ShieldCheck, Sparkles,
  Target, Trash2, TrendingUp, Upload, UserRound, Users, Workflow, X,
} from "lucide-react";
import { Logo, Button, Badge, ProgressBar, Toast, PageHeader, StatCard, WorkflowVisualization } from "../components/shared";

function ProfilePage({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user-profile");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "John Doe");
      setEmail(profile.email || "john.doe@clarivon.com");
      setRole(profile.role || "Lead Product Manager");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      onToast("Profile updated successfully.");
      setIsEditing(false);
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="YOUR PROFILE"
        title={profile?.name || "John Doe"}
        subtitle={`${profile?.role || "Product Manager"} · Customer Discovery & Requirement Intelligence`}
        action={
          <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
            <Pencil size={15} /> {isEditing ? "Cancel" : "Edit profile"}
          </Button>
        }
      />
      {isEditing && (
        <section className="surface-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3>Edit Profile</h3>
          <div className="settings-form" style={{ marginTop: "1rem" }}>
            <label>
              Full Name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Email Address
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Role / Title
              <input value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <Button onClick={() => updateMutation.mutate({ name, email, role, avatar: name.split(' ').map(n=>n[0]).join('').slice(0,2) })}>
              Save Profile
            </Button>
          </div>
        </section>
      )}
      <div className="profile-grid">
        <section className="surface-card profile-card">
          <div className="profile-hero">
            <div className="profile-avatar-large">{profile?.avatar || "JD"}</div>
            <div>
              <h3>{profile?.name || "John Doe"}</h3>
              <p>{profile?.role || "Product Manager"}</p>
              <span><Mail size={13} /> {profile?.email || "john.doe@clarivon.com"}</span>
            </div>
          </div>
        </section>
        <section className="surface-card profile-actions">
          <div className="card-heading compact">
            <div>
              <span className="card-kicker">ACCOUNT SECURITY</span>
              <h3>Keep your account secure</h3>
            </div>
          </div>
          <button onClick={() => { onToast("Signed out of session."); navigate("/"); }}>
            <LogOut size={17} />
            <span><strong>Sign out</strong><small>End your current session</small></span>
            <ChevronRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}


const requirementData = {
  input: "Customers want to complete checkout faster. Returning users should not have to enter their delivery information every time. The checkout should remember their previous address and make the process much quicker.",
  requirement: "The system should allow returning customers to reuse previously entered delivery information during checkout.",
  evidence: "Returning users should not have to enter their delivery information every time.",
  questions: [
    ["Which customer information should be saved and reused during checkout?", "High", "Clarify data scope for REQ-001."],
    ["How long should saved delivery information remain available?", "High", "Define retention behavior."],
    ["Should customers be able to edit saved information before checkout?", "Medium", "Define the customer control point."],
    ["Should saved information be available across different devices?", "Medium", "Clarify account and device scope."],
  ],
};


export { ProfilePage };
