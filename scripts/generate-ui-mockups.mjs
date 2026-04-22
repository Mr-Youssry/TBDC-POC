import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public", "design-exploration", "tbdc");
const planDir = path.join(root, "docs", "plans");

const diagnostics = [
  "Too many pages lead with full-width tables, which forces scanning across dozens of columns before the user understands what matters.",
  "Primary decisions and secondary reference material sit at the same visual weight, so the eye has no stable starting point.",
  "Filters, counts, and edit controls are exposed all at once instead of appearing when the user is in selection or editing mode.",
  "Routes with their own sidebars compress the working canvas and make long-form comparison harder than it should be.",
  "Admin, analyst, and training surfaces solve useful workflows, but the shared shell does not differentiate reading, editing, and acting states clearly.",
];

const references = [
  {
    title: "OpenVC",
    summary:
      "Search-first investor discovery with a clear taxonomy for stage, type, and location. It reduces cognitive load by making filters feel like a guided narrowing step rather than a permanent wall of controls.",
  },
  {
    title: "b2match dashboard pattern",
    summary:
      "Hub-like dashboard logic with widgets that act as gateways into deeper pages. It keeps the top layer concise while still making dense workflows discoverable through progressive disclosure.",
  },
];

const principles = [
  "Show one primary action zone per page, then support it with one secondary context rail.",
  "Replace wide editable tables with layered views: summary first, detail second, edit mode last.",
  "Expose filters in short, task-oriented groups instead of permanent all-at-once controls.",
  "Use section bands, scorecards, and drawers to separate signal from reference material.",
  "Let analyst and training feel like focused workspaces, not generic admin pages with chat bolted on.",
];

const concepts = [
  {
    slug: "01-signal-board.html",
    id: "signal-board",
    name: "Signal Board",
    strap: "Search-first operator dashboard",
    recommendation: "Strongest overall baseline for the product.",
    philosophy:
      "Takes the clearest ideas from OpenVC: intentional filtering, shortlist thinking, and quieter data presentation. Each page begins with one big answer and one support rail.",
    tone: "Calm, modern, premium, highly scannable.",
    bestFor: "Activation Playbook, Investors, Companies, Pipeline",
    why:
      "Best balance of elegance and usability. It lowers the feeling of crowding without making the product feel thin.",
  },
  {
    slug: "02-editorial-ops.html",
    id: "editorial-ops",
    name: "Editorial Ops",
    strap: "Board-deck style operating review",
    recommendation: "Best for presentation and stakeholder storytelling.",
    philosophy:
      "Treats each route like a chapter in a weekly operating brief. Large spacing, strong typography, and chapter summaries make dense material feel deliberate instead of compressed.",
    tone: "Editorial, strategic, composed, premium.",
    bestFor: "Methodology, Activation Playbook, Audit Log, Mission Control",
    why:
      "Useful when the product needs to read like an executive system rather than a classic SaaS dashboard.",
  },
  {
    slug: "03-relationship-studio.html",
    id: "relationship-studio",
    name: "Relationship Studio",
    strap: "Queue plus inspector workspace",
    recommendation: "Best fit for communication-heavy routes.",
    philosophy:
      "Optimized around one live list and one active detail pane. It treats people, matches, and conversations as selections inside a stable workspace.",
    tone: "Focused, sharp, operator-grade, workflow-first.",
    bestFor: "Match Output, Analyst, Training, Activation Playbook",
    why:
      "Excellent when the team spends most of its time comparing entities and moving them through next actions.",
  },
  {
    slug: "04-atlas-workspace.html",
    id: "atlas-workspace",
    name: "Atlas Workspace",
    strap: "Hub-and-spoke portfolio command map",
    recommendation: "Best for teams that want a richer dashboard center.",
    philosophy:
      "Uses b2match-style widget grouping to create a central navigation hub, then hands off to deeper operational screens. Dense content is grouped into modules instead of flattened into one scroll.",
    tone: "Enterprise, structured, high-context, dashboard-forward.",
    bestFor: "Home-level overview, Pipeline, Mission Control, Admin surfaces",
    why:
      "Good if you want the product to feel like an operational control center without returning to clutter.",
  },
  {
    slug: "05-boardroom-minimal.html",
    id: "boardroom-minimal",
    name: "Boardroom Minimal",
    strap: "Minimal enterprise with strong focus states",
    recommendation: "Best if visual stress is the main problem to solve.",
    philosophy:
      "Aggressively removes chrome, collapses secondary information, and uses minimal accents. The interface feels lighter because only the current decision surface is visible.",
    tone: "Minimalist, refined, restrained, high-confidence.",
    bestFor: "Login, Investors, Companies, Admin Users, Audit Log",
    why:
      "Creates the cleanest visual experience, especially for tables and maintenance workflows.",
  },
];

