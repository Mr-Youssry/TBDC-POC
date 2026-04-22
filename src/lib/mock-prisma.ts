import bcrypt from "bcryptjs";
import type {
  AuditLog,
  ChatSession,
  Company,
  CustomerTarget,
  DoNotMatch,
  IndustryEvent,
  Investor,
  Match,
  MethodologyCard,
  MethodologyDimension,
  MethodologyGate,
  PipelineStatus,
  PrismaClient,
  User,
  UserRole,
} from "@prisma/client";
import { COMPANIES } from "../../prisma/data/companies";
import { INVESTORS } from "../../prisma/data/investors";
import { MATCH_BLOCKS } from "../../prisma/data/matches";
import { CARDS, DIMENSIONS, GATES } from "../../prisma/data/methodology";

type Row = Record<string, unknown>;
type SortDirection = "asc" | "desc";
type OrderBy<T extends Row> = Partial<Record<Extract<keyof T, string>, SortDirection>>;
type UserWithInvite = User & { invitedBy?: User | null };
type MatchWithRelations = Match & { company?: Company; investor?: Investor };
type CompanyWithRelations = Company & {
  customerTargets?: CustomerTarget[];
  events?: IndustryEvent[];
};
type AuditLogWithRelations = AuditLog & {
  actor?: Partial<User> | null;
  onBehalfOf?: Partial<User> | null;
};

type MockState = {
  users: User[];
  investors: Investor[];
  companies: Company[];
  matches: Match[];
  doNotMatches: DoNotMatch[];
  customerTargets: CustomerTarget[];
  industryEvents: IndustryEvent[];
  methodologyGates: MethodologyGate[];
  methodologyDimensions: MethodologyDimension[];
  methodologyCards: MethodologyCard[];
  auditLogs: AuditLog[];
  chatSessions: ChatSession[];
  counters: Record<string, number>;
};

const globalForMock = globalThis as typeof globalThis & {
  __tbdcMockPrisma?: PrismaClient;
  __tbdcMockState?: MockState;
};

export function getMockPrisma(): PrismaClient {
  if (!globalForMock.__tbdcMockState) {
    globalForMock.__tbdcMockState = buildState();
  }
  if (!globalForMock.__tbdcMockPrisma) {
    globalForMock.__tbdcMockPrisma = buildClient(
      globalForMock.__tbdcMockState,
    );
  }
  return globalForMock.__tbdcMockPrisma;
}

function buildState(): MockState {
  const seededAt = new Date();
  const users = buildUsers(seededAt);
  const investors = buildInvestors(seededAt);
  const companies = buildCompanies(seededAt);
  const relationState = buildRelationState(companies, investors, seededAt);
  const methodologyGates = buildGates(seededAt);
  const methodologyDimensions = buildDimensions(seededAt);
  const methodologyCards = buildCards(seededAt);
  const chatSessions = buildChatSessions(companies, investors, seededAt);

  return {
    users,
    investors,
    companies,
    matches: relationState.matches,
    doNotMatches: relationState.doNotMatches,
    customerTargets: relationState.customerTargets,
    industryEvents: relationState.industryEvents,
    methodologyGates,
    methodologyDimensions,
    methodologyCards,
    auditLogs: [],
    chatSessions,
    counters: {
      audit: 0,
      company: companies.length,
      customerTarget: relationState.customerTargets.length,
      doNotMatch: relationState.doNotMatches.length,
      event: relationState.industryEvents.length,
      investor: investors.length,
      match: relationState.matches.length,
      user: users.length,
    },
  };
}

