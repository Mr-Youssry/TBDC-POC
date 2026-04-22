import type {
  Company,
  CustomerTarget,
  IndustryEvent,
  Investor,
  Match,
} from "@prisma/client";

export type PlaybookMatch = Match & {
  company: Company;
  investor: Investor;
};

export type BlockedCompany = Company & {
  customerTargets: CustomerTarget[];
  events: IndustryEvent[];
};

export type ActivationBucket = "ready" | "qualified" | "waiting";
export type FocusFilter = "all" | "ready" | "warm" | "follow_up";
export type ActionMode = "warm" | "cold" | "monitor";
export type Tone = "strong" | "support" | "watch" | "block";

export type ConvictionRow = {
  label: string;
  tone: Tone;
  text: string;
  signal?: string;
};

export type GuardrailRow = {
  label: string;
  tone: Tone;
  text: string;
};

export type ScoreRow = {
  label: string;
  value: number;
  max: number;
};

export type ActivationPlan = {
  cta: string;
  connector: string;
  draft: string;
  mode: ActionMode;
  nextMove: string;
  owner: string;
  reminder: string;
  signal: string;
  subject: string;
  successRate: string;
  urgency: string;
};

const WAIT_PATTERNS = [
  /\bhold\b/i,
  /\bafter\b/i,
  /\buntil\b/i,
  /\bonce\b/i,
  /\bwhen\b/i,
  /\bwait\b/i,
  /not actively raising/i,
  /post-launch/i,
];

const ACTIVE_STATUSES = new Set([
  "outreach_sent",
  "meeting_set",
  "follow_up",
  "closed_won",
  "closed_pass",
]);

const FOLLOW_UP_STATUSES = new Set(["outreach_sent", "follow_up"]);

export function extractContactName(input: string): string {
  const primary = input.split("—")[0]?.trim() ?? input.trim();
  return primary.split("(")[0]?.trim() || "Investor team";
}

export function filterMatches(
  matches: PlaybookMatch[],
  filter: FocusFilter,
): PlaybookMatch[] {
  if (filter === "ready") return matches.filter((match) => getActivationBucket(match) === "ready");
  if (filter === "warm") return matches.filter(isWarmMatch);
  if (filter === "follow_up") return matches.filter(needsFollowUp);
  return matches;
}

export function formatCapitalLabel(value: number | null): string {
  if (value === null) return "Undisclosed";
  if (value < 1) return `$${(value * 1000).toFixed(0)}K`;
  if (value % 1 === 0) return `$${value.toFixed(0)}M`;
  return `$${value.toFixed(1)}M`;
}

export function getActivationBucket(match: PlaybookMatch): ActivationBucket {
  if (match.tier === 1) return "ready";
  return isWaitingMatch(match) ? "waiting" : "qualified";
}

export function getActivationPlan(match: PlaybookMatch): ActivationPlan {
  const mode = getActionMode(match);
  return {
    cta: getPrimaryCta(mode),
    connector: getConnectorLabel(match, mode),
    draft: getDraftBody(match, mode),
    mode,
    nextMove: match.nextStep,
    owner: mode === "warm" ? "Partnerships Manager + connector" : "Partnerships Manager",
    reminder: getReminderText(match),
    signal: getRecentSignal(match),
    subject: getDraftSubject(match, mode),
    successRate: getSuccessRate(mode),
    urgency: getUrgencyLabel(match, mode),
  };
}

export function getActionMode(match: PlaybookMatch): ActionMode {
  if (isWaitingMatch(match)) return "monitor";
  return isWarmMatch(match) ? "warm" : "cold";
}

export function getConvictionRows(match: PlaybookMatch): ConvictionRow[] {
  return [
    buildStageRow(match),
    buildThesisRow(match),
    buildGeographyRow(match),
    buildChequeRow(match),
    buildTractionRow(match),
    buildFounderRow(match),
    buildGapRow(match),
  ];
}

export function getDetailedScoreRows(match: PlaybookMatch): ScoreRow[] {
  return [
    { label: "Geography", value: match.geoPts, max: 3 },
    { label: "Stage Fit", value: match.stagePts, max: 3 },
    { label: "Sector & Thesis", value: match.sectorPts, max: 3 },
    { label: "Traction", value: match.revenuePts, max: 2 },
    { label: "Cheque Size", value: match.chequePts, max: 2 },
    { label: "Founder Fit", value: match.founderPts, max: 2 },
    { label: "Portfolio Gap", value: match.gapPts, max: 1 },
  ];
}

