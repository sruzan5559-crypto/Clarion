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

function NewProjectModal({
  isOpen,
  onClose,
  onSuccess,
  onToast
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProj: any) => void;
  onToast: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; customer?: string }>({});

  const createMutation = useMutation({
    mutationFn: async (newProj: { name: string; customer: string; description?: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProj)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create project");
      }
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast(`Project "${data.name}" created successfully.`);
      onSuccess(data);
      setName("");
      setCustomer("");
      setDescription("");
      setErrors({});
      onClose();
    },
    onError: (err: any) => {
      onToast(`Error creating project: ${err?.message || "Server error"}`);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; customer?: string } = {};
    if (!name.trim()) newErrors.name = "Project name is required.";
    if (!customer.trim()) newErrors.customer = "Customer name is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate({ name: name.trim(), customer: customer.trim(), description: description.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Project Name <span className="required-star">*</span>
              </label>
              <input
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Mobile Banking Refresh"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                Customer / Client Name <span className="required-star">*</span>
              </label>
              <input
                className={`form-input ${errors.customer ? "error" : ""}`}
                placeholder="e.g. FinBank Global"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  if (errors.customer) setErrors((prev) => ({ ...prev, customer: undefined }));
                }}
              />
              {errors.customer && <span className="form-error-msg">{errors.customer}</span>}
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe the project scope or research goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectsPage({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Updated");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch projects");
      return json.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast("Project deleted.");
      setMenuOpenId(null);
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/projects/${id}/archive`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast("Project archived.");
      setMenuOpenId(null);
    }
  });

  let filtered = projectsList.filter((p: any) =>
    `${p.name} ${p.customer || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterStatus !== "All") {
    filtered = filtered.filter((p: any) => p.status === filterStatus);
  }

  filtered.sort((a: any, b: any) => {
    if (sortBy === "Name") return a.name.localeCompare(b.name);
    if (sortBy === "Conversations") return (b.conversation_count ?? b.conversations ?? 0) - (a.conversation_count ?? a.conversations ?? 0);
    if (sortBy === "Problems") return (b.problem_count ?? b.problems ?? 0) - (a.problem_count ?? a.problems ?? 0);
    if (sortBy === "Confidence") return (b.confidence_score ?? b.confidence ?? 0) - (a.confidence_score ?? a.confidence ?? 0);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); // Updated
  });

  return (
    <>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        onToast={onToast}
      />
      <PageHeader
        eyebrow="CUSTOMER DISCOVERY · WORKSPACE"
        title="Projects"
        subtitle="Organize customer discovery work across products, customers, and research initiatives."
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New project
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="btn btn-secondary">
          <option value="All">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Validated">Validated</option>
          <option value="Needs discovery">Needs discovery</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="btn btn-secondary">
          <option value="Updated">Sort by: Updated</option>
          <option value="Name">Sort by: Name</option>
          <option value="Conversations">Sort by: Conversations</option>
          <option value="Problems">Sort by: Problems</option>
          <option value="Confidence">Sort by: Confidence</option>
        </select>
      </div>
      
      {projectsList.length === 0 ? (
        <div className="surface-card" style={{ padding: '3rem', textAlign: 'center' }}>
           <FolderKanban size={32} style={{ opacity: 0.5, marginBottom: '1rem', display: 'inline-block' }} />
           <h3>No projects yet</h3>
           <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create a project to start organizing your discovery work.</p>
           <Button onClick={() => setIsModalOpen(true)}>Create a new project</Button>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project: any) => (
            <div className="project-card surface-card" key={project.id || project.name} style={{ position: 'relative' }}>
              <div className="project-card-top">
                <div className={`project-logo large ${project.tone || "blue"}`}>
                  {project.name.slice(0, 1)}
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}>
                    <MoreHorizontal size={18} />
                  </button>
                  {menuOpenId === project.id && (
                    <div style={{ position: 'absolute', right: 0, top: '24px', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '150px', padding: '4px' }}>
                      <button className="nav-item" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => { setMenuOpenId(null); onToast("Edit not implemented in demo"); }}>
                         <Pencil size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Edit
                      </button>
                      <button className="nav-item" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => archiveMutation.mutate(project.id)}>
                         <FolderKanban size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Archive
                      </button>
                      <button className="nav-item" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rose)' }} onClick={() => { if(window.confirm('Are you sure you want to delete this project?')) deleteMutation.mutate(project.id); }}>
                         <Trash2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3>{project.name}</h3>
              <p className="project-customer">
                <Building2 size={14} /> {project.customer || "General"}
              </p>
              <div className="project-card-stats">
                <div>
                  <span>Conversations</span>
                  <strong>{project.conversation_count ?? project.conversations ?? 0}</strong>
                </div>
                <div>
                  <span>Problems</span>
                  <strong>{project.problem_count ?? project.problems ?? 0}</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{project.confidence_score ?? project.confidence ?? 80}%</strong>
                </div>
              </div>
              <div className="project-card-bottom">
                <Badge tone={project.status === "Validated" ? "mint" : project.status === "Needs discovery" ? "amber" : "blue"}>
                  {project.status || "In Progress"}
                </Badge>
                <span>Updated {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : (project.updated || "Recently")}</span>
              </div>
              <Button variant="secondary" className="full-width" onClick={() => navigate("/discovery")}>
                Open project <ArrowRight size={15} />
              </Button>
            </div>
          ))}
          <button className="new-project-card" onClick={() => setIsModalOpen(true)}>
            <span>
              <Plus size={19} />
            </span>
            <strong>Create a new project</strong>
            <small>Start a focused discovery workspace</small>
          </button>
        </div>
      )}
    </>
  );
}

function SlidersHorizontalIcon() { return <span className="sliders-icon"><span /><span /><span /></span>; }



export { ProjectsPage };