function buildUsers(seededAt: Date): User[] {
  const users: User[] = [
    {
      id: "dummy-admin",
      email: "dummy-admin@local.test",
      passwordHash: "!",
      name: "Dummy Admin",
      role: "admin" as UserRole,
      createdAt: seededAt,
      invitedById: null,
    },
  ];

  const rawPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
  const emails = new Set(
    (process.env.BOOTSTRAP_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  const hash = rawPassword ? bcrypt.hashSync(rawPassword, 10) : null;

  if (hash) {
    let index = 0;
    for (const email of emails) {
      index += 1;
      users.push({
        id: formatId("user", index),
        email,
        passwordHash: hash,
        name: email.split("@")[0] ?? email,
        role: "admin" as UserRole,
        createdAt: seededAt,
        invitedById: "dummy-admin",
      });
    }
  }

  users.push({
    id: "assistant-user",
    email: process.env.ASSISTANT_USER_EMAIL ?? "assistant@tbdc.ready4vc.com",
    passwordHash: "!",
    name: "Assistant",
    role: "assistant" as UserRole,
    createdAt: seededAt,
    invitedById: null,
  });
  return users;
}

function buildInvestors(seededAt: Date): Investor[] {
  return INVESTORS.map((investor, index) => ({
    id: formatId("inv", index + 1),
    name: investor.name,
    type: investor.type,
    stage: investor.stage,
    sectors: investor.sectors,
    chequeSize: investor.chequeSize,
    geography: investor.geography,
    leadOrFollow: investor.leadOrFollow,
    deals12m: investor.deals12m,
    notablePortfolio: investor.notablePortfolio,
    contactApproach: investor.contactApproach,
    region: investor.region,
    confidence: investor.confidence,
    sortOrder: index,
    updatedByUserId: null,
    updatedAt: seededAt,
  }));
}

function buildCompanies(seededAt: Date): Company[] {
  return COMPANIES.map((company, index) => ({
    id: formatId("co", index + 1),
    name: company.name,
    cohort: company.cohort,
    stage: company.stage,
    sector: company.sector,
    arrTraction: company.arrTraction,
    askSize: company.askSize,
    homeMarket: company.homeMarket,
    targetMarket: company.targetMarket,
    founderProfile: company.founderProfile,
    acceptsInvestorIntros: company.acceptsInvestorIntros,
    gateNote: company.gateNote ?? null,
    sortOrder: index,
    updatedByUserId: null,
    updatedAt: seededAt,
  }));
}

function buildGates(seededAt: Date): MethodologyGate[] {
  return GATES.map((gate, index) => ({
    id: formatId("gate", index + 1),
    code: gate.code,
    name: gate.name,
    trigger: gate.trigger,
    rationale: gate.rationale,
    sortOrder: index,
    updatedByUserId: null,
    updatedAt: seededAt,
  }));
}

function buildDimensions(seededAt: Date): MethodologyDimension[] {
  return DIMENSIONS.map((dimension, index) => ({
    id: formatId("dim", index + 1),
    name: dimension.name,
    maxWeight: dimension.maxWeight,
    logic: dimension.logic,
    rationale: dimension.rationale,
    sortOrder: index,
    updatedByUserId: null,
    updatedAt: seededAt,
  }));
}

function buildCards(seededAt: Date): MethodologyCard[] {
  return CARDS.map((card, index) => ({
    id: formatId("card", index + 1),
    title: card.title,
    body: card.body,
    sortOrder: index,
    updatedByUserId: null,
    updatedAt: seededAt,
  }));
}

function buildRelationState(
  companies: Company[],
  investors: Investor[],
  seededAt: Date,
) {
  const companyIds = new Map(companies.map((company, index) => [index, company.id]));
  const investorIds = new Map(
    investors.map((investor) => [investor.name, investor.id]),
  );
  const matches: Match[] = [];
  const doNotMatches: DoNotMatch[] = [];
  const customerTargets: CustomerTarget[] = [];
  const industryEvents: IndustryEvent[] = [];

  let matchIndex = 0;
  let doNotMatchIndex = 0;
  let customerTargetIndex = 0;
  let eventIndex = 0;

  for (const block of MATCH_BLOCKS) {
    const companyId = companyIds.get(block.companyIndex);
    if (!companyId) continue;

    for (let index = 0; index < (block.tier1?.length ?? 0); index += 1) {
      const item = block.tier1?.[index];
      if (!item) continue;
      const investorId = investorIds.get(item.investor);
      if (!investorId) continue;
      matchIndex += 1;
      matches.push({
        id: formatId("match", matchIndex),
        companyId,
        investorId,
        tier: 1,
        score: item.score,
        geoPts: item.geo,
        stagePts: item.stage,
        sectorPts: item.sector,
        revenuePts: item.revenue,
        chequePts: item.cheque,
        founderPts: item.founder,
        gapPts: item.gap,
        warmPath: item.warmPath,
        warmPathBonus: buildWarmPathBonus(item.warmPath),
        portfolioGap: item.portfolioGap,
        rationale: item.rationale,
        nextStep: item.nextStep,
        pipelineStatus: seedPipelineStatus(1, index),
        sortOrder: index,
        updatedByUserId: null,
        updatedAt: seededAt,
      });
    }

    for (let index = 0; index < (block.tier2?.length ?? 0); index += 1) {
      const item = block.tier2?.[index];
      if (!item) continue;
      const investorId = investorIds.get(item.investor);
      if (!investorId) continue;
      matchIndex += 1;
      matches.push({
        id: formatId("match", matchIndex),
        companyId,
        investorId,
        tier: 2,
        score: item.score,
        geoPts: item.geo,
        stagePts: item.stage,
        sectorPts: item.sector,
        revenuePts: item.revenue,
        chequePts: item.cheque,
        founderPts: item.founder,
        gapPts: item.gap,
        warmPath: item.warmPath,
        warmPathBonus: buildWarmPathBonus(item.warmPath),
        portfolioGap: item.portfolioGap,
        rationale: item.rationale,
        nextStep: item.nextStep,
        pipelineStatus: seedPipelineStatus(2, index),
        sortOrder: index,
        updatedByUserId: null,
        updatedAt: seededAt,
      });
    }

    for (let index = 0; index < (block.doNotMatch?.length ?? 0); index += 1) {
      const item = block.doNotMatch?.[index];
      if (!item) continue;
      doNotMatchIndex += 1;
      doNotMatches.push({
        id: formatId("dnm", doNotMatchIndex),
        companyId,
        investorId: investorIds.get(item.label) ?? null,
        label: item.label,
        reason: item.reason,
        sortOrder: index,
        updatedByUserId: null,
        updatedAt: seededAt,
      });
    }

    for (
      let index = 0;
      index < (block.customerTargets?.length ?? 0);
      index += 1
    ) {
      const item = block.customerTargets?.[index];
      if (!item) continue;
      customerTargetIndex += 1;
      customerTargets.push({
        id: formatId("ct", customerTargetIndex),
        companyId,
        name: item.name,
        targetType: item.targetType,
        hq: item.hq,
        description: item.description,
        sortOrder: index,
        updatedByUserId: null,
        updatedAt: seededAt,
      });
    }

    for (let index = 0; index < (block.events?.length ?? 0); index += 1) {
      const name = block.events?.[index];
      if (!name) continue;
      eventIndex += 1;
      industryEvents.push({
        id: formatId("evt", eventIndex),
        companyId,
        name,
        sortOrder: index,
        updatedByUserId: null,
        updatedAt: seededAt,
      });
    }
  }

  return { matches, doNotMatches, customerTargets, industryEvents };
}

function buildChatSessions(
  companies: Company[],
  investors: Investor[],
  seededAt: Date,
): ChatSession[] {
  const sessions: ChatSession[] = [
    {
      id: "chat-general",
      scopeType: "general",
      scopeEntityId: "__general__",
      openclawSessionId: "tbdc-general",
      displayName: "General",
      createdAt: seededAt,
      lastMessageAt: null,
    },
    {
      id: "chat-configure",
      scopeType: "general",
      scopeEntityId: "__configure__",
      openclawSessionId: "tbdc-configure",
      displayName: "Configure SCOTE",
      createdAt: seededAt,
      lastMessageAt: null,
    },
  ];

  for (const company of companies) {
    sessions.push({
      id: `chat-company-${company.id}`,
      scopeType: "company",
      scopeEntityId: company.id,
      openclawSessionId: `tbdc-co-${company.id}`,
      displayName: company.name,
      createdAt: seededAt,
      lastMessageAt: null,
    });
  }

  for (const investor of investors) {
    sessions.push({
      id: `chat-investor-${investor.id}`,
      scopeType: "investor",
      scopeEntityId: investor.id,
      openclawSessionId: `tbdc-inv-${investor.id}`,
      displayName: investor.name,
      createdAt: seededAt,
      lastMessageAt: null,
    });
  }

  return sessions;
}

function buildClient(state: MockState): PrismaClient {
  const client = {
    $disconnect: async () => undefined,
    user: {
      findUnique: async (args: { where: Partial<User> }) =>
        withInvite(findFirst(state.users, args.where), state),
      findMany: async (args?: {
        orderBy?: OrderBy<User>;
        include?: { invitedBy?: boolean };
      }) => withInviteList(sortRows(state.users, args?.orderBy), state, args?.include),
      create: async (args: { data: Partial<User> }) => {
        const row: User = {
          id: nextId(state, "user", "user"),
          email: String(args.data.email ?? ""),
          passwordHash: String(args.data.passwordHash ?? "!"),
          name: toNullableString(args.data.name),
          role: (args.data.role ?? ("admin" as UserRole)) as UserRole,
          createdAt: new Date(),
          invitedById: toNullableString(args.data.invitedById),
        };
        state.users.push(row);
        return row;
      },
      delete: async (args: { where: { id: string } }) => {
        const deleted = removeById(state.users, args.where.id);
        for (const user of state.users) {
          if (user.invitedById === deleted.id) {
            user.invitedById = null;
          }
        }
        return deleted;
      },
      count: async (args?: { where?: Partial<User> }) =>
        filterRows(state.users, args?.where).length,
    },
    investor: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.investors, args.where),
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<Investor>;
        select?: Record<string, boolean>;
      }) => mapList(filterAndSort(state.investors, args?.where, args?.orderBy), args?.select),
      groupBy: async (args: { by: string[]; _count?: boolean; where?: Record<string, unknown> }) =>
        groupInvestorsByRegion(filterRows(state.investors, args.where)),
      aggregate: async () => ({ _max: { sortOrder: maxSortOrder(state.investors) } }),
      create: async (args: { data: Partial<Investor> }) => {
        const row: Investor = {
          id: nextId(state, "investor", "inv"),
          name: String(args.data.name ?? "New investor"),
          type: String(args.data.type ?? "VC"),
          stage: String(args.data.stage ?? "Seed"),
          sectors: String(args.data.sectors ?? "—"),
          chequeSize: String(args.data.chequeSize ?? "—"),
          geography: String(args.data.geography ?? "—"),
          leadOrFollow: String(args.data.leadOrFollow ?? "Lead"),
          deals12m: String(args.data.deals12m ?? "—"),
          notablePortfolio: String(args.data.notablePortfolio ?? "—"),
          contactApproach: String(args.data.contactApproach ?? "—"),
          region: String(args.data.region ?? "Canada"),
          confidence: String(args.data.confidence ?? "Medium"),
          sortOrder: Number(args.data.sortOrder ?? maxSortOrder(state.investors) + 1),
          updatedByUserId: toNullableString(args.data.updatedByUserId),
          updatedAt: new Date(),
        };
        state.investors.push(row);
        state.chatSessions.push(buildInvestorSession(row));
        return row;
      },
      update: async (args: { where: { id: string }; data: Partial<Investor> }) =>
        updateTrackedRow(state.investors, args.where.id, args.data),
      delete: async (args: { where: { id: string } }) => {
        const deleted = removeById(state.investors, args.where.id);
        state.matches = state.matches.filter((match) => match.investorId !== deleted.id);
        state.doNotMatches = state.doNotMatches.map((row) =>
          row.investorId === deleted.id ? { ...row, investorId: null } : row,
        );
        state.chatSessions = state.chatSessions.filter(
          (session) => session.scopeEntityId !== deleted.id,
        );
        return deleted;
      },
      count: async (args?: { where?: Record<string, unknown> }) =>
        filterRows(state.investors, args?.where).length,
    },
    company: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.companies, args.where),
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<Company>;
        include?: {
          customerTargets?: { orderBy?: OrderBy<CustomerTarget> };
          events?: { orderBy?: OrderBy<IndustryEvent> };
        };
        select?: Record<string, boolean>;
      }) =>
        withCompanyRelations(
          filterAndSort(state.companies, args?.where, args?.orderBy),
          state,
          args?.include,
          args?.select,
        ),
      aggregate: async () => ({ _max: { sortOrder: maxSortOrder(state.companies) } }),
      create: async (args: { data: Partial<Company> }) => {
        const row: Company = {
          id: nextId(state, "company", "co"),
          name: String(args.data.name ?? "New company"),
          cohort: String(args.data.cohort ?? "Pivot 1"),
          stage: String(args.data.stage ?? "Seed"),
          sector: String(args.data.sector ?? "—"),
          arrTraction: String(args.data.arrTraction ?? "—"),
          askSize: String(args.data.askSize ?? "—"),
          homeMarket: String(args.data.homeMarket ?? "—"),
          targetMarket: String(args.data.targetMarket ?? "—"),
          founderProfile: String(args.data.founderProfile ?? "—"),
          acceptsInvestorIntros: Boolean(args.data.acceptsInvestorIntros ?? true),
          gateNote: toNullableString(args.data.gateNote),
          sortOrder: Number(args.data.sortOrder ?? maxSortOrder(state.companies) + 1),
          updatedByUserId: toNullableString(args.data.updatedByUserId),
          updatedAt: new Date(),
        };
        state.companies.push(row);
        state.chatSessions.push(buildCompanySession(row));
        return row;
      },
      update: async (args: { where: { id: string }; data: Partial<Company> }) =>
        updateTrackedRow(state.companies, args.where.id, args.data),
      delete: async (args: { where: { id: string } }) => {
        const deleted = removeById(state.companies, args.where.id);
        state.matches = state.matches.filter((match) => match.companyId !== deleted.id);
        state.doNotMatches = state.doNotMatches.filter(
          (row) => row.companyId !== deleted.id,
        );
        state.customerTargets = state.customerTargets.filter(
          (row) => row.companyId !== deleted.id,
        );
        state.industryEvents = state.industryEvents.filter(
          (row) => row.companyId !== deleted.id,
        );
        state.chatSessions = state.chatSessions.filter(
          (session) => session.scopeEntityId !== deleted.id,
        );
        return deleted;
      },
      count: async (args?: { where?: Record<string, unknown> }) =>
        filterRows(state.companies, args?.where).length,
    },
    match: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.matches, args.where),
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<Match> | Array<OrderBy<Match>>;
        include?: { company?: boolean; investor?: boolean };
      }) =>
        withMatchRelations(
          filterAndSort(state.matches, args?.where, args?.orderBy),
          state,
          args?.include,
        ),
      update: async (args: { where: { id: string }; data: Partial<Match> }) =>
        updateTrackedRow(state.matches, args.where.id, args.data),
      count: async (args?: { where?: Record<string, unknown> }) =>
        filterRows(state.matches, args?.where).length,
    },
    doNotMatch: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.doNotMatches, args.where),
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<DoNotMatch>;
      }) => filterAndSort(state.doNotMatches, args?.where, args?.orderBy),
      update: async (args: {
        where: { id: string };
        data: Partial<DoNotMatch>;
      }) => updateTrackedRow(state.doNotMatches, args.where.id, args.data),
    },
    customerTarget: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.customerTargets, args.where),
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<CustomerTarget>;
      }) => filterAndSort(state.customerTargets, args?.where, args?.orderBy),
      update: async (args: {
        where: { id: string };
        data: Partial<CustomerTarget>;
      }) => updateTrackedRow(state.customerTargets, args.where.id, args.data),
    },
    industryEvent: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.industryEvents, args.where),
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<IndustryEvent>;
      }) => filterAndSort(state.industryEvents, args?.where, args?.orderBy),
      update: async (args: {
        where: { id: string };
        data: Partial<IndustryEvent>;
      }) => updateTrackedRow(state.industryEvents, args.where.id, args.data),
    },
    methodologyGate: {
      findMany: async (args?: { orderBy?: OrderBy<MethodologyGate> }) =>
        sortRows(state.methodologyGates, args?.orderBy),
      update: async (args: {
        where: { id: string };
        data: Partial<MethodologyGate>;
      }) => updateTrackedRow(state.methodologyGates, args.where.id, args.data),
    },
    methodologyDimension: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.methodologyDimensions, args.where),
      findMany: async (args?: { orderBy?: OrderBy<MethodologyDimension> }) =>
        sortRows(state.methodologyDimensions, args?.orderBy),
      update: async (args: {
        where: { id: string };
        data: Partial<MethodologyDimension>;
      }) =>
        updateTrackedRow(state.methodologyDimensions, args.where.id, args.data),
      count: async () => state.methodologyDimensions.length,
    },
    methodologyCard: {
      findUnique: async (args: { where: Record<string, unknown> }) =>
        findFirst(state.methodologyCards, args.where),
      findMany: async (args?: { orderBy?: OrderBy<MethodologyCard> }) =>
        sortRows(state.methodologyCards, args?.orderBy),
      update: async (args: {
        where: { id: string };
        data: Partial<MethodologyCard>;
      }) => updateTrackedRow(state.methodologyCards, args.where.id, args.data),
    },
    auditLog: {
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: OrderBy<AuditLog>;
        take?: number;
        include?: {
          actor?: { select?: Record<string, boolean> };
          onBehalfOf?: { select?: Record<string, boolean> };
        };
      }) =>
        withAuditRelations(
          takeRows(
            filterAndSort(state.auditLogs, args?.where, args?.orderBy),
            args?.take,
          ),
          state,
          args?.include,
        ),
      findUnique: async (args: { where: { id: string } }) =>
        findFirst(state.auditLogs, args.where),
      create: async (args: { data: Partial<AuditLog> }) => {
        const row: AuditLog = {
          id: nextId(state, "audit", "audit"),
          actorUserId: String(args.data.actorUserId ?? "dummy-admin"),
          onBehalfOfUserId: toNullableString(args.data.onBehalfOfUserId),
          tableName: String(args.data.tableName ?? "Unknown"),
          rowId: String(args.data.rowId ?? ""),
          field: toNullableString(args.data.field),
          oldValueJson: (args.data.oldValueJson ?? null) as AuditLog["oldValueJson"],
          newValueJson: (args.data.newValueJson ?? null) as AuditLog["newValueJson"],
          operation: (args.data.operation ?? "update") as AuditLog["operation"],
          chatSessionId: toNullableString(args.data.chatSessionId),
          revertedByAuditId: toNullableString(args.data.revertedByAuditId),
          createdAt: new Date(),
        };
        state.auditLogs.push(row);
        return row;
      },
      update: async (args: { where: { id: string }; data: Partial<AuditLog> }) =>
        updatePlainRow(state.auditLogs, args.where.id, args.data),
    },
    chatSession: {
      findMany: async (args?: {
        where?: Record<string, unknown>;
        orderBy?: Array<OrderBy<ChatSession>> | OrderBy<ChatSession>;
        select?: Record<string, boolean>;
      }) => mapList(filterAndSort(state.chatSessions, args?.where, args?.orderBy), args?.select),
    },
  };

  return client as unknown as PrismaClient;
}