export function getGuardrailRows(match: PlaybookMatch): GuardrailRow[] {
  return [
    {
      label: "Founder Opt-Out",
      tone: "strong",
      text: `${match.company.name} accepts investor introductions, so the hard gate is cleared before outreach begins.`,
    },
    {
      label: "Fund Activity",
      tone: isWaitingMatch(match) ? "watch" : "strong",
      text: isWaitingMatch(match)
        ? `This opportunity is better timed for a milestone-triggered reactivation than immediate outreach.`
        : `${match.company.name} is in-market enough to justify action now rather than passive monitoring.`,
    },
    {
      label: "Geography",
      tone: scoreTone(match.geoPts, 3),
      text: `${match.investor.name} covers ${match.investor.geography}. ${match.company.name} is anchored in ${match.company.homeMarket} with expansion toward ${match.company.targetMarket}.`,
    },
    {
      label: "Mandate Fit",
      tone: scoreTone(Math.min(match.stagePts, match.sectorPts), 3),
      text: `Stage and thesis alignment are strong enough that this will read as an intentional introduction, not a broad spray-and-pray pitch.`,
    },
    {
      label: "Round Structure",
      tone: scoreTone(match.chequePts, 2),
      text: `${match.investor.name} typically writes ${match.investor.chequeSize}, which is compatible with ${match.company.name}'s current ask of ${match.company.askSize}.`,
    },
  ];
}

export function getHeadline(match: PlaybookMatch): string {
  const stage = getStageShortLabel(match);
  const thesis = getThesisShortLabel(match);
  const cheque = getChequeShortLabel(match);
  return `${match.company.name} -> ${match.investor.name} | ${stage} | ${thesis} | ${cheque} | Tier ${match.tier}`;
}

export function getPrioritySummary(match: PlaybookMatch): string {
  return getConvictionRows(match)[0]?.text ?? match.rationale;
}

export function getSelectedMatch(
  matches: PlaybookMatch[],
  selectedId?: string,
): PlaybookMatch | null {
  const ranked = sortMatches(matches);
  return ranked.find((match) => match.id === selectedId) ?? ranked[0] ?? null;
}

export function getTopTargets(company: BlockedCompany): CustomerTarget[] {
  return company.customerTargets.slice(0, 3);
}

export function getUrgencyPill(match: PlaybookMatch): string {
  return getActivationPlan(match).urgency;
}

export function isActivatedMatch(match: PlaybookMatch): boolean {
  return ACTIVE_STATUSES.has(match.pipelineStatus);
}

export function isWarmMatch(match: PlaybookMatch): boolean {
  const value = match.warmPath.toLowerCase();
  if (value.includes("cold")) return false;
  return /(warm|possible|tbdc|network|ahmed)/i.test(match.warmPath);
}

export function needsFollowUp(match: PlaybookMatch): boolean {
  return FOLLOW_UP_STATUSES.has(match.pipelineStatus);
}

export function parseAskMillions(text: string): number | null {
  if (/undisclosed|not actively raising/i.test(text)) return null;
  const values = collectMillions(text);
  if (values.length === 0) return null;
  if (values.length === 1) return values[0] ?? null;
  return ((values[0] ?? 0) + (values[1] ?? 0)) / 2;
}

export function sortMatches(matches: PlaybookMatch[]): PlaybookMatch[] {
  return [...matches].sort((left, right) => getPriorityScore(right) - getPriorityScore(left));
}

function buildChequeRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Cheque Size",
    tone: scoreTone(match.chequePts, 2),
    text: `${match.investor.name} typically writes ${match.investor.chequeSize}. ${match.company.name} is asking ${match.company.askSize}, so the round structure is ${fitCopy(match.chequePts, 2, "financeable inside this investor's normal range", "close enough to structure carefully", "better handled after the round shape changes")}.`,
  };
}

function getDraftBody(match: PlaybookMatch, mode: ActionMode): string {
  if (mode === "monitor") return buildReminderDraft(match);
  if (mode === "warm") return buildWarmDraft(match);
  return buildColdDraft(match);
}

function getDraftSubject(match: PlaybookMatch, mode: ActionMode): string {
  if (mode === "monitor") return `Reminder: reactivate ${match.company.name} x ${match.investor.name}`;
  if (mode === "warm") return `Warm intro request: ${match.company.name} x ${match.investor.name}`;
  return `${match.company.name} x ${match.investor.name} — thesis-aligned introduction`;
}

function buildFounderRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Founder Fit",
    tone: scoreTone(match.founderPts, 2),
    text: `${match.company.founderProfile} is the founder profile on the table. ${match.investor.name} will read that as ${fitCopy(match.founderPts, 2, "a strong conviction signal", "a partial signal worth backing with traction", "a weak signal that needs stronger proof elsewhere")}.`,
  };
}

function buildGapRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Portfolio Gap",
    signal: match.portfolioGap,
    tone: scoreTone(match.gapPts, 1),
    text: `${match.portfolioGap}. That makes the opportunity ${match.gapPts > 0 ? "additive to the portfolio story" : match.gapPts === 0 ? "credible without a specific gap edge" : "slightly more crowded than ideal"}.`,
  };
}

function buildGeographyRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Geography",
    tone: scoreTone(match.geoPts, 3),
    text: `${match.investor.name} invests across ${match.investor.geography}. ${match.company.name} is based in ${match.company.homeMarket} and pointing toward ${match.company.targetMarket}, so geography is ${fitCopy(match.geoPts, 3, "not a structural blocker", "a manageable stretch with the right framing", "the first thing to pressure-test before outreach")}.`,
  };
}

function buildReminderDraft(match: PlaybookMatch): string {
  return [
    `Watch ${match.company.name} x ${match.investor.name}.`,
    ``,
    `Reason to wait: ${match.nextStep}`,
    `Unlock condition: ${getReminderText(match)}`,
    `When this changes, revisit the match with the same conviction notes and update the outreach draft.`,
  ].join("\n");
}

function buildStageRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Stage Fit",
    tone: scoreTone(match.stagePts, 3),
    text: `${match.investor.name} backs ${match.investor.stage} companies. ${match.company.name} is ${match.company.stage}. The stage fit is ${fitCopy(match.stagePts, 3, "clean and immediate", "close enough to justify careful positioning", "not strong enough to force an introduction today")}.`,
  };
}

function buildSupportSignal(match: PlaybookMatch): string {
  if (match.nextStep.toLowerCase().includes("research")) return `Research cue: ${match.nextStep}`;
  if (isWarmMatch(match)) return `Network path: ${match.warmPath}`;
  return `Activation cue: ${match.nextStep}`;
}

function buildThesisRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Thesis Fit",
    signal: buildSupportSignal(match),
    tone: scoreTone(match.sectorPts, 3),
    text: `${match.investor.name} has stated interest in ${match.investor.sectors}. ${match.company.name} sits in ${match.company.sector}, so the thesis fit is ${fitCopy(match.sectorPts, 3, "direct rather than adjacent", "adjacent but defensible", "too stretched to anchor the first conversation")}.`,
  };
}

function buildTractionRow(match: PlaybookMatch): ConvictionRow {
  return {
    label: "Traction",
    tone: scoreTone(match.revenuePts, 2),
    text: `${match.company.arrTraction}. That gives the match ${fitCopy(match.revenuePts, 2, "enough operating proof to feel timely", "just enough proof to warrant a careful intro", "less proof than this investor usually wants")}.`,
  };
}

function buildWarmDraft(match: PlaybookMatch): string {
  return [
    `Hi ${getConnectorLabel(match, "warm")},`,
    ``,
    `Could you introduce ${match.company.name} to ${extractContactName(match.investor.contactApproach)} at ${match.investor.name}?`,
    `${match.company.name} is a ${match.company.stage} company in ${match.company.sector} with ${match.company.arrTraction}.`,
    `Why this match matters: ${getPrioritySummary(match)}`,
    `Round context: ${match.company.askSize}.`,
    ``,
    `Suggested framing: ${match.nextStep}`,
    ``,
    `Thanks,`,
    `TBDC Partnerships`,
  ].join("\n");
}

function buildColdDraft(match: PlaybookMatch): string {
  return [
    `Hi ${extractContactName(match.investor.contactApproach)},`,
    ``,
    `Reaching out with a company that fits ${match.investor.name}'s thesis in a specific way.`,
    `${match.company.name} is a ${match.company.stage} company in ${match.company.sector} with ${match.company.arrTraction}.`,
    `Why this should matter to you: ${getPrioritySummary(match)}`,
    `Specific angle: ${match.portfolioGap}.`,
    `Round context: ${match.company.askSize}.`,
    ``,
    `If useful, I can send a tighter one-page brief before scheduling time.`,
    ``,
    `Best,`,
    `TBDC Partnerships`,
  ].join("\n");
}

