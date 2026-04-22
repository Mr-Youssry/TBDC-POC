import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BellDot,
  BriefcaseBusiness,
  CalendarRange,
  Compass,
  Gauge,
  MapPinned,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Waypoints,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/guards";
import { StatusSelect } from "../pipeline/_components/status-select";
import { CopyActionButton } from "./_components/copy-action-button";
import type {
  ActivationBucket,
  BlockedCompany,
  ConvictionRow,
  FocusFilter,
  GuardrailRow,
  PlaybookMatch,
  Tone,
} from "./playbook-helpers";
import {
  filterMatches,
  formatCapitalLabel,
  getActivationBucket,
  getActivationPlan,
  getConvictionRows,
  getGuardrailRows,
  getPrioritySummary,
  getSelectedMatch,
  getTopTargets,
  isActivatedMatch,
  isWarmMatch,
  needsFollowUp,
  parseAskMillions,
  sortMatches,
} from "./playbook-helpers";

export const metadata: Metadata = { title: "Activation Playbook — TBDC POC" };
export const dynamic = "force-dynamic";

const SCORE_MAX = 16;

const FILTERS: Array<{ id: FocusFilter; label: string; icon: LucideIcon }> = [
  { id: "all", label: "Best moves", icon: Compass },
  { id: "ready", label: "Ready now", icon: Sparkles },
  { id: "warm", label: "Warm paths", icon: Waypoints },
  { id: "follow_up", label: "Needs follow-up", icon: BellDot },
];

type SearchParamsLike = {
  blocked?: string;
  filter?: string;
  match?: string;
};

type SnapshotItem = {
  capital: string;
  count: number;
  progress: string;
};

type Snapshot = {
  blocked: SnapshotItem;
  qualified: SnapshotItem;
  ready: SnapshotItem;
  waiting: SnapshotItem;
};