function withInvite(user: User | undefined, state: MockState) {
  if (!user) return null;
  return {
    ...user,
    invitedBy: user.invitedById
      ? state.users.find((candidate) => candidate.id === user.invitedById) ?? null
      : null,
  };
}

function withInviteList(
  users: User[],
  state: MockState,
  include?: { invitedBy?: boolean },
): UserWithInvite[] {
  return users.map((user) => {
    if (!include?.invitedBy) return { ...user };
    return {
      ...user,
      invitedBy: user.invitedById
        ? state.users.find((candidate) => candidate.id === user.invitedById) ?? null
        : null,
    };
  });
}

function withCompanyRelations(
  companies: Company[],
  state: MockState,
  include?: {
    customerTargets?: { orderBy?: OrderBy<CustomerTarget> };
    events?: { orderBy?: OrderBy<IndustryEvent> };
  },
  select?: Record<string, boolean>,
) {
  return companies.map((company) => {
    const base = pickFields(company, select) as CompanyWithRelations;
    if (include?.customerTargets) {
      base.customerTargets = filterAndSort(
        state.customerTargets,
        { companyId: company.id },
        include.customerTargets.orderBy,
      );
    }
    if (include?.events) {
      base.events = filterAndSort(
        state.industryEvents,
        { companyId: company.id },
        include.events.orderBy,
      );
    }
    return base;
  });
}