const routes = [
  {
    id: "activation",
    title: "Activation Playbook",
    kicker: "Action hub",
    summary: "Turn high-scoring matches into a smaller, calmer action queue with one active detail context.",
    chips: ["Ready now", "Warm paths only", "Needs follow-up"],
    statA: "12 live priorities",
    statB: "4 blocked reactivations",
  },
  {
    id: "methodology",
    title: "Methodology",
    kicker: "Knowledge system",
    summary: "Explain the scoring logic without forcing the user through three uninterrupted tables.",
    chips: ["Hard gates", "Weighted dimensions", "Tier protocol"],
    statA: "3 hard gates",
    statB: "8 weighted dimensions",
  },
  {
    id: "investors",
    title: "Investor Database",
    kicker: "Discovery database",
    summary: "Move from spreadsheet feeling to search-and-shortlist behavior with compact filters and expandable detail.",
    chips: ["Region", "Type", "Stage", "Lead appetite"],
    statA: "171 investors",
    statB: "24 shortlisted",
  },
  {
    id: "companies",
    title: "Portfolio Companies",
    kicker: "Portfolio view",
    summary: "Group companies by cohort and readiness so the page reads like a portfolio desk, not a maintenance sheet.",
    chips: ["Cohort", "Stage", "Sector", "Intro status"],
    statA: "10 companies",
    statB: "3 blocked from intros",
  },
  {
    id: "match",
    title: "Match Output",
    kicker: "Selection workspace",
    summary: "Keep the company picker stable while ranked investor evidence becomes the main focal surface.",
    chips: ["Tier 1", "Tier 2", "Do not match"],
    statA: "22 scored matches",
    statB: "6 customer paths",
  },
  {
    id: "pipeline",
    title: "Pipeline",
    kicker: "Outreach tracker",
    summary: "Replace the wide operational sheet with a calmer status board and concise status summaries.",
    chips: ["Not started", "Drafting", "Sent", "Waiting"],
    statA: "22 active matches",
    statB: "7 waiting on reply",
  },
  {
    id: "analyst",
    title: "SCOTE Analyst",
    kicker: "Conversation workspace",
    summary: "Make the chat feel intentional by separating channel navigation, the active thread, and supporting context.",
    chips: ["General", "Company channels", "Investor channels"],
    statA: "1 active thread",
    statB: "42 reference files",
  },
  {
    id: "training",
    title: "SCOTE Training",
    kicker: "Configuration studio",
    summary: "Present files, memory, and chat as one training studio with fewer competing panes.",
    chips: ["Identity files", "Memory", "Prompt tuning"],
    statA: "3 identity files",
    statB: "1 live config chat",
  },
  {
    id: "admin-users",
    title: "Admin Users",
    kicker: "Access management",
    summary: "Turn user management into a clear roster plus invite workflow instead of a generic admin table.",
    chips: ["Invite", "Roles", "Bootstrap admins"],
    statA: "5 admins",
    statB: "1 self account",
  },
  {
    id: "admin-audit",
    title: "Audit Log",
    kicker: "Governance feed",
    summary: "Make changes readable as a timeline of intent, actor, and reversible diff instead of raw records.",
    chips: ["Recent activity", "Actor", "Table", "Revert"],
    statA: "200 latest entries",
    statB: "Field-level revert",
  },
  {
    id: "mission-control",
    title: "Mission Control",
    kicker: "System health",
    summary: "Use a status dashboard vocabulary so gateway checks, scripts, and config do not blur together.",
    chips: ["Gateway", "Plugins", "Config", "Launch"],
    statA: "4 status modules",
    statB: "1 launch action",
  },
  {
    id: "login",
    title: "Login",
    kicker: "Access entry",
    summary: "Reduce the first touchpoint to a high-trust, minimal sign-in surface with strong orientation.",
    chips: ["Email", "Password", "Public read-only"],
    statA: "Admin access",
    statB: "Read-only public routes",
  },
];

const ensureDirs = async () => {
  await mkdir(publicDir, { recursive: true });
  await mkdir(planDir, { recursive: true });
};

const conceptBodyClass = (id) => `concept concept--${id}`;

const buildMarkdown = () => [
  "# TBDC UI Exploration",
  "",
  "## Main Problems In The Current Product",
  "",
  ...diagnostics.map((item) => `- ${item}`),
  "",
  "## Reference Analysis",
  "",
  ...references.flatMap((item) => [`### ${item.title}`, "", item.summary, ""]),
  "## Core Design Principles",
  "",
  ...principles.map((item) => `- ${item}`),
  "",
  "## Directions",
  "",
  ...concepts.flatMap((item) => [
    `### ${item.name}`,
    "",
    `- **Philosophy:** ${item.philosophy}`,
    `- **Tone:** ${item.tone}`,
    `- **Best For:** ${item.bestFor}`,
    `- **Why It Works:** ${item.why}`,
    "",
  ]),
  "## Recommendation",
  "",
  `Start with **${concepts[0].name}** as the product-wide baseline. It gives the clearest improvement to density, filter exposure, and page hierarchy while staying realistic for a multi-surface operational product. For the conversational routes, borrow the split-pane logic from **${concepts[2].name}**.`,
  "",
].join("\n");