function collectMillions(text: string): number[] {
  const normalized = text.replace(/[–—]/g, "-").replace(/,/g, "");
  return [...normalized.matchAll(/(\d+(?:\.\d+)?)\s*(M|K)?/gi)]
    .map((match) => toMillions(match[1] ?? "", match[2] ?? ""))
    .filter((value): value is number => value !== null);
}

function fitCopy(value: number, max: number, high: string, mid: string, low: string): string {
  if (value >= max) return high;
  if (value > 0) return mid;
  return low;
}

function getConnectorLabel(match: PlaybookMatch, mode: ActionMode): string {
  if (mode === "monitor") return "Playbook reminder";
  if (match.warmPath.includes("Ahmed")) return "Ahmed Korayem network";
  if (match.warmPath.includes("TBDC")) return "TBDC advisor network";
  if (mode === "warm") return match.warmPath;
  return extractContactName(match.investor.contactApproach);
}

function getChequeShortLabel(match: PlaybookMatch): string {
  if (match.chequePts >= 2) return "Cheque covers round";
  if (match.chequePts === 1) return "Cheque fit needs framing";
  return "Cheque size mismatch";
}

function getPrimaryCta(mode: ActionMode): string {
  if (mode === "warm") return "Send Intro Request";
  if (mode === "monitor") return "Set Reminder";
  return "Copy Email";
}

function getPriorityScore(match: PlaybookMatch): number {
  const bucketWeight = { ready: 300, qualified: 200, waiting: 100 }[getActivationBucket(match)];
  const warmWeight = isWarmMatch(match) ? 25 : 0;
  const statusWeight = ACTIVE_STATUSES.has(match.pipelineStatus) ? -20 : 10;
  return bucketWeight + warmWeight + statusWeight + match.score;
}

function getRecentSignal(match: PlaybookMatch): string {
  if (match.rationale.includes("written publicly")) return "Recent signal: the investor has publicly discussed this thesis area.";
  if (match.nextStep.toLowerCase().includes("research")) return "Recent signal: the next step already points to active thesis research.";
  if (isWarmMatch(match)) return `Recent signal: ${match.warmPath} creates a credible first-touch route.`;
  return `Recent signal: ${match.portfolioGap} is the most differentiated talking point in the first email.`;
}

function getReminderText(match: PlaybookMatch): string {
  if (/Q\d|quarter/i.test(match.nextStep)) return match.nextStep;
  if (/not actively raising/i.test(match.company.askSize)) return `Revisit when ${match.company.name} signals an active raise or strategic round.`;
  return `Re-check this match when the next traction milestone changes the outreach timing.`;
}

function getStageShortLabel(match: PlaybookMatch): string {
  if (match.stagePts >= 3) return "Stage fit";
  if (match.stagePts > 0) return "Adjacent stage fit";
  return "Stage caution";
}

function getSuccessRate(mode: ActionMode): string {
  if (mode === "warm") return "64% historical reply likelihood";
  if (mode === "monitor") return "Milestone-triggered reactivation";
  return "28% cold-start reply likelihood";
}

function getThesisShortLabel(match: PlaybookMatch): string {
  if (match.sectorPts >= 3) return "Thesis match";
  if (match.sectorPts > 0) return "Adjacent thesis";
  return "Thesis caution";
}

function getUrgencyLabel(match: PlaybookMatch, mode: ActionMode): string {
  if (match.pipelineStatus === "meeting_set") return "Meeting scheduled";
  if (match.pipelineStatus === "follow_up") return "Needs follow-up";
  if (match.pipelineStatus === "outreach_sent") return "Awaiting response";
  if (mode === "monitor") return "Waiting on milestone";
  return mode === "warm" ? "Activate today" : "Queue this week";
}

function isWaitingMatch(match: PlaybookMatch): boolean {
  const text = `${match.nextStep} ${match.rationale} ${match.company.askSize}`;
  return WAIT_PATTERNS.some((pattern) => pattern.test(text));
}

function scoreTone(value: number, max: number): Tone {
  if (value >= max) return "strong";
  if (value > 0) return "support";
  return value < 0 ? "watch" : "block";
}

function toMillions(rawValue: string, rawUnit: string): number | null {
  const value = Number(rawValue);
  if (Number.isNaN(value)) return null;
  if (rawUnit.toUpperCase() === "K") return value / 1000;
  return value;
}