function withMatchRelations(
  matches: Match[],
  state: MockState,
  include?: { company?: boolean; investor?: boolean },
) {
  return matches.map((match) => {
    const row: MatchWithRelations = { ...match };
    if (include?.company) {
      row.company =
        state.companies.find((company) => company.id === match.companyId) ?? undefined;
    }
    if (include?.investor) {
      row.investor =
        state.investors.find((investor) => investor.id === match.investorId) ??
        undefined;
    }
    return row;
  });
}

function withAuditRelations(
  rows: AuditLog[],
  state: MockState,
  include?: {
    actor?: { select?: Record<string, boolean> };
    onBehalfOf?: { select?: Record<string, boolean> };
  },
) {
  return rows.map((row) => {
    const item: AuditLogWithRelations = { ...row };
    if (include?.actor) {
      const actor = state.users.find((user) => user.id === row.actorUserId);
      item.actor = actor ? pickFields(actor, include.actor.select) : null;
    }
    if (include?.onBehalfOf) {
      const onBehalfOf = row.onBehalfOfUserId
        ? state.users.find((user) => user.id === row.onBehalfOfUserId)
        : null;
      item.onBehalfOf = onBehalfOf
        ? pickFields(onBehalfOf, include.onBehalfOf.select)
        : null;
    }
    return item;
  });
}

