import { useState } from "react";
import { Check, Pencil, ShieldCheck } from "lucide-react";
import { Badge, Button } from "../components/shared";

export function RequirementAnalysisResults({
  result,
  projectId,
  text,
  onToast,
  onReset,
}: {
  result: any;
  projectId: number | null;
  text: string;
  onToast: (message: string) => void;
  onReset: () => void;
}) {
  const [ready, setReady] = useState(false);

  const markReady = async () => {
    if (!projectId) {
      onToast("Select a project before marking this requirement ready.");
      return;
    }
    try {
      const response = await fetch("/api/analyses/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, step: 4, status: "ready" }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not save requirement progress.");
      setReady(true);
      onToast("Requirement is ready for development.");
    } catch (error: any) {
      onToast(error?.message || "Could not save requirement progress.");
    }
  };

  return (
    <div className="results-page requirement-results">
      <div className="results-top">
        <div>
          <div className="eyebrow">ANALYSIS COMPLETE · REQUIREMENT INTELLIGENCE</div>
          <h2>Here’s what should be built.</h2>
          <p>CLARIVON connected the business need to actionable requirements and surfaced the remaining decisions.</p>
        </div>
        <div className="results-actions">
          <Button variant="secondary" onClick={onReset}><Pencil size={15} /> Edit input</Button>
          <Button onClick={markReady}>{ready ? <Check size={15} /> : <ShieldCheck size={15} />} {ready ? "Development ready" : "Mark development ready"}</Button>
        </div>
      </div>
      <div className="results-meta">
        <span><span className="live-dot" /> Real AI requirement analysis complete</span>
        <span>STEP {ready ? "04 · READY" : "03 · CLARIFY"}</span>
        <span>{result.confidence}% confidence</span>
        <span>{result.requirements.length} requirements</span>
      </div>
      <div className="results-grid">
        <div className="results-main">
          <section className="result-block accent-violet">
            <div className="result-label"><span className="result-num">01</span><div><span className="card-kicker">BUSINESS NEED</span><h3>What outcome needs to change?</h3></div><Badge tone="mint">{result.confidence}% confidence</Badge></div>
            <p className="result-lead">{result.businessNeed}</p>
            <div className="traceability-mini"><span>SOURCE INPUT</span><p>{text}</p></div>
          </section>
          {result.requirements.map((item: any, index: number) => <section className="result-block requirement-card-highlight" key={`${item.title}-${index}`}><div className="result-label"><span className="result-num">{String(index + 2).padStart(2, "0")}</span><div><span className="card-kicker">{item.category.toUpperCase()} REQUIREMENT</span><h3>{item.title}</h3></div><Badge tone={item.priority.toLowerCase() === "high" ? "rose" : "amber"}>{item.priority}</Badge></div><p className="result-lead">{item.description}</p><div className="requirement-card-meta"><span>{item.confidence}% confidence</span></div></section>)}
          <section className="result-block"><div className="result-label"><span className="result-num">Q</span><div><span className="card-kicker">FOLLOW-UP QUESTIONS</span><h3>What still needs a decision?</h3></div></div>{result.followUpQuestions.map((question: string) => <p className="section-supporting" key={question}>{question}</p>)}</section>
        </div>
        <aside className="results-side"><div className="surface-card validation-card"><div className="card-kicker">QUALITY CHECK</div><h3>Analysis signals</h3><p>{result.ambiguities.length} ambiguities and {result.missingInformation.length} missing information items need review.</p><div className="validation-summary"><ShieldCheck size={16} /><p>Review clarifications before marking this requirement development ready.</p></div></div></aside>
      </div>
    </div>
  );
}
