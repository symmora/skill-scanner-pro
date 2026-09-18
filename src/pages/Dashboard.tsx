import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronDown,
  FileSearch,
  Loader2,
  Plus,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

type RiskLevel = "none" | "low" | "medium" | "high" | "critical";
type SkillKind = "tool" | "mcp" | "prompt" | "extension";

const RISK_STYLE: Record<
  RiskLevel,
  { label: string; chip: string; bar: string; dot: string }
> = {
  none: {
    label: "Clean",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  low: {
    label: "Low",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
  },
  medium: {
    label: "Medium",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  high: {
    label: "High",
    chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    bar: "bg-orange-500",
    dot: "bg-orange-500",
  },
  critical: {
    label: "Critical",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
};

const KIND_LABEL: Record<SkillKind, string> = {
  tool: "Tool",
  mcp: "MCP",
  prompt: "Prompt pack",
  extension: "Extension",
};

function ScoreBar({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", RISK_STYLE[level].bar)}
        style={{ width: `${Math.max(score, score === 0 ? 0 : 4)}%` }}
      />
    </div>
  );
}

function SkillListItem({
  skill,
  rank,
  onRemove,
}: {
  skill: Doc<"scannedSkills">;
  rank: number;
  onRemove: (id: Id<"scannedSkills">) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = RISK_STYLE[skill.riskLevel];
  const isFlagged = skill.riskLevel === "high" || skill.riskLevel === "critical";

  return (
    <div className="px-5 py-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-4">
        <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground tabular-nums">
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold tracking-tight">{skill.name}</p>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-muted-foreground">
              {KIND_LABEL[skill.kind as SkillKind]}
            </Badge>
            {skill.findings.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {skill.findings.length} finding{skill.findings.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="mt-2 max-w-md">
            <ScoreBar score={skill.riskScore} level={skill.riskLevel as RiskLevel} />
          </div>
        </div>

        <span
          className={cn(
            "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex",
            style.chip,
          )}
        >
          {style.label}
        </span>

        <span
          className={cn(
            "w-10 shrink-0 text-right font-mono text-lg font-bold tabular-nums",
            isFlagged ? "text-red-600 dark:text-red-400" : "text-foreground",
          )}
        >
          {skill.riskScore}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="size-8 shrink-0 p-0 text-muted-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Hide findings" : "Show findings"}
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <div className="mt-4 ml-10 space-y-3 border-l-2 border-border/70 pl-4">
          {skill.description && (
            <p className="text-sm leading-6 text-muted-foreground">{skill.description}</p>
          )}
          {skill.findings.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              No manipulation patterns detected — every rule came back clean.
            </div>
          ) : (
            skill.findings.map((f) => (
              <div key={f.ruleId} className="rounded-lg border border-border/60 bg-card p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isFlagged ? (
                      <ShieldAlert className="size-4 text-red-500" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-500" />
                    )}
                    <p className="text-sm font-medium">{f.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{f.ruleId}</span>
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                      sev {f.severity}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{f.detail}</p>
                {f.evidence.length > 0 && (
                  <div className="mt-2.5 space-y-1">
                    {f.evidence.map((e, i) => (
                      <pre
                        key={i}
                        className="overflow-x-auto rounded-md bg-muted/70 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-foreground/80"
                      >
                        {e}
                      </pre>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(skill._id)}
            >
              <Trash2 className="size-3.5" />
              Remove from list
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "flagged", label: "High risk" },
  { id: "clean", label: "Clean" },
] as const;

export default function Dashboard() {
  const skills = useQuery(api.skills.listMySkills);
  const submitSkill = useMutation(api.skills.submitSkill);
  const removeSkill = useMutation(api.skills.removeSkill);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<SkillKind>("tool");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const sortedSkills = useMemo(() => skills ?? [], [skills]);

  const stats = useMemo(() => {
    const total = sortedSkills.length;
    const flagged = sortedSkills.filter(
      (s) => s.riskLevel === "high" || s.riskLevel === "critical",
    ).length;
    const clean = sortedSkills.filter((s) => s.riskLevel === "none").length;
    const top = sortedSkills[0]?.riskScore ?? 0;
    return { total, flagged, clean, top };
  }, [sortedSkills]);

  const visibleSkills = useMemo(() => {
    if (filter === "flagged") {
      return sortedSkills.filter((s) => s.riskLevel === "high" || s.riskLevel === "critical");
    }
    if (filter === "clean") {
      return sortedSkills.filter((s) => s.riskLevel === "none" || s.riskLevel === "low");
    }
    return sortedSkills;
  }, [sortedSkills, filter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await submitSkill({ name, kind, description: description || undefined, body });
      const label = RISK_STYLE[result.riskLevel as RiskLevel].label;
      toast.success(`Scanned "${name.trim()}" — risk ${result.riskScore}/100 (${label})`);
      setName("");
      setDescription("");
      setBody("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed. Check the content and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: Id<"scannedSkills">) => {
    try {
      await removeSkill({ id });
      toast.success("Removed from your list");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove skill");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        stats={skills ? { skills: stats.total, flagged: stats.flagged } : undefined}
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Risk score list</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Skills you scan are analyzed for malicious movements and hidden tooling, then ranked by risk.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Skills scanned", value: stats.total, icon: ScanLine, tone: "text-brand-500 bg-brand-50 dark:bg-brand-900/40" },
            { label: "High / critical", value: stats.flagged, icon: ShieldAlert, tone: "text-red-500 bg-red-500/10" },
            { label: "Clean", value: stats.clean, icon: ShieldCheck, tone: "text-emerald-500 bg-emerald-500/10" },
            { label: "Highest score", value: stats.top, icon: FileSearch, tone: "text-amber-500 bg-amber-500/10" },
          ].map((s) => (
            <Card key={s.label} className="border-border/70 shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", s.tone)}>
                  <s.icon className="size-5" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold tabular-nums leading-none">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Scan composer */}
          <Card className="h-fit border-border/70 shadow-card lg:sticky lg:top-24">
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                  <Plus className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold tracking-tight">Scan a skill</h2>
                  <p className="text-xs text-muted-foreground">Nothing executes — text analysis only.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="skill-name" className="text-[13px]">Name</Label>
                  <Input
                    id="skill-name"
                    placeholder="deploy-helper"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px]">Type</Label>
                  <Select value={kind} onValueChange={(v) => setKind(v as SkillKind)} disabled={submitting}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Skill type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="mcp">MCP server</SelectItem>
                      <SelectItem value="prompt">Prompt pack</SelectItem>
                      <SelectItem value="extension">Extension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="skill-desc" className="text-[13px]">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="skill-desc"
                    placeholder="What it claims to do"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="skill-body" className="text-[13px]">
                    Manifest / definition
                  </Label>
                  <Textarea
                    id="skill-body"
                    placeholder={"Paste the tool definition, MCP config, prompt text, or manifest here…"}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={8}
                    className="resize-y font-mono text-[13px]"
                    disabled={submitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 size-4" />
                      Run scan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Risk score list */}
          <Card className="overflow-hidden border-border/70 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <ScanLine className="size-4 text-brand-500" />
                <h2 className="text-sm font-semibold tracking-tight">Scan results</h2>
                <span className="text-xs text-muted-foreground">
                  {skills === undefined ? "loading…" : `${visibleSkills.length} shown`}
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      filter === f.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {skills === undefined ? (
              <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <p className="text-sm">Loading your scans…</p>
              </div>
            ) : visibleSkills.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <FileSearch className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {filter === "all" ? "No skills scanned yet" : "Nothing matches this filter"}
                </p>
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                  {filter === "all"
                    ? "Paste your first tool, MCP config, or prompt pack on the left and run a scan."
                    : "Try a different filter, or scan another skill."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {visibleSkills.map((skill, index) => (
                  <SkillListItem
                    key={skill._id}
                    skill={skill}
                    rank={index + 1}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