function buildCompanySession(company: Company): ChatSession {
  return {
    id: `chat-company-${company.id}`,
    scopeType: "company",
    scopeEntityId: company.id,
    openclawSessionId: `tbdc-co-${company.id}`,
    displayName: company.name,
    createdAt: new Date(),
    lastMessageAt: null,
  };
}

function buildInvestorSession(investor: Investor): ChatSession {
  return {
    id: `chat-investor-${investor.id}`,
    scopeType: "investor",
    scopeEntityId: investor.id,
    openclawSessionId: `tbdc-inv-${investor.id}`,
    displayName: investor.name,
    createdAt: new Date(),
    lastMessageAt: null,
  };
}

function filterAndSort<T extends Row>(
  rows: T[],
  where?: Record<string, unknown>,
  orderBy?: OrderBy<T> | Array<OrderBy<T>>,
) {
  return sortRows(filterRows(rows, where), orderBy);
}

function filterRows<T extends Row>(rows: T[], where?: Record<string, unknown>) {
  if (!where) return [...rows];
  return rows.filter((row) => matchesWhere(row, where));
}

function mapList<T extends Row>(rows: T[], select?: Record<string, boolean>) {
  return rows.map((row) => pickFields(row, select));
}

function takeRows<T>(rows: T[], take?: number) {
  if (!take) return rows;
  return rows.slice(0, take);
}