export default async function ActivationPlaybookPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsLike>;
}) {
  const params = await searchParams;
  const filter = parseFilter(params.filter);
  const [matches, blockedCompanies, editable] = await Promise.all([
    getMatches(),
    getBlockedCompanies(),
    isLoggedIn(),
  ]);
  const visibleMatches = filterMatches(matches, filter);
  const readyMatches = bucketMatches(visibleMatches, "ready");
  const qualifiedMatches = bucketMatches(visibleMatches, "qualified");
  const waitingMatches = bucketMatches(visibleMatches, "waiting");
  const priorityMatches = getQueueMatches(filter, visibleMatches);
  const selectedBlocked = getSelectedBlocked(blockedCompanies, params.blocked);
  const selectedMatch = selectedBlocked ? null : getSelectedMatch(visibleMatches, params.match);
  const heroMatch = selectedMatch ?? priorityMatches[0] ?? visibleMatches[0] ?? matches[0] ?? null;
  const snapshot = buildSnapshot(matches, blockedCompanies);

  return (
    <div className="app-page flex min-h-full flex-col gap-6">
      <ActivationCapsuleBar
        freshness={getFreshnessLabel(matches, blockedCompanies)}
        readyCount={snapshot.ready.count}
        visibleCount={visibleMatches.length}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.38fr)_360px]">
        <ActivationHero
          blockedCount={snapshot.blocked.count}
          filter={filter}
          followUpCount={matches.filter(needsFollowUp).length}
          warmCount={matches.filter(isWarmMatch).length}
        />
        <FocusCard match={heroMatch} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          copy="Immediate plays worth touching before end of day."
          icon={Sparkles}
          label="Today"
          tone="pink"
          value={`${snapshot.ready.count}`}
        />
        <MetricCard
          copy="Connection-backed conversations already credible enough to draft."
          icon={Waypoints}
          label="Warm intros"
          tone="green"
          value={`${matches.filter(isWarmMatch).length}`}
        />
        <MetricCard
          copy="Existing threads that need a timed push instead of more research."
          icon={BellDot}
          label="Follow-up"
          tone="amber"
          value={`${matches.filter(needsFollowUp).length}`}
        />
        <MetricCard
          copy="Founder-opt-out names that should move through customer proof."
          icon={AlertTriangle}
          label="Blocked"
          tone="dark"
          value={`${blockedCompanies.length}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <QueuePanel
            filter={filter}
            priorityMatches={priorityMatches}
            selectedId={selectedMatch?.id ?? null}
            visibleMatches={visibleMatches}
          />
          <LaneOverview
            filter={filter}
            qualified={qualifiedMatches}
            ready={readyMatches}
            snapshot={snapshot}
            waiting={waitingMatches}
          />
          <ReactivationPanel
            companies={blockedCompanies}
            filter={filter}
            selectedId={selectedBlocked?.id}
          />
          <ExecutionLoopPanel matches={matches} />
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          {selectedBlocked ? (
            <BlockedDetailRail company={selectedBlocked} />
          ) : selectedMatch ? (
            <MatchDetailRail editable={editable} match={selectedMatch} />
          ) : (
            <EmptyDetailRail filter={filter} />
          )}
        </div>
      </div>
    </div>
  );
}

async function getMatches(): Promise<PlaybookMatch[]> {
  return prisma.match.findMany({
    include: { company: true, investor: true },
    orderBy: [{ tier: "asc" }, { score: "desc" }],
  });
}

async function getBlockedCompanies(): Promise<BlockedCompany[]> {
  return prisma.company.findMany({
    where: { acceptsInvestorIntros: false },
    include: {
      customerTargets: { orderBy: { sortOrder: "asc" } },
      events: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

function ActivationCapsuleBar({
  freshness,
  readyCount,
  visibleCount,
}: {
  freshness: string;
  readyCount: number;
  visibleCount: number;
}) {
  return (
    <div className="app-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <TopbarPill icon={BriefcaseBusiness} label="Horizon 3 cohort" />
        <TopbarPill icon={Radar} label={`${visibleCount} live matches`} />
        <TopbarPill icon={Sparkles} label={`${readyCount} ready now`} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TopbarPill icon={CalendarRange} label={`Updated ${freshness}`} />
        <Link
          href="#queue"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#0f1422] px-4 text-[0.8rem] font-semibold text-white transition-transform hover:-translate-y-[1px]"
        >
          Open queue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function TopbarPill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-border bg-white/88 px-4 text-[0.8rem] font-semibold text-text-2">
      <Icon className="h-4 w-4 text-text-3" />
      {label}
    </span>
  );
}

function ActivationHero({
  blockedCount,
  filter,
  followUpCount,
  warmCount,
}: {
  blockedCount: number;
  filter: FocusFilter;
  followUpCount: number;
  warmCount: number;
}) {
  return (
    <section className="app-hero relative overflow-hidden">
      <div className="pointer-events-none absolute right-[-70px] top-[-50px] h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
      <Eyebrow icon={Radar} label="Activation OS" />
      <h1 className="mt-4 max-w-4xl text-[clamp(3rem,6vw,5.2rem)] font-extrabold leading-[0.94] tracking-[-0.06em] text-text-1">
        Move the right investor conversations this week.
      </h1>
      <p className="mt-4 max-w-3xl text-[0.98rem] leading-8 text-text-2">
        Queue-first workflow for warm intros, live follow-up, and milestone-based
        reactivation. The page leads with actions, not explanations.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map(({ id, icon: Icon, label }) => (
          <Link
            key={id}
            href={{ pathname: "/activation-playbook", query: id === "all" ? {} : { filter: id } }}
            className={[
              "inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-[0.8rem] font-semibold transition-colors",
              filter === id
                ? "border-primary/18 bg-accent text-accent-foreground"
                : "border-border bg-white/90 text-text-2 hover:border-primary/18 hover:text-text-1",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-[18px] border border-primary/12 bg-white/84 p-4 shadow-[0_18px_36px_rgba(17,19,26,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-primary">
              Scan by signal
            </div>
            <div className="mt-2 text-[0.95rem] font-semibold text-text-1">
              Less reading, more obvious moves.
            </div>
          </div>
          <div className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-4 text-[0.8rem] text-text-2">
            <Search className="h-4 w-4 text-primary" />
            Search-led filters built into the queue
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <HeroSignalPill
            icon={Waypoints}
            label="Warm path"
            tone="green"
            value={`${warmCount} connection-backed plays`}
          />
          <HeroSignalPill
            icon={BellDot}
            label="Follow-up"
            tone="amber"
            value={`${followUpCount} conversations need timed pressure`}
          />
          <HeroSignalPill
            icon={AlertTriangle}
            label="Blocked"
            tone="pink"
            value={`${blockedCount} companies require reactivation rules`}
          />
        </div>
      </div>
    </section>
  );
}

function HeroSignalPill({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "amber" | "green" | "pink";
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-white px-4 py-3">
      <span className={iconBadgeClass(tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-3">
          {label}
        </div>
        <div className="mt-1 truncate text-[0.88rem] font-semibold text-text-1">{value}</div>
      </div>
    </div>
  );
}

function FocusCard({ match }: { match: PlaybookMatch | null }) {
  if (!match) {
    return (
      <aside className="app-surface p-5">
        <Eyebrow icon={Target} label="Today's focus" />
        <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.04em] text-text-1">
          Queue is clear.
        </h2>
        <p className="mt-3 text-[0.9rem] leading-7 text-text-2">
          The current filter removed every live match. Clear it to bring the best
          plays back into focus.
        </p>
        <div className="mt-5">
          <ClearFilterLink />
        </div>
      </aside>
    );
  }

  const plan = getActivationPlan(match);
  return (
    <aside className="app-surface p-5">
      <Eyebrow icon={Target} label="Today's focus" />
      <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.05em] text-text-1">
        {match.company.name} {"->"} {match.investor.name}
      </h2>
      <p className="mt-3 text-[0.9rem] leading-7 text-text-2">
        {compactText(getPrioritySummary(match), 180)}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniFocusBox label="Stage" value={match.company.stage} />
        <MiniFocusBox label="Owner" value={plan.owner} />
        <MiniFocusBox label="Connector" value={plan.connector} />
        <MiniFocusBox label="Next touch" value={plan.urgency} />
      </div>

      <div className="mt-5 rounded-[18px] bg-[#0f1422] p-4 text-white shadow-[0_18px_36px_rgba(15,20,34,0.22)]">
        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/56">
          Frame
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <DarkTag>{compactText(match.company.sector, 26)}</DarkTag>
          <DarkTag>{compactText(match.company.homeMarket, 18)}</DarkTag>
          <DarkTag>{compactText(match.company.targetMarket, 18)}</DarkTag>
        </div>
        <p className="mt-3 text-[0.82rem] leading-6 text-white/74">
          {compactText(match.company.arrTraction, 130)}
        </p>
      </div>
    </aside>
  );
}

function MiniFocusBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-surface px-4 py-3">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-3">
        {label}
      </div>
      <div className="mt-1 text-[0.88rem] font-semibold text-text-1">{compactText(value, 34)}</div>
    </div>
  );
}

function DarkTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-[30px] items-center rounded-full border border-white/10 bg-white/8 px-3 text-[0.74rem] font-medium text-white/80">
      {children}
    </span>
  );
}

function MetricCard({
  copy,
  icon: Icon,
  label,
  tone,
  value,
}: {
  copy: string;
  icon: LucideIcon;
  label: string;
  tone: "amber" | "dark" | "green" | "pink";
  value: string;
}) {
  return (
    <article className="app-stat-card">
      <div className="flex items-center gap-3">
        <span className={iconBadgeClass(tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="app-stat-card__label">{label}</span>
      </div>
      <span className="app-stat-card__value">{value}</span>
      <span className="app-stat-card__copy">{copy}</span>
    </article>
  );
}

function QueuePanel({
  filter,
  priorityMatches,
  selectedId,
  visibleMatches,
}: {
  filter: FocusFilter;
  priorityMatches: PlaybookMatch[];
  selectedId: string | null;
  visibleMatches: PlaybookMatch[];
}) {
  return (
    <section id="queue" className="app-surface p-5">
      <SectionHeader
        copy="Short cards, obvious status, and one clear next move on each row."
        icon={ArrowUpRight}
        label="Action queue"
        title="Best moves for the next 48 hours"
      />

      <SmartFilterBar filter={filter} matches={visibleMatches} />

      <div className="mt-5 space-y-3">
        {priorityMatches.length > 0 ? (
          priorityMatches.map((match, index) => (
            <QueueCard
              key={match.id}
              filter={filter}
              index={index}
              match={match}
              selected={selectedId === match.id}
            />
          ))
        ) : (
          <SectionEmptyState
            detail={getPriorityEmptyCopy(filter)}
            title="Priority queue is clear"
          />
        )}
      </div>
    </section>
  );
}

function SmartFilterBar({
  filter,
  matches,
}: {
  filter: FocusFilter;
  matches: PlaybookMatch[];
}) {
  const stagePrimary = matches.filter((match) => /(seed|series)/i.test(match.company.stage)).length;
  const preSeed = matches.filter((match) => /pre-?seed/i.test(match.company.stage)).length;
  const warmCount = matches.filter(isWarmMatch).length;
  const waitingCount = matches.filter((match) => getActivationBucket(match) === "waiting").length;
  const activeCount = matches.filter(isActivatedMatch).length;
  const followUpCount = matches.filter(needsFollowUp).length;

  return (
    <div className="mt-5 rounded-[18px] border border-primary/12 bg-[#fff7fb] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-primary">
            Scan by signal
          </div>
          <h3 className="mt-2 text-[1rem] font-semibold tracking-[-0.03em] text-text-1">
            One filter bar, not a fourth column.
          </h3>
        </div>
        <span className="inline-flex min-h-[34px] items-center rounded-full border border-primary/12 bg-white px-3 text-[0.75rem] font-semibold text-accent-foreground">
          {matches.length} visible
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <FilterStatGroup
          title="Stage"
          items={[
            {
              active: filter === "ready",
              count: stagePrimary,
              icon: Sparkles,
              label: "Seed to Series A",
              tone: "pink",
            },
            {
              active: false,
              count: preSeed,
              icon: Compass,
              label: "Pre-seed only",
              tone: "green",
            },
          ]}
        />
        <FilterStatGroup
          title="Path"
          items={[
            {
              active: filter === "warm",
              count: warmCount,
              icon: Waypoints,
              label: "Warm intro live",
              tone: "green",
            },
            {
              active: false,
              count: waitingCount,
              icon: CalendarRange,
              label: "Milestone wait",
              tone: "amber",
            },
          ]}
        />
        <FilterStatGroup
          title="Saved views"
          items={[
            {
              active: filter === "all",
              count: matches.length,
              icon: Gauge,
              label: "Best moves",
              tone: "dark",
            },
            {
              active: filter === "follow_up",
              count: Math.max(activeCount, followUpCount),
              icon: BellDot,
              label: "Follow-up",
              tone: "pink",
            },
          ]}
        />
      </div>
    </div>
  );
}

function FilterStatGroup({
  items,
  title,
}: {
  items: Array<{
    active: boolean;
    count: number;
    icon: LucideIcon;
    label: string;
    tone: "amber" | "dark" | "green" | "pink";
  }>;
  title: string;
}) {
  return (
    <div className="space-y-2 rounded-[16px] border border-white/70 bg-white/76 p-3">
      <div className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-text-3">
        {title}
      </div>
      {items.map((item) => (
        <FilterStatItem key={item.label} {...item} />
      ))}
    </div>
  );
}

function FilterStatItem({
  active,
  count,
  icon: Icon,
  label,
  tone,
}: {
  active: boolean;
  count: number;
  icon: LucideIcon;
  label: string;
  tone: "amber" | "dark" | "green" | "pink";
}) {
  return (
    <div
      className={[
        "flex min-h-[46px] items-center justify-between gap-3 rounded-[12px] border px-3",
        active
          ? "border-primary/18 bg-accent text-accent-foreground"
          : "border-border bg-surface text-text-2",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={iconBadgeClass(tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-[0.82rem] font-semibold">{label}</span>
      </div>
      <span className="rounded-full border border-black/6 bg-white/70 px-2.5 py-1 text-[0.72rem] font-semibold text-text-3">
        {count}
      </span>
    </div>
  );
}

function QueueCard({
  filter,
  index,
  match,
  selected,
}: {
  filter: FocusFilter;
  index: number;
  match: PlaybookMatch;
  selected: boolean;
}) {
  const plan = getActivationPlan(match);
  const summary = compactText(getPrioritySummary(match), 140);
  const modeBadge = getModeBadge(plan.mode);

  return (
    <Link
      href={{ pathname: "/activation-playbook", query: buildQuery(filter, match.id) }}
      className={[
        "block rounded-[18px] border p-5 transition-all",
        selected
          ? "border-primary/18 bg-white shadow-[0_24px_60px_rgba(17,19,26,0.08)]"
          : "border-border bg-white/92 hover:-translate-y-[1px] hover:border-primary/16 hover:shadow-[0_20px_40px_rgba(17,19,26,0.06)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="flex items-start gap-4 xl:min-w-0 xl:flex-1">
          <CompanyMark name={match.company.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[1.08rem] font-semibold tracking-[-0.03em] text-text-1">
                {match.company.name} {"->"} {match.investor.name}
              </h3>
              {index === 0 ? <QueueBadge tone="pink">Best move</QueueBadge> : null}
              <QueueBadge tone={modeBadge.tone}>{modeBadge.label}</QueueBadge>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <FactPill icon={Sparkles} label="Stage" tone="pink" value={match.company.stage} />
              <FactPill
                icon={Waypoints}
                label="Path"
                tone="green"
                value={plan.mode === "warm" ? "Warm intro" : plan.mode === "monitor" ? "Milestone watch" : "Direct reach"}
              />
              <FactPill
                icon={Target}
                label="Angle"
                tone="dark"
                value={compactText(match.portfolioGap || match.company.sector, 26)}
              />
              <FactPill
                icon={ArrowUpRight}
                label="Next"
                tone="amber"
                value={compactText(plan.nextMove, 26)}
              />
            </div>

            <p className="mt-4 text-[0.86rem] leading-7 text-text-2">{summary}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 xl:w-[112px] xl:flex-col xl:items-end">
          <ScorePill value={`${match.score}/${SCORE_MAX}`} />
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[0.72rem] font-semibold text-text-3">
            {getScoreNote(match)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function FactPill({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "amber" | "dark" | "green" | "pink";
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-surface px-3 py-3">
      <span className={iconBadgeClass(tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-text-3">
          {label}
        </div>
        <div className="truncate text-[0.82rem] font-semibold text-text-1">{value}</div>
      </div>
    </div>
  );
}

function QueueBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "blue" | "green" | "pink";
}) {
  return (
    <span className={queueBadgeClass(tone)}>
      {children}
    </span>
  );
}

function ScorePill({ value }: { value: string }) {
  return (
    <span className="inline-flex min-h-[42px] items-center rounded-full bg-[#0f1422] px-4 text-[0.82rem] font-semibold text-white shadow-[0_18px_36px_rgba(15,20,34,0.16)]">
      {value}
    </span>
  );
}

function LaneOverview({
  filter,
  qualified,
  ready,
  snapshot,
  waiting,
}: {
  filter: FocusFilter;
  qualified: PlaybookMatch[];
  ready: PlaybookMatch[];
  snapshot: Snapshot;
  waiting: PlaybookMatch[];
}) {
  return (
    <section className="app-surface p-5">
      <SectionHeader
        copy="Not every match needs the full card treatment. Keep the rest of the board in compact lanes."
        icon={Compass}
        label="Activation lanes"
        title="Keep the board legible"
      />
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <LaneCard
          accent="ready"
          filter={filter}
          label="Ready now"
          matches={ready}
          snapshot={snapshot.ready}
        />
        <LaneCard
          accent="qualified"
          filter={filter}
          label="Qualified next"
          matches={qualified}
          snapshot={snapshot.qualified}
        />
        <LaneCard
          accent="waiting"
          filter={filter}
          label="Milestone watch"
          matches={waiting}
          snapshot={snapshot.waiting}
        />
      </div>
    </section>
  );
}

function LaneCard({
  accent,
  filter,
  label,
  matches,
  snapshot,
}: {
  accent: ActivationBucket;
  filter: FocusFilter;
  label: string;
  matches: PlaybookMatch[];
  snapshot: SnapshotItem;
}) {
  return (
    <article className={laneCardClass(accent)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] opacity-70">
            {label}
          </div>
          <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em]">
            {snapshot.count}
          </div>
        </div>
        <span className="rounded-full border border-current/12 bg-white/50 px-3 py-1 text-[0.72rem] font-semibold opacity-70">
          {snapshot.progress}
        </span>
      </div>
      <div className="mt-3 text-[0.78rem] leading-6 opacity-80">{snapshot.capital}</div>
      <div className="mt-4 space-y-2">
        {matches.slice(0, 3).map((match) => (
          <LaneLink key={match.id} filter={filter} match={match} />
        ))}
        {matches.length === 0 ? (
          <div className="rounded-[12px] border border-current/12 bg-white/55 px-3 py-3 text-[0.78rem] opacity-75">
            Nothing active in this lane right now.
          </div>
        ) : null}
      </div>
    </article>
  );
}

function LaneLink({
  filter,
  match,
}: {
  filter: FocusFilter;
  match: PlaybookMatch;
}) {
  return (
    <Link
      href={{ pathname: "/activation-playbook", query: buildQuery(filter, match.id) }}
      className="flex items-center justify-between gap-3 rounded-[12px] border border-current/12 bg-white/65 px-3 py-3 transition-transform hover:translate-x-[1px]"
    >
      <div className="min-w-0">
        <div className="truncate text-[0.84rem] font-semibold">{match.company.name}</div>
        <div className="truncate text-[0.74rem] opacity-70">{compactText(match.investor.name, 26)}</div>
      </div>
      <span className="text-[0.74rem] font-semibold opacity-70">{match.score}/{SCORE_MAX}</span>
    </Link>
  );
}

function ReactivationPanel({
  companies,
  filter,
  selectedId,
}: {
  companies: BlockedCompany[];
  filter: FocusFilter;
  selectedId?: string;
}) {
  return (
    <section className="app-surface p-5">
      <SectionHeader
        copy="If intros are off the table, route effort into customer proof and clear reactivation triggers."
        icon={AlertTriangle}
        label="Reactivation path"
        title="Blocked names stay visible without stealing the whole canvas"
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {companies.length > 0 ? (
          companies.map((company) => (
            <Link
              key={company.id}
              href={{ pathname: "/activation-playbook", query: buildQuery(filter, undefined, company.id) }}
              className={[
                "block rounded-[18px] border p-4 transition-all",
                selectedId === company.id
                  ? "border-[#f0b88e] bg-[#fff5ed]"
                  : "border-[#f4d8c0] bg-[#fffaf6] hover:-translate-y-[1px] hover:shadow-[0_20px_40px_rgba(99,57,26,0.06)]",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <CompanyMark name={company.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[1rem] font-semibold tracking-[-0.03em] text-text-1">
                      {company.name}
                    </h3>
                    <QueueBadge tone="amber">Founder opt-out</QueueBadge>
                  </div>
                  <p className="mt-3 text-[0.82rem] leading-6 text-text-2">
                    {compactText(company.gateNote || "Investor intros are off the table for now.", 120)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getTopTargets(company)
                      .slice(0, 2)
                      .map((target) => (
                        <span
                          key={target.id}
                          className="inline-flex min-h-[30px] items-center rounded-full border border-[#f0d2bb] bg-white/80 px-3 text-[0.72rem] font-semibold text-[#8a5a36]"
                        >
                          {compactText(target.name, 28)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <SectionEmptyState
            detail="No companies are currently blocked from investor introductions."
            title="Reactivation watchlist is empty"
          />
        )}
      </div>
    </section>
  );
}

function ExecutionLoopPanel({
  matches,
}: {
  matches: PlaybookMatch[];
}) {
  const pending = matches.filter(needsFollowUp).length;
  const active = matches.filter(isActivatedMatch).length;
  const meetings = matches.filter((match) => match.pipelineStatus === "meeting_set").length;
  const waiting = matches.filter((match) => getActivationBucket(match) === "waiting").length;

  return (
    <section className="app-surface p-5">
      <SectionHeader
        copy="Compact counters keep the live motion visible without turning the page into a dashboard wall."
        icon={Gauge}
        label="Execution loop"
        title="Keep the operating rhythm visible"
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <LoopCard icon={ArrowUpRight} label="Activated" value={`${active}`} />
        <LoopCard icon={BellDot} label="Waiting reply" value={`${pending}`} />
        <LoopCard icon={CalendarRange} label="Meetings set" value={`${meetings}`} />
        <LoopCard icon={AlertTriangle} label="Reactivation watch" value={`${waiting}`} />
      </div>
    </section>
  );
}

function LoopCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface px-4 py-4">
      <div className="flex items-center gap-3">
        <span className={iconBadgeClass("dark")}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-text-3">
          {label}
        </span>
      </div>
      <div className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-text-1">{value}</div>
    </div>
  );
}

function MatchDetailRail({
  editable,
  match,
}: {
  editable: boolean;
  match: PlaybookMatch;
}) {
  const plan = getActivationPlan(match);
  const draftText = `${plan.subject}\n\n${plan.draft}`;
  const convictionRows = getConvictionRows(match).slice(0, 3);
  const guardrailRows = getGuardrailRows(match).slice(0, 3);

  return (
    <aside className="space-y-4">
      <div className="app-surface p-5">
        <Eyebrow icon={Target} label="Selected play" />
        <div className="mt-4 flex items-start gap-4">
          <CompanyMark name={match.company.name} size="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-text-1">
                {match.company.name} {"->"} {match.investor.name}
              </h2>
              <ScorePill value={`${match.score}/${SCORE_MAX}`} />
            </div>
            <p className="mt-3 text-[0.84rem] leading-6 text-text-2">
              {compactText(getPrioritySummary(match), 150)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailMetric
            icon={Gauge}
            label="Conviction"
            value={`${Math.round((match.score / SCORE_MAX) * 100)}%`}
          />
          <DetailMetric
            icon={Waypoints}
            label="Path"
            value={plan.mode === "warm" ? "Warm intro" : plan.mode === "monitor" ? "Monitor" : "Direct"}
          />
          <DetailMetric icon={MapPinned} label="Geography" value={compactText(match.company.homeMarket, 24)} />
          <DetailMetric icon={Users} label="Owner" value={compactText(plan.owner, 24)} />
        </div>

        <div className="mt-5 rounded-[18px] bg-[#0f1422] p-4 text-white shadow-[0_18px_36px_rgba(15,20,34,0.18)]">
          <div className="text-[1rem] font-semibold">{match.company.name}</div>
          <p className="mt-2 text-[0.82rem] leading-6 text-white/74">
            {compactText(match.company.arrTraction, 120)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <DarkTag>{compactText(match.company.sector, 24)}</DarkTag>
            <DarkTag>{compactText(match.company.stage, 18)}</DarkTag>
            <DarkTag>{compactText(match.company.targetMarket, 18)}</DarkTag>
          </div>
        </div>
      </div>

      <div className="app-surface p-5">
        <SectionHeader
          copy="Why this works, compressed into the three strongest reasons."
          icon={Sparkles}
          label="Why it works"
          title="Conviction in scan mode"
        />
        <div className="mt-4 space-y-3">
          {convictionRows.map((row) => (
            <RailSignalItem key={row.label} row={row} />
          ))}
        </div>
      </div>

      <div className="app-surface p-5">
        <SectionHeader
          copy="Three deliberate steps, not a long playbook wall."
          icon={ArrowUpRight}
          label="Next sequence"
          title="What to do next"
        />
        <div className="mt-4 space-y-3">
          <NextStepItem icon={ArrowUpRight} title={plan.nextMove} tone="pink" />
          <NextStepItem icon={CalendarRange} title={plan.reminder} tone="green" />
          <NextStepItem icon={Waypoints} title={plan.signal} tone="dark" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyActionButton idleLabel={plan.cta} text={draftText} />
          <StatusSelect
            currentStatus={match.pipelineStatus}
            disabled={!editable}
            matchId={match.id}
          />
        </div>
      </div>

      <div className="app-surface p-5">
        <SectionHeader
          copy="Keep the introduction credible and inside founder preference."
          icon={ShieldCheck}
          label="Guardrails"
          title="What could break the intro"
        />
        <div className="mt-4 space-y-3">
          {guardrailRows.map((row) => (
            <RailSignalItem key={row.label} row={row} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function BlockedDetailRail({ company }: { company: BlockedCompany }) {
  const targets = getTopTargets(company);
  const draft = buildBlockedDraft(company, targets[0]?.name ?? "priority customer target");

  return (
    <aside className="space-y-4">
      <div className="rounded-[18px] border border-[#f0d2bb] bg-[#fff7f0] p-5 shadow-[0_18px_40px_rgba(99,57,26,0.06)]">
        <Eyebrow icon={AlertTriangle} label="Blocked opportunity" />
        <div className="mt-4 flex items-start gap-4">
          <CompanyMark name={company.name} size="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[1.2rem] font-semibold tracking-[-0.04em] text-text-1">
                {company.name}
              </h2>
              <QueueBadge tone="amber">Founder opt-out</QueueBadge>
            </div>
            <p className="mt-3 text-[0.84rem] leading-6 text-text-2">
              {compactText(company.gateNote || "Investor introductions are paused.", 160)}
            </p>
          </div>
        </div>
      </div>

      <div className="app-surface p-5">
        <SectionHeader
          copy="The next move is commercial proof, not outbound investor motion."
          icon={Target}
          label="Reactivation path"
          title="Customer targets"
        />
        <div className="mt-4 space-y-3">
          {targets.map((target) => (
            <div key={target.id} className="rounded-[14px] border border-border bg-surface px-4 py-3">
              <div className="text-[0.86rem] font-semibold text-text-1">{target.name}</div>
              <div className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-text-3">
                {target.targetType} · {target.hq}
              </div>
              <p className="mt-2 text-[0.8rem] leading-6 text-text-2">
                {compactText(target.description, 120)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="app-surface p-5">
        <SectionHeader
          copy="Copy the brief, then wait for the reactivation trigger."
          icon={ArrowUpRight}
          label="Next sequence"
          title="Customer activation"
        />
        <div className="mt-4 space-y-3">
          <NextStepItem
            icon={Target}
            title={`Start with ${targets[0]?.name ?? "the top customer target"}`}
            tone="pink"
          />
          <NextStepItem
            icon={CalendarRange}
            title={company.events[0]?.name ?? "Define the next external milestone"}
            tone="green"
          />
          <NextStepItem
            icon={ShieldCheck}
            title="Keep investor outreach paused until founder preference changes."
            tone="dark"
          />
        </div>
        <div className="mt-4">
          <CopyActionButton idleLabel="Copy customer brief" text={draft} />
        </div>
      </div>
    </aside>
  );
}

function EmptyDetailRail({ filter }: { filter: FocusFilter }) {
  return (
    <aside className="app-surface p-5">
      <Eyebrow icon={Target} label="Selected play" />
      <h2 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.04em] text-text-1">
        Nothing is selected yet.
      </h2>
      <p className="mt-3 text-[0.84rem] leading-6 text-text-2">
        {getDetailEmptyCopy(filter)}
      </p>
      {filter !== "all" ? (
        <div className="mt-5">
          <ClearFilterLink />
        </div>
      ) : null}
    </aside>
  );
}

function SectionHeader({
  copy,
  icon: Icon,
  label,
  title,
}: {
  copy: string;
  icon: LucideIcon;
  label: string;
  title: string;
}) {
  return (
    <div>
      <Eyebrow icon={Icon} label={label} />
      <h2 className="mt-3 text-[1.45rem] font-semibold leading-tight tracking-[-0.04em] text-text-1">
        {title}
      </h2>
      <p className="mt-2 text-[0.84rem] leading-6 text-text-2">{copy}</p>
    </div>
  );
}

function Eyebrow({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="inline-flex min-h-[26px] items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function DetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-3">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-[0.88rem] font-semibold text-text-1">{value}</div>
    </div>
  );
}

function RailSignalItem({
  row,
}: {
  row: ConvictionRow | GuardrailRow;
}) {
  const theme = toneTheme(row.tone);

  return (
    <div className="rounded-[14px] border border-border bg-surface px-4 py-3">
      <div className="flex items-start gap-3">
        <span className={theme.badgeClass}>
          <theme.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-text-2">
            {row.label}
          </div>
          <p className="mt-2 text-[0.8rem] leading-6 text-text-2">
            {compactText(row.text, 120)}
          </p>
        </div>
      </div>
    </div>
  );
}

function NextStepItem({
  icon: Icon,
  title,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  tone: "amber" | "dark" | "green" | "pink";
}) {
  return (
    <div className="flex min-h-[54px] items-center gap-3 rounded-[14px] border border-border bg-surface px-4">
      <span className={iconBadgeClass(tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[0.84rem] font-semibold text-text-1">{compactText(title, 88)}</span>
    </div>
  );
}

function SectionEmptyState({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-surface px-4 py-4 shadow-[0_12px_28px_rgba(17,19,26,0.04)]">
      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-text-3">
        {title}
      </div>
      <p className="mt-2 text-[0.82rem] leading-6 text-text-2">{detail}</p>
    </div>
  );
}

function ClearFilterLink() {
  return (
    <Link
      href="/activation-playbook"
      className="inline-flex min-h-[40px] items-center rounded-full border border-border bg-white px-4 text-[0.8rem] font-semibold text-text-2 transition-colors hover:border-primary/18 hover:text-text-1"
    >
      Clear filter
    </Link>
  );
}

function CompanyMark({
  name,
  size = "lg",
}: {
  name: string;
  size?: "lg" | "sm";
}) {
  const theme = getCompanyTheme(name);
  const dimension = size === "sm" ? "h-12 w-12 rounded-[14px]" : "h-14 w-14 rounded-[16px]";

  return (
    <div
      className={[
        "relative flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_18px_36px_rgba(15,20,34,0.18)]",
        dimension,
      ].join(" ")}
      style={{ background: theme.background }}
    >
      <svg viewBox="0 0 48 48" className={size === "sm" ? "h-8 w-8" : "h-9 w-9"} fill="none">
        {renderCompanyGlyph(theme)}
      </svg>
    </div>
  );
}

type CompanyTheme = {
  background: string;
  primary: string;
  secondary: string;
  variant: "arrow" | "bolt" | "grid" | "orbit" | "ripple";
};

function buildBlockedDraft(company: BlockedCompany, targetName: string): string {
  return [
    `Customer access brief — ${company.name}`,
    ``,
    `${company.name} has opted out of investor introductions.`,
    `Redirect the motion toward customer activation, starting with ${targetName}.`,
    `Company profile: ${company.stage} | ${company.sector} | ${company.arrTraction}.`,
    `Commercial ask: ${company.askSize}.`,
    `Reactivation rule: keep investor outreach off unless the founder changes the opt-out preference explicitly.`,
  ].join("\n");
}

function bucketMatches(matches: PlaybookMatch[], bucket: ActivationBucket) {
  return sortMatches(matches.filter((match) => getActivationBucket(match) === bucket));
}

function buildQuery(filter: FocusFilter, matchId?: string, blockedId?: string) {
  return {
    ...(filter !== "all" ? { filter } : {}),
    ...(matchId ? { match: matchId } : {}),
    ...(blockedId ? { blocked: blockedId } : {}),
  };
}

function buildSnapshot(matches: PlaybookMatch[], blockedCompanies: BlockedCompany[]): Snapshot {
  return {
    ready: buildSnapshotItem(bucketMatches(matches, "ready")),
    qualified: buildSnapshotItem(bucketMatches(matches, "qualified")),
    waiting: buildSnapshotItem(bucketMatches(matches, "waiting")),
    blocked: {
      capital: blockedCapitalLabel(blockedCompanies),
      count: blockedCompanies.length,
      progress: blockedCompanies.length > 0 ? "Customer route only" : "None blocked",
    },
  };
}

function buildSnapshotItem(matches: PlaybookMatch[]): SnapshotItem {
  return {
    capital: capitalLabelForMatches(matches),
    count: matches.length,
    progress: progressLabel(matches),
  };
}

function blockedCapitalLabel(companies: BlockedCompany[]): string {
  if (companies.length === 0) return "No blocked capital";
  return companies.map((company) => company.askSize).join(" · ");
}

function capitalLabelForMatches(matches: PlaybookMatch[]) {
  const totals = new Map<string, number>();
  for (const match of matches) {
    const amount = parseAskMillions(match.company.askSize);
    if (amount !== null) totals.set(match.company.id, amount);
  }
  const known = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (totals.size === 0) return "Undisclosed";
  return `${formatCapitalLabel(known)} across ${totals.size} companies`;
}

function compactText(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function getCompanyTheme(name: string): CompanyTheme {
  const value = name.toLowerCase();
  if (/(volt|charge|grid|power|energy)/i.test(value)) {
    return {
      background: "linear-gradient(135deg, #10151f 0%, #182033 100%)",
      primary: "#ff4f8d",
      secondary: "#22c784",
      variant: "bolt",
    };
  }
  if (/(carbon|climate|upcycl|terra)/i.test(value)) {
    return {
      background: "linear-gradient(135deg, #10161f 0%, #1a2430 100%)",
      primary: "#ff4f8d",
      secondary: "#8df2ca",
      variant: "orbit",
    };
  }
  if (/(ai|data|base|analytic)/i.test(value)) {
    return {
      background: "linear-gradient(135deg, #111521 0%, #171f2e 100%)",
      primary: "#79b3ff",
      secondary: "#c7d8ff",
      variant: "grid",
    };
  }
  if (/(buy|market|commerce|retail)/i.test(value)) {
    return {
      background: "linear-gradient(135deg, #12151e 0%, #1d2330 100%)",
      primary: "#ffbf70",
      secondary: "#fff1d9",
      variant: "arrow",
    };
  }
  return {
    background: "linear-gradient(135deg, #10131c 0%, #171d2a 100%)",
    primary: "#ff4f8d",
    secondary: "#9dd2ff",
    variant: "ripple",
  };
}

function renderCompanyGlyph(theme: CompanyTheme) {
  if (theme.variant === "bolt") {
    return (
      <>
        <circle cx="24" cy="24" r="15" stroke={theme.secondary} strokeWidth="3" opacity="0.65" />
        <path d="M26 10L18 25h7l-2 13 11-16h-7l1-12z" fill={theme.primary} />
      </>
    );
  }
  if (theme.variant === "orbit") {
    return (
      <>
        <circle cx="17" cy="24" r="6.5" stroke={theme.secondary} strokeWidth="2.6" />
        <circle cx="31" cy="16" r="5.5" stroke={theme.primary} strokeWidth="2.6" />
        <circle cx="31" cy="32" r="5.5" stroke="#ffffff" strokeWidth="2.6" opacity="0.8" />
      </>
    );
  }
  if (theme.variant === "grid") {
    return (
      <>
        <rect x="11" y="11" width="10" height="10" rx="3" stroke={theme.secondary} strokeWidth="2.6" />
        <rect x="27" y="11" width="10" height="10" rx="3" fill={theme.primary} opacity="0.9" />
        <rect x="11" y="27" width="10" height="10" rx="3" fill="#ffffff" opacity="0.85" />
        <rect x="27" y="27" width="10" height="10" rx="3" stroke={theme.secondary} strokeWidth="2.6" />
      </>
    );
  }
  if (theme.variant === "arrow") {
    return (
      <>
        <path d="M13 33l22-18" stroke={theme.secondary} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M22 13h13v13" stroke={theme.primary} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="32" r="4.2" fill="#ffffff" opacity="0.86" />
      </>
    );
  }
  return (
    <>
      <circle cx="24" cy="24" r="16" stroke={theme.secondary} strokeWidth="3" opacity="0.6" />
      <circle cx="24" cy="24" r="8" fill={theme.primary} opacity="0.92" />
      <path d="M10 24h8" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M30 24h8" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
    </>
  );
}

function getDetailEmptyCopy(filter: FocusFilter) {
  if (filter === "ready") return "No ready-now plays are visible right now.";
  if (filter === "warm") return "No warm-path matches are visible right now.";
  if (filter === "follow_up") return "No follow-up plays are visible right now.";
  return "Select a play from the queue to open the compact operating brief.";
}

function getFreshnessLabel(matches: PlaybookMatch[], blockedCompanies: BlockedCompany[]) {
  const dates = [
    ...matches.map((match) => match.updatedAt.getTime()),
    ...blockedCompanies.map((company) => company.updatedAt.getTime()),
  ];
  const latest = Math.max(...dates);
  const days = Math.max(0, Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function getModeBadge(mode: string) {
  if (mode === "warm") return { label: "Warm intro", tone: "green" as const };
  if (mode === "monitor") return { label: "Milestone wait", tone: "amber" as const };
  return { label: "Direct reach", tone: "blue" as const };
}

function getPriorityEmptyCopy(filter: FocusFilter) {
  if (filter === "all") return "No matches are available for prioritization yet.";
  return "The current filter leaves the priority queue empty.";
}

function getQueueMatches(filter: FocusFilter, visibleMatches: PlaybookMatch[]) {
  const ranked = sortMatches(visibleMatches);
  if (filter === "all") return ranked.slice(0, 6);
  return ranked.slice(0, 8);
}

function getScoreNote(match: PlaybookMatch) {
  const bucket = getActivationBucket(match);
  if (bucket === "ready") return "Move now";
  if (bucket === "qualified") return "Second wave";
  return "Watch";
}

function getSelectedBlocked(companies: BlockedCompany[], id?: string) {
  return companies.find((company) => company.id === id) ?? null;
}

function iconBadgeClass(tone: "amber" | "dark" | "green" | "pink") {
  if (tone === "pink") return "inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground";
  if (tone === "green") return "inline-flex h-8 w-8 items-center justify-center rounded-full bg-t1-bg text-t1-txt";
  if (tone === "amber") return "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3df] text-[#a76708]";
  return "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#101523] text-white";
}

function laneCardClass(accent: ActivationBucket) {
  if (accent === "ready") return "rounded-[18px] border border-t1-bdr bg-t1-bg p-5 text-t1-txt";
  if (accent === "qualified") return "rounded-[18px] border border-[var(--blue)] bg-[var(--bluebg)] p-5 text-[var(--blue)]";
  return "rounded-[18px] border border-border bg-surface p-5 text-text-2";
}

function parseFilter(value?: string): FocusFilter {
  return FILTERS.find((item) => item.id === value)?.id ?? "all";
}

function progressLabel(matches: PlaybookMatch[]) {
  if (matches.length === 0) return "No active matches";
  const activated = matches.filter(isActivatedMatch).length;
  return `${activated}/${matches.length} activated`;
}

function queueBadgeClass(tone: "amber" | "blue" | "green" | "pink") {
  if (tone === "pink") return "inline-flex min-h-[28px] items-center rounded-full border border-primary/14 bg-accent px-3 text-[0.72rem] font-semibold text-accent-foreground";
  if (tone === "green") return "inline-flex min-h-[28px] items-center rounded-full border border-t1-bdr bg-t1-bg px-3 text-[0.72rem] font-semibold text-t1-txt";
  if (tone === "amber") return "inline-flex min-h-[28px] items-center rounded-full border border-[#f3d8b2] bg-[#fff2dd] px-3 text-[0.72rem] font-semibold text-[#9a6509]";
  return "inline-flex min-h-[28px] items-center rounded-full border border-[var(--blue)] bg-[var(--bluebg)] px-3 text-[0.72rem] font-semibold text-[var(--blue)]";
}

function toneTheme(tone: Tone) {
  if (tone === "strong") {
    return { badgeClass: iconBadgeClass("green"), icon: Sparkles };
  }
  if (tone === "support") {
    return { badgeClass: iconBadgeClass("pink"), icon: Target };
  }
  if (tone === "watch") {
    return { badgeClass: iconBadgeClass("amber"), icon: AlertTriangle };
  }
  return { badgeClass: iconBadgeClass("dark"), icon: ShieldCheck };
}