const renderIndexCard = (concept) => `
  <a class="index-card" href="./${concept.slug}">
    <div class="index-card__top">
      <div>
        <div class="eyebrow">Concept</div>
        <h2>${concept.name}</h2>
        <p>${concept.strap}</p>
      </div>
      <span class="badge">${concept.recommendation}</span>
    </div>
    <div class="mini-screen mini-screen--${concept.id}">
      <div class="mini-screen__rail"></div>
      <div class="mini-screen__canvas">
        <div class="mini-screen__band"></div>
        <div class="mini-screen__row">
          <span></span><span></span><span></span>
        </div>
        <div class="mini-screen__grid">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
    <ul class="bullet-list">
      <li><strong>Philosophy:</strong> ${concept.philosophy}</li>
      <li><strong>Best for:</strong> ${concept.bestFor}</li>
      <li><strong>Why:</strong> ${concept.why}</li>
    </ul>
  </a>
`;

const buildIndex = () => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TBDC UI Exploration</title>
    <link rel="stylesheet" href="./mockups.css" />
  </head>
  <body class="index-page">
    <main class="index-shell">
      <header class="exploration-header">
        <div class="header-copy">
          <div class="eyebrow">Design exploration</div>
          <h1>TBDC UI/UX mockup directions</h1>
          <p>Five static HTML directions for the full project surface. Each concept covers the main routes so you can mix and match which page patterns you want to keep.</p>
        </div>
        <img class="brand-mark" src="/tbdc-logo.png" alt="TBDC" />
      </header>
      <section class="summary-grid">
        <article class="summary-card">
          <h3>Current friction</h3>
          <ul class="bullet-list">
            ${diagnostics.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
        <article class="summary-card">
          <h3>Reference logic</h3>
          <ul class="bullet-list">
            ${references.map((item) => `<li><strong>${item.title}:</strong> ${item.summary}</li>`).join("")}
          </ul>
        </article>
        <article class="summary-card">
          <h3>Design principles</h3>
          <ul class="bullet-list">
            ${principles.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="index-grid">
        ${concepts.map(renderIndexCard).join("")}
      </section>
    </main>
  </body>
</html>
`;

const renderToc = () => `
  <nav class="route-toc">
    ${routes.map((route) => `<a href="#${route.id}">${route.title}</a>`).join("")}
  </nav>
`;

const renderMetricStrip = (route) => `
  <div class="metric-strip">
    <div class="metric">
      <span class="metric__label">${route.kicker}</span>
      <strong>${route.statA}</strong>
    </div>
    <div class="metric">
      <span class="metric__label">Signal</span>
      <strong>${route.statB}</strong>
    </div>
  </div>
`;

const renderChipRow = (items) => `
  <div class="chip-row">
    ${items.map((item) => `<span>${item}</span>`).join("")}
  </div>
`;

const renderList = (items, rightLabel = "focus") => `
  <div class="list-shell">
    ${items.map((item) => `
      <div class="list-row">
        <div>
          <strong>${item.title}</strong>
          <p>${item.detail}</p>
        </div>
        <span class="list-chip">${item[rightLabel] ?? item.tag ?? rightLabel}</span>
      </div>
    `).join("")}
  </div>
`;

const renderTable = (headers, rows) => `
  <div class="table-shell">
    <div class="table-head">
      ${headers.map((item) => `<span>${item}</span>`).join("")}
    </div>
    ${rows.map((row) => `
      <div class="table-row">
        ${row.map((item) => `<span>${item}</span>`).join("")}
      </div>
    `).join("")}
  </div>
`;

const renderActivation = () => `
  <div class="screen screen--dashboard">
    ${renderMetricStrip(routes[0])}
    ${renderChipRow(routes[0].chips)}
    <div class="screen-grid">
      <div class="stack">
        ${renderList([
          { title: "Aibo Fintech x Inovia", detail: "Warm intro available through fintech operator circle.", focus: "Ready now" },
          { title: "Voltie x Whitecap", detail: "Needs one traction proof point before outreach copy is sent.", focus: "Follow-up" },
          { title: "Quanscient x Deeptech Angels", detail: "Reactivation path tied to customer validation milestone.", focus: "Blocked" },
        ])}
        <div class="widget-grid">
          <div class="widget"><span>Top queue</span><strong>4</strong><p>Only four intros sit above the fold.</p></div>
          <div class="widget"><span>Guardrails</span><strong>2</strong><p>Matches waiting on proof, not hidden in noise.</p></div>
          <div class="widget"><span>Reactivation</span><strong>3</strong><p>Blocked paths rerouted to customer access.</p></div>
        </div>
      </div>
      <aside class="aside-stack">
        <div class="detail-card">
          <span class="eyebrow">Selected match</span>
          <h4>Why this intro matters</h4>
          <p>Conviction, risk, and next action live together so the user does not need to scan multiple cards before deciding.</p>
        </div>
        <div class="detail-card">
          <span class="eyebrow">Execution loop</span>
          <p>Daily follow-up rhythm, owner, and unlock condition appear in one compact panel.</p>
        </div>
      </aside>
    </div>
  </div>
`;

const renderMethodology = () => `
  <div class="screen screen--knowledge">
    ${renderMetricStrip(routes[1])}
    <div class="knowledge-grid">
      <div class="chapter-list">
        <div><strong>01</strong><span>Hard gates</span></div>
        <div><strong>02</strong><span>Weighted dimensions</span></div>
        <div><strong>03</strong><span>Tier protocol</span></div>
      </div>
      <div class="stack">
        ${renderTable(
          ["Layer", "Purpose", "Display treatment"],
          [
            ["Gates", "Stop bad matches early", "Alert band"],
            ["Dimensions", "Explain weighted scoring", "Accordion rows"],
            ["Action tiers", "Translate score to next step", "Decision ladder"],
          ],
        )}
        <div class="tier-band">
          <div><span>11-14</span><strong>Priority intro</strong></div>
          <div><span>7-10</span><strong>Qualified outreach</strong></div>
          <div><span>3-6</span><strong>Monitor</strong></div>
          <div><span>0-2</span><strong>Do not match</strong></div>
        </div>
      </div>
    </div>
  </div>
`;

const renderInvestors = () => `
  <div class="screen screen--database">
    ${renderMetricStrip(routes[2])}
    ${renderChipRow(routes[2].chips)}
    <div class="screen-grid">
      <div class="stack">
        ${renderTable(
          ["Fund", "Type", "Stage", "Focus", "Lead"],
          [
            ["Inovia", "VC", "Seed-Series A", "B2B SaaS", "Lead"],
            ["Whitecap", "VC", "Seed", "Deeptech", "Lead/Follow"],
            ["The51", "Network", "Pre-seed", "Female founders", "Follow"],
            ["TELUS Ventures", "CVC", "Series A", "Applied AI", "Follow"],
          ],
        )}
      </div>
      <aside class="aside-stack">
        <div class="detail-card">
          <span class="eyebrow">Shortlist panel</span>
          <h4>Focused result set</h4>
          <p>Search, filters, and saved shortlist replace permanent exposure of every editable field.</p>
        </div>
        <div class="detail-card">
          <span class="eyebrow">Profile preview</span>
          <p>Cheque size, geography, portfolio signals, and outreach notes expand only when selected.</p>
        </div>
      </aside>
    </div>
  </div>
`;

const renderCompanies = () => `
  <div class="screen screen--portfolio">
    ${renderMetricStrip(routes[3])}
    ${renderChipRow(routes[3].chips)}
    <div class="company-grid">
      <div class="company-band">
        <span>Pivot 1</span>
        <div class="company-list">
          <article><strong>Aibo Fintech</strong><p>Seed fintech with strong warm paths.</p></article>
          <article><strong>Voltie</strong><p>Climate hardware, needs milestone before outreach.</p></article>
          <article><strong>Fermi Dev</strong><p>Developer tooling with investor-fit clarity.</p></article>
        </div>
      </div>
      <div class="company-band">
        <span>Horizon 3</span>
        <div class="company-list">
          <article><strong>Widmo Spectral</strong><p>Blocked from intros, route to customer paths instead.</p></article>
          <article><strong>Try and Buy</strong><p>Retail workflow company with strong commerce theme.</p></article>
          <article><strong>Quanscient</strong><p>Deeptech company requiring narrative support.</p></article>
        </div>
      </div>
    </div>
  </div>
`;

const renderMatch = () => `
  <div class="screen screen--workspace">
    ${renderMetricStrip(routes[4])}
    <div class="workspace-shell">
      <div class="workspace-rail">
        <strong>Companies</strong>
        <span class="rail-item is-active">Voltie</span>
        <span class="rail-item">Aibo Fintech</span>
        <span class="rail-item">Quanscient</span>
        <span class="rail-item rail-item--warn">Widmo Spectral</span>
      </div>
      <div class="workspace-main">
        ${renderList([
          { title: "Whitecap Venture Partners", detail: "Strong stage and sector fit. Warm path through advisor network.", focus: "Tier 1" },
          { title: "TELUS Ventures", detail: "Good fit but needs stronger traction packaging.", focus: "Tier 2" },
          { title: "The51", detail: "Useful community angle, not a lead path.", focus: "Tier 2" },
        ])}
      </div>
      <aside class="workspace-detail">
        <div class="detail-card">
          <span class="eyebrow">Evidence stack</span>
          <p>Fit factors are grouped as conviction, guardrails, and framing notes rather than many tiny badges.</p>
        </div>
      </aside>
    </div>
  </div>
`;

const renderPipeline = () => `
  <div class="screen screen--pipeline">
    ${renderMetricStrip(routes[5])}
    <div class="kanban-shell">
      <section><header>Ready</header><p>4 matches</p><div>Inovia for Aibo</div><div>Whitecap for Voltie</div></section>
      <section><header>Drafting</header><p>3 matches</p><div>TELUS for Voltie</div><div>Union Square for Quanscient</div></section>
      <section><header>Sent</header><p>6 matches</p><div>York Angels for Monk Trader</div><div>Susa for Fermi Dev</div></section>
      <section><header>Waiting</header><p>7 matches</p><div>The51 for Voltie</div><div>Version One for Try and Buy</div></section>
    </div>
  </div>
`;

const renderAnalyst = () => `
  <div class="screen screen--chat">
    ${renderMetricStrip(routes[6])}
    <div class="chat-shell">
      <div class="chat-rail">
        <strong>Channels</strong>
        <span class="rail-item is-active">General</span>
        <span class="rail-item">Voltie</span>
        <span class="rail-item">Aibo Fintech</span>
        <span class="rail-item">Inovia</span>
      </div>
      <div class="chat-thread">
        <div class="bubble bubble--assistant"><strong>SCOTE</strong><p>Here are the strongest next intros for Voltie and the risks to watch.</p></div>
        <div class="bubble bubble--user"><strong>Operator</strong><p>Prioritize the three most credible warm paths and draft the framing.</p></div>
        <div class="bubble bubble--assistant"><strong>SCOTE</strong><p>I would lead with Whitecap, then TELUS Ventures, then The51 as a support path.</p></div>
        <div class="composer">Ask a question, upload a file, or request a profile update...</div>
      </div>
      <aside class="chat-context">
        <div class="detail-card">
          <span class="eyebrow">Context drawer</span>
          <p>Selected company facts, recent files, and pinned reasoning appear here only when needed.</p>
        </div>
      </aside>
    </div>
  </div>
`;

const renderTraining = () => `
  <div class="screen screen--training">
    ${renderMetricStrip(routes[7])}
    <div class="training-shell">
      <div class="file-tree">
        <strong>Workspace</strong>
        <span class="rail-item is-active">SOUL.md</span>
        <span class="rail-item">STYLE.md</span>
        <span class="rail-item">VOICE.md</span>
        <span class="rail-item">memory/2026-04-22.md</span>
      </div>
      <div class="editor-shell">
        <div class="editor-header">STYLE.md</div>
        <div class="editor-lines">
          <span>Lead with the recommendation.</span>
          <span>Cite thesis, stage, and cheque fit before extras.</span>
          <span>Avoid generic fundraising language.</span>
        </div>
      </div>
      <aside class="chat-context">
        <div class="detail-card">
          <span class="eyebrow">Configure SCOTE</span>
          <p>Training guidance stays visually distinct from file editing, so the route feels like a studio rather than three unrelated panes.</p>
        </div>
      </aside>
    </div>
  </div>
`;

const renderAdminUsers = () => `
  <div class="screen screen--admin">
    ${renderMetricStrip(routes[8])}
    <div class="admin-grid">
      <div class="detail-card">
        <span class="eyebrow">Invite admin</span>
        <h4>Inline invite workflow</h4>
        <p>Email, name, role, and temporary credential live in one compact band instead of a detached form block.</p>
      </div>
      ${renderTable(
        ["User", "Role", "Created", "Invited by"],
        [
          ["dummy-admin@local.test", "Admin", "2026-04-20", "Bootstrap"],
          ["korayem@ready4vc.com", "Admin", "2026-04-20", "Bootstrap"],
          ["assistant@tbdc.ready4vc.com", "Assistant", "2026-04-22", "System"],
        ],
      )}
    </div>
  </div>
`;

const renderAudit = () => `
  <div class="screen screen--audit">
    ${renderMetricStrip(routes[9])}
    ${renderChipRow(routes[9].chips)}
    <div class="audit-list">
      <article><strong>Company.stage updated</strong><p>Dummy Admin changed Voltie from Pre-seed to Seed. Revert stays visible but secondary.</p></article>
      <article><strong>Match.nextStep updated</strong><p>Assistant refined the Whitecap outreach note for Voltie.</p></article>
      <article><strong>Investor.sectors updated</strong><p>Korayem adjusted Inovia thesis tags for better search matching.</p></article>
    </div>
  </div>
`;

const renderMissionControl = () => `
  <div class="screen screen--status">
    ${renderMetricStrip(routes[10])}
    <div class="status-grid">
      <div class="widget"><span>Gateway</span><strong>Healthy</strong><p>Model, bridge, and auth mode in one tile.</p></div>
      <div class="widget"><span>Plugin state</span><strong>Loaded</strong><p>tbdc-db plugin and source path summary.</p></div>
      <div class="widget"><span>Launch</span><strong>Ready</strong><p>One primary action, manual commands as secondary disclosure.</p></div>
      <div class="widget"><span>Config</span><strong>Redacted</strong><p>Readable config snapshot, not a wall of JSON first.</p></div>
    </div>
  </div>
`;

const renderLogin = () => `
  <div class="screen screen--auth">
    <div class="login-shell">
      <img class="login-logo" src="/tbdc-logo.png" alt="TBDC" />
      <div class="eyebrow">Admin access</div>
      <h3>Partnerships console</h3>
      <p>Editors only. Public routes remain readable without login.</p>
      <div class="form-lines">
        <span>Email</span>
        <span>Password</span>
        <span class="button-line">Sign in</span>
      </div>
    </div>
  </div>
`;

const renderScreen = (route) => {
  const map = {
    activation: renderActivation,
    methodology: renderMethodology,
    investors: renderInvestors,
    companies: renderCompanies,
    match: renderMatch,
    pipeline: renderPipeline,
    analyst: renderAnalyst,
    training: renderTraining,
    "admin-users": renderAdminUsers,
    "admin-audit": renderAudit,
    "mission-control": renderMissionControl,
    login: renderLogin,
  };
  return map[route.id]();
};

const renderRoute = (route) => `
  <section id="${route.id}" class="route-section">
    <div class="route-copy">
      <div class="eyebrow">${route.kicker}</div>
      <h2>${route.title}</h2>
      <p>${route.summary}</p>
    </div>
    ${renderScreen(route)}
  </section>
`;

const buildConcept = (concept) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${concept.name} - TBDC UI Exploration</title>
    <link rel="stylesheet" href="./mockups.css" />
  </head>
  <body class="${conceptBodyClass(concept.id)}">
    <main class="concept-shell">
      <header class="concept-header">
        <div class="concept-header__copy">
          <div class="eyebrow">Concept direction</div>
          <h1>${concept.name}</h1>
          <p>${concept.philosophy}</p>
          <div class="header-meta">
            <span><strong>Tone:</strong> ${concept.tone}</span>
            <span><strong>Best for:</strong> ${concept.bestFor}</span>
            <span><strong>Why it reduces crowding:</strong> ${concept.why}</span>
          </div>
        </div>
        <div class="header-side">
          <img class="brand-mark" src="/tbdc-logo.png" alt="TBDC" />
          <a class="ghost-link" href="./index.html">Back to concept list</a>
        </div>
      </header>
      <section class="summary-grid summary-grid--concept">
        <article class="summary-card">
          <h3>Current problems this solves</h3>
          <ul class="bullet-list">
            ${diagnostics.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
        <article class="summary-card">
          <h3>Reference logic applied</h3>
          <ul class="bullet-list">
            ${references.map((item) => `<li><strong>${item.title}:</strong> ${item.summary}</li>`).join("")}
          </ul>
        </article>
      </section>
      ${renderToc()}
      <div class="route-stack">
        ${routes.map(renderRoute).join("")}
      </div>
    </main>
  </body>
</html>
`;

const buildCss = () => `
:root {
  color-scheme: light;
  --bg: #eff2f6;
  --surface: #ffffff;
  --surface-2: #f7f9fc;
  --surface-3: #eef3f8;
  --text-1: #182230;
  --text-2: #405062;
  --text-3: #6d7b8b;
  --border: #d8e0ea;
  --border-2: #b4c2d4;
  --accent: #2563eb;
  --accent-2: #0f9d76;
  --accent-soft: rgba(37, 99, 235, 0.12);
  --warn: #f59e0b;
  --shadow: 0 22px 48px rgba(24, 34, 48, 0.08);
  --radius: 8px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Inter, "Segoe UI", Arial, sans-serif;
  background: var(--bg);
  color: var(--text-1);
}

a {
  color: inherit;
  text-decoration: none;
}

h1, h2, h3, h4, p {
  margin: 0;
}

.eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.brand-mark {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
}

.index-page {
  min-height: 100vh;
  padding: 32px 24px 60px;
}

.index-shell,
.concept-shell {
  max-width: 1440px;
  margin: 0 auto;
}

.exploration-header,
.concept-header {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  padding: 26px 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.exploration-header h1,
.concept-header h1 {
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1;
  letter-spacing: 0;
  margin-top: 10px;
}

.exploration-header p,
.concept-header p {
  margin-top: 14px;
  max-width: 900px;
  color: var(--text-2);
  font-size: 1rem;
  line-height: 1.7;
}

.header-side {
  display: grid;
  gap: 14px;
  justify-items: end;
}

.ghost-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.86rem;
  color: var(--text-2);
}

.header-meta {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  color: var(--text-2);
  font-size: 0.92rem;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
}

.summary-grid--concept {
  margin-bottom: 18px;
}

.summary-card,
.index-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.summary-card {
  padding: 22px;
}

.summary-card h3 {
  font-size: 1rem;
  margin-bottom: 12px;
}

.bullet-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 9px;
  color: var(--text-2);
  line-height: 1.55;
}

.index-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18px;
}

.index-card {
  display: grid;
  gap: 18px;
  padding: 22px;
}

.index-card__top {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: start;
}

.index-card h2 {
  margin-top: 8px;
  font-size: 1.45rem;
}

.index-card p {
  margin-top: 8px;
  color: var(--text-2);
  line-height: 1.6;
}

.badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: right;
}

.mini-screen {
  min-height: 180px;
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}

.mini-screen__rail {
  background: rgba(24, 34, 48, 0.94);
}

.mini-screen__canvas {
  padding: 16px;
  display: grid;
  gap: 12px;
  align-content: start;
}

.mini-screen__band,
.mini-screen__row span,
.mini-screen__grid span {
  display: block;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.mini-screen__band {
  height: 46px;
}

.mini-screen__row {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mini-screen__row span {
  height: 18px;
}

.mini-screen__grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mini-screen__grid span {
  min-height: 46px;
}

.route-toc {
  position: sticky;
  top: 12px;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--border);
  border-radius: 999px;
  backdrop-filter: blur(16px);
}

.route-toc a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.78rem;
  color: var(--text-2);
}

.route-stack {
  display: grid;
  gap: 28px;
}

.route-section {
  display: grid;
  gap: 18px;
  padding: 26px 0 0;
}

.route-copy {
  display: grid;
  gap: 12px;
}

.route-copy h2 {
  font-size: clamp(1.7rem, 3vw, 2.3rem);
}

.route-copy p {
  max-width: 960px;
  color: var(--text-2);
  line-height: 1.7;
  font-size: 0.97rem;
}

.screen {
  display: grid;
  gap: 18px;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.screen-grid,
.knowledge-grid,
.company-grid,
.admin-grid {
  display: grid;
  gap: 18px;
}

.screen-grid {
  grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.7fr);
}

.knowledge-grid {
  grid-template-columns: 220px minmax(0, 1fr);
}

.company-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-grid {
  grid-template-columns: 320px minmax(0, 1fr);
}

.stack,
.aside-stack,
.workspace-main,
.workspace-detail,
.chat-context,
.file-tree,
.editor-shell {
  display: grid;
  gap: 16px;
  align-content: start;
}

.metric-strip {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric,
.detail-card,
.widget,
.company-band,
.login-shell,
.chat-thread,
.chat-rail,
.file-tree,
.editor-shell,
.workspace-rail,
.workspace-detail,
.workspace-main,
.composer,
.audit-list article,
.kanban-shell section {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.metric {
  display: grid;
  gap: 6px;
  padding: 16px;
}

.metric strong {
  font-size: 1.3rem;
}

.metric__label {
  color: var(--text-3);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.chip-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chip-row span,
.list-chip,
.rail-item,
.button-line {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-2);
  font-size: 0.8rem;
}

.list-shell,
.audit-list {
  display: grid;
  gap: 10px;
}

.list-row,
.chapter-list div,
.company-list article,
.bubble {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.list-row {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.list-row p,
.detail-card p,
.widget p,
.company-list article p,
.audit-list article p,
.bubble p {
  color: var(--text-2);
  line-height: 1.55;
  font-size: 0.88rem;
}

.widget-grid,
.status-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.widget {
  padding: 16px;
}

.widget span {
  display: block;
  color: var(--text-3);
  font-size: 0.78rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.widget strong {
  font-size: 1.2rem;
}

.detail-card {
  padding: 16px;
  display: grid;
  gap: 10px;
}

.detail-card h4 {
  font-size: 1rem;
}

.chapter-list {
  display: grid;
  gap: 10px;
}

.chapter-list strong {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
}

.chapter-list span {
  font-weight: 600;
}

.table-shell {
  display: grid;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1px;
}

.table-head span,
.table-row span {
  background: var(--surface);
  padding: 12px 14px;
  font-size: 0.84rem;
}

.table-head span {
  background: var(--surface-3);
  color: var(--text-3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tier-band {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.tier-band div {
  padding: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.tier-band span {
  display: block;
  color: var(--text-3);
  font-size: 0.76rem;
  margin-bottom: 6px;
}

.company-band {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.company-band > span {
  color: var(--accent);
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.company-list {
  display: grid;
  gap: 10px;
}

.workspace-shell,
.chat-shell,
.training-shell {
  display: grid;
  gap: 14px;
  grid-template-columns: 220px minmax(0, 1fr) 320px;
}

.workspace-rail,
.chat-rail,
.file-tree {
  padding: 14px;
}

.workspace-rail strong,
.chat-rail strong,
.file-tree strong {
  display: block;
  margin-bottom: 12px;
  font-size: 0.88rem;
}

.workspace-rail,
.chat-rail,
.file-tree {
  display: grid;
  gap: 10px;
  align-content: start;
}

.rail-item.is-active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
}

.rail-item--warn {
  color: #b45309;
}

.chat-thread {
  padding: 14px;
  display: grid;
  gap: 12px;
  align-content: start;
}

.bubble--assistant {
  background: rgba(15, 157, 118, 0.08);
}

.bubble--user {
  background: rgba(37, 99, 235, 0.08);
}

.composer {
  padding: 14px 16px;
  color: var(--text-3);
  font-size: 0.88rem;
}

.editor-shell {
  padding: 0;
  overflow: hidden;
}

.editor-header {
  padding: 14px 16px;
  background: var(--surface-3);
  border-bottom: 1px solid var(--border);
  font-size: 0.84rem;
  font-weight: 700;
}

.editor-lines {
  display: grid;
  gap: 10px;
  padding: 16px;
}

.editor-lines span,
.form-lines span {
  display: block;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-2);
  font-size: 0.88rem;
}

.form-lines {
  display: grid;
  gap: 12px;
  width: 100%;
}

.button-line {
  justify-content: center;
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.kanban-shell {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.kanban-shell section {
  padding: 14px;
  display: grid;
  gap: 10px;
  align-content: start;
}

.kanban-shell header {
  font-weight: 700;
}

.kanban-shell p {
  color: var(--text-3);
  font-size: 0.8rem;
}

.kanban-shell div {
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.86rem;
}

.audit-list article {
  padding: 16px;
}

.login-shell {
  width: min(100%, 380px);
  justify-self: center;
  padding: 26px;
  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;
}

.login-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
}

.concept--signal-board {
  --bg: #eef3f7;
  --surface: #ffffff;
  --surface-2: #f7fafc;
  --surface-3: #edf3f7;
  --text-1: #14212f;
  --text-2: #405365;
  --text-3: #738395;
  --border: #dbe4ee;
  --border-2: #b5c7d9;
  --accent: #2563eb;
  --accent-2: #0f9d76;
  --accent-soft: rgba(37, 99, 235, 0.12);
}

.concept--editorial-ops {
  --bg: #f6f3ee;
  --surface: #fffdf9;
  --surface-2: #f8f3ec;
  --surface-3: #efe8df;
  --text-1: #241e1a;
  --text-2: #5c4f45;
  --text-3: #8a7b70;
  --border: #dccfc2;
  --border-2: #c8b8ab;
  --accent: #8b3d4d;
  --accent-2: #3b7d63;
  --accent-soft: rgba(139, 61, 77, 0.1);
}

.concept--editorial-ops .concept-header h1,
.concept--editorial-ops .route-copy h2 {
  font-family: Georgia, "Times New Roman", serif;
}

.concept--editorial-ops .route-section {
  padding-top: 34px;
}

.concept--editorial-ops .route-toc {
  border-radius: 8px;
}

.concept--relationship-studio {
  --bg: #edf3f1;
  --surface: #ffffff;
  --surface-2: #f4f8f7;
  --surface-3: #e8f0ee;
  --text-1: #182524;
  --text-2: #385350;
  --text-3: #6c8783;
  --border: #cfe0dc;
  --border-2: #a6c3bd;
  --accent: #0f766e;
  --accent-2: #2563eb;
  --accent-soft: rgba(15, 118, 110, 0.12);
}

.concept--relationship-studio .screen-grid,
.concept--relationship-studio .workspace-shell,
.concept--relationship-studio .chat-shell,
.concept--relationship-studio .training-shell {
  grid-template-columns: 260px minmax(0, 1fr) 280px;
}

.concept--relationship-studio .screen {
  border-radius: 6px;
}

.concept--atlas-workspace {
  --bg: #f1f4f0;
  --surface: #ffffff;
  --surface-2: #f5f7f2;
  --surface-3: #e9eee4;
  --text-1: #18201a;
  --text-2: #415044;
  --text-3: #748276;
  --border: #d7dfd1;
  --border-2: #b5c3ae;
  --accent: #446a37;
  --accent-2: #9f4c2e;
  --accent-soft: rgba(68, 106, 55, 0.12);
}

.concept--atlas-workspace .widget-grid,
.concept--atlas-workspace .status-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.concept--atlas-workspace .company-grid {
  grid-template-columns: 1.2fr 0.8fr;
}

.concept--boardroom-minimal {
  --bg: #f7f8fa;
  --surface: #ffffff;
  --surface-2: #f9fafb;
  --surface-3: #eff2f5;
  --text-1: #14171c;
  --text-2: #4a5565;
  --text-3: #7f8896;
  --border: #dde2e8;
  --border-2: #bcc7d1;
  --accent: #111827;
  --accent-2: #b42318;
  --accent-soft: rgba(17, 24, 39, 0.08);
}

.concept--boardroom-minimal .screen,
.concept--boardroom-minimal .summary-card,
.concept--boardroom-minimal .index-card,
.concept--boardroom-minimal .exploration-header,
.concept--boardroom-minimal .concept-header {
  box-shadow: none;
}

.concept--boardroom-minimal .screen-grid,
.concept--boardroom-minimal .admin-grid,
.concept--boardroom-minimal .company-grid,
.concept--boardroom-minimal .status-grid {
  grid-template-columns: minmax(0, 1fr);
}

.concept--boardroom-minimal .aside-stack,
.concept--boardroom-minimal .chat-context,
.concept--boardroom-minimal .workspace-detail {
  display: none;
}

@media (max-width: 1080px) {
  .summary-grid,
  .index-grid,
  .screen-grid,
  .knowledge-grid,
  .company-grid,
  .admin-grid,
  .workspace-shell,
  .chat-shell,
  .training-shell,
  .status-grid,
  .widget-grid,
  .kanban-shell,
  .metric-strip {
    grid-template-columns: 1fr;
  }

  .exploration-header,
  .concept-header {
    grid-template-columns: 1fr;
  }

  .header-side {
    justify-items: start;
  }
}
`;

const writeOutputs = async () => {
  await writeFile(path.join(publicDir, "mockups.css"), buildCss());
  await writeFile(path.join(publicDir, "index.html"), buildIndex());
  await Promise.all(
    concepts.map((concept) =>
      writeFile(path.join(publicDir, concept.slug), buildConcept(concept)),
    ),
  );
  await writeFile(
    path.join(planDir, "2026-04-22-tbdc-ui-directions.md"),
    buildMarkdown(),
  );
};

const main = async () => {
  await ensureDirs();
  await writeOutputs();
};

await main();