function groupInvestorsByRegion(rows: Investor[]) {
  const counts = new Map<string, number>();
  for (const investor of rows) {
    counts.set(investor.region, (counts.get(investor.region) ?? 0) + 1);
  }
  return [...counts.entries()].map(([region, count]) => ({
    region,
    _count: count,
  }));
}

function pickFields<T extends Row>(row: T, select?: Record<string, boolean>) {
  if (!select) return { ...row };
  const result: Row = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) result[key] = row[key];
  }
  return result;
}

function sortRows<T extends Row>(
  rows: T[],
  orderBy?: OrderBy<T> | Array<OrderBy<T>>,
) {
  if (!orderBy) return [...rows];
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((left, right) => compareRows(left, right, clauses));
}

function compareRows<T extends Row>(
  left: T,
  right: T,
  clauses: Array<OrderBy<T>>,
) {
  for (const clause of clauses) {
    const [field, direction] = Object.entries(clause)[0] ?? [];
    if (!field || !direction) continue;
    const result = compareValues(left[field], right[field], direction);
    if (result !== 0) return result;
  }
  return 0;
}

function compareValues(
  left: unknown,
  right: unknown,
  direction: SortDirection,
) {
  const leftValue = normalizeValue(left);
  const rightValue = normalizeValue(right);
  if (leftValue === rightValue) return 0;
  if (leftValue === null) return direction === "asc" ? 1 : -1;
  if (rightValue === null) return direction === "asc" ? -1 : 1;
  if (leftValue < rightValue) return direction === "asc" ? -1 : 1;
  return direction === "asc" ? 1 : -1;
}

