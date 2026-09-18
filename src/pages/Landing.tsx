import { motion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  Eye,
  EyeOff,
  FileSearch,
  ScanLine,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.svg";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const DETECTION_RULES = [
  {
    icon: Braces,
    title: "Obfuscated payloads",
    detail:
      "Base64 and hex blobs piped into shells — the classic way to smuggle a second stage past human review.",
  },
  {
    icon: EyeOff,
    title: "Instruction hijacking",
    detail:
      "\"Ignore previous instructions\" and silent overrides that turn an agent against its user mid-task.",
  },
  {
    icon: Eye,
    title: "Quiet exfiltration",
    detail:
      "curl-to-server posts, env harvesting, and credential sweeps that ship your data out without a trace.",
  },
  {
    icon: Terminal,
    title: "Hidden tooling",
    detail:
      "Shadow MCP servers, wildcard tool grants, and auto-approve flags that expose tools you never agreed to.",
  },
  {
    icon: FileSearch,
    title: "Persistence tricks",
    detail:
      "Cron entries, shell-profile edits, and launch agents that let a skill survive the session it was born in.",
  },
  {
    icon: ShieldCheck,
    title: "Privilege grabs",
    detail:
      "sudo calls, setuid bits, and container escapes a helper skill should never need.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Paste a skill",
    detail:
      "Drop in a tool definition, MCP config, prompt pack, or extension manifest — any text that reaches your agent.",
  },
  {
    step: "02",
    title: "Run the scan",
    detail:
      "Aegis applies a ruleset built for agent abuse patterns: obfuscation, injection, exfil, persistence, escalation.",
  },
  {
    step: "03",
    title: "Read the verdict",
    detail:
      "A 0–100 risk score with cited evidence — every finding quotes the exact line that triggered it.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Aegis Scanner logo" className="size-7 rounded-md" />
            <span className="text-[15px] font-semibold tracking-tight">Aegis Scanner</span>
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex text-[11px]">
              v1
            </Badge>
          </a>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <a href="/auth">Sign in</a>
            </Button>
            <Button asChild>
              <a href="/auth">
                Start scanning
                <ArrowRight className="ml-1.5 size-4" />
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-aurora">
        <div className="absolute inset-0 bg-grid-lines [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-6 gap-1.5 border-brand-200 bg-card/70 px-3 py-1 text-[13px] text-brand-700 dark:border-brand-800 dark:text-brand-300">
              <ScanLine className="size-3.5" />
              Static risk analysis for agent skills
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Every skill your agent runs
              <br />
              <span className="text-gradient-brand">should earn your trust first.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Skills and MCP tools can hide malicious movements — obfuscated commands,
              instruction hijacks, quiet exfiltration. Aegis Scanner reads the definition
              before your agent ever does, and scores it 0–100.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-7 text-[15px] shadow-card-lg">
                <a href="/auth">
                  Scan your first skill
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-7 text-[15px] bg-card/70">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free · runs locally on Convex · no skill ever leaves your workspace
            </p>
          </motion.div>

          {/* Hero mock — risk score list preview */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="mx-auto mt-16 max-w-3xl"
          >
            <Card className="overflow-hidden border-border/70 bg-card/90 shadow-card-lg backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ScanLine className="size-4 text-brand-500" />
                  Scan results
                </div>
                <span className="text-xs text-muted-foreground">3 skills analyzed</span>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { name: "deploy-helper", score: 92, label: "Critical", cls: "text-red-600 bg-red-500/10", bar: "bg-red-500" },
                  { name: "repo-summarizer", score: 34, label: "Medium", cls: "text-amber-600 bg-amber-500/10", bar: "bg-amber-500" },
                  { name: "markdown-lint", score: 0, label: "Clean", cls: "text-emerald-600 bg-emerald-500/10", bar: "bg-emerald-500" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[13px] font-medium">{r.name}</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${Math.max(r.score, 4)}%` }} />
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.cls}`}>{r.label}</span>
                    <span className="w-10 text-right font-mono text-sm font-semibold tabular-nums">{r.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three steps, no agent required</h2>
            <p className="mt-4 text-muted-foreground">
              The scanner reads text, not behavior. Nothing executes — the riskiest skill in the world can't hurt you here.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <motion.div key={s.step} {...fadeUp}>
                <Card className="h-full border-border/70 shadow-card transition-shadow hover:shadow-card-lg">
                  <CardContent className="p-6">
                    <span className="font-mono text-sm font-semibold text-brand-500">{s.step}</span>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.detail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detection rules */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for the movements that matter
          </h2>
          <p className="mt-4 text-muted-foreground">
            Version 1 focuses on one job: reading a list of skills and telling you which ones to keep.
          </p>
        </motion.div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DETECTION_RULES.map((r) => (
            <motion.div key={r.title} {...fadeUp}>
              <Card className="h-full border-border/70 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg">
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    <r.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{r.detail}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card px-8 py-14 text-center shadow-card-lg"
          >
            <div className="absolute inset-0 bg-hero-aurora opacity-60" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Read the skill before it reads you.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Paste a skill, get a score, decide with evidence. That's the whole product — and that's the point.
              </p>
              <Button size="lg" asChild className="mt-8 h-12 px-7 text-[15px]">
                <a href="/auth">
                  Start scanning — it's free
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="size-5 rounded" />
            <span>Aegis Scanner</span>
          </div>
          <span>Static analysis only — findings are signals, not verdicts. Always review by hand.</span>
        </div>
      </footer>
    </div>
  );
}