function normalizeValue(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (value === null || value === undefined) return null;
  return value;
}

function matchesWhere(row: Row, where: Record<string, unknown>) {
  return Object.entries(where).every(([key, expected]) =>
    matchesValue(row[key], expected),
  );
}

function matchesValue(value: unknown, expected: unknown): boolean {
  if (!isPlainObject(expected)) return value === expected;
  if ("contains" in expected) {
    return String(value ?? "").includes(String(expected.contains ?? ""));
  }
  if ("not" in expected) {
    return value !== expected.not;
  }
  return value === expected;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findFirst<T extends Row>(rows: T[], where: Record<string, unknown>) {
  return rows.find((row) => matchesWhere(row, where));
}

function updateTrackedRow<T extends { id: string; updatedAt: Date }>(
  rows: T[],
  id: string,
  data: Partial<T>,
) {
  return updatePlainRow(rows, id, { ...data, updatedAt: new Date() });
}

function updatePlainRow<T extends { id: string }>(
  rows: T[],
  id: string,
  data: Partial<T>,
) {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error(`Row not found: ${id}`);
  const current = rows[index];
  const next = { ...current, ...data };
  rows[index] = next;
  return next;
}

function removeById<T extends { id: string }>(rows: T[], id: string) {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error(`Row not found: ${id}`);
  const [removed] = rows.splice(index, 1);
  if (!removed) throw new Error(`Row not found: ${id}`);
  return removed;
}

function maxSortOrder<T extends { sortOrder: number }>(rows: T[]) {
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((row) => row.sortOrder));
}

function nextId(state: MockState, key: string, prefix: string) {
  state.counters[key] = (state.counters[key] ?? 0) + 1;
  return formatId(prefix, state.counters[key]);
}

function formatId(prefix: string, index: number) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function toNullableString(value: unknown) {
  return typeof value === "string" ? value : value == null ? null : String(value);
}

function buildWarmPathBonus(_warmPath: string) {
  return null;
}

function seedPipelineStatus(_tier: number, _index: number): PipelineStatus {
  return "not_started" as PipelineStatus;
}

export const mockPrisma = getMockPrisma();

export default mockPrisma;
