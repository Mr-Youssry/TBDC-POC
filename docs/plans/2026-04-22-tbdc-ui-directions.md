# TBDC UI Exploration

## Main Problems In The Current Product

- Too many pages lead with full-width tables, which forces scanning across dozens of columns before the user understands what matters.
- Primary decisions and secondary reference material sit at the same visual weight, so the eye has no stable starting point.
- Filters, counts, and edit controls are exposed all at once instead of appearing when the user is in selection or editing mode.
- Routes with their own sidebars compress the working canvas and make long-form comparison harder than it should be.
- Admin, analyst, and training surfaces solve useful workflows, but the shared shell does not differentiate reading, editing, and acting states clearly.

## Reference Analysis

### OpenVC

Search-first investor discovery with a clear taxonomy for stage, type, and location. It reduces cognitive load by making filters feel like a guided narrowing step rather than a permanent wall of controls.

### b2match dashboard pattern

Hub-like dashboard logic with widgets that act as gateways into deeper pages. It keeps the top layer concise while still making dense workflows discoverable through progressive disclosure.

## Core Design Principles

- Show one primary action zone per page, then support it with one secondary context rail.
- Replace wide editable tables with layered views: summary first, detail second, edit mode last.
- Expose filters in short, task-oriented groups instead of permanent all-at-once controls.
- Use section bands, scorecards, and drawers to separate signal from reference material.
- Let analyst and training feel like focused workspaces, not generic admin pages with chat bolted on.

## Directions

### Signal Board

- **Philosophy:** Takes the clearest ideas from OpenVC: intentional filtering, shortlist thinking, and quieter data presentation. Each page begins with one big answer and one support rail.
- **Tone:** Calm, modern, premium, highly scannable.
- **Best For:** Activation Playbook, Investors, Companies, Pipeline
- **Why It Works:** Best balance of elegance and usability. It lowers the feeling of crowding without making the product feel thin.

### Editorial Ops

- **Philosophy:** Treats each route like a chapter in a weekly operating brief. Large spacing, strong typography, and chapter summaries make dense material feel deliberate instead of compressed.
- **Tone:** Editorial, strategic, composed, premium.
- **Best For:** Methodology, Activation Playbook, Audit Log, Mission Control
- **Why It Works:** Useful when the product needs to read like an executive system rather than a classic SaaS dashboard.

### Relationship Studio

- **Philosophy:** Optimized around one live list and one active detail pane. It treats people, matches, and conversations as selections inside a stable workspace.
- **Tone:** Focused, sharp, operator-grade, workflow-first.
- **Best For:** Match Output, Analyst, Training, Activation Playbook
- **Why It Works:** Excellent when the team spends most of its time comparing entities and moving them through next actions.

### Atlas Workspace

- **Philosophy:** Uses b2match-style widget grouping to create a central navigation hub, then hands off to deeper operational screens. Dense content is grouped into modules instead of flattened into one scroll.
- **Tone:** Enterprise, structured, high-context, dashboard-forward.
- **Best For:** Home-level overview, Pipeline, Mission Control, Admin surfaces
- **Why It Works:** Good if you want the product to feel like an operational control center without returning to clutter.

### Boardroom Minimal

- **Philosophy:** Aggressively removes chrome, collapses secondary information, and uses minimal accents. The interface feels lighter because only the current decision surface is visible.
- **Tone:** Minimalist, refined, restrained, high-confidence.
- **Best For:** Login, Investors, Companies, Admin Users, Audit Log
- **Why It Works:** Creates the cleanest visual experience, especially for tables and maintenance workflows.

## Recommendation

Start with **Signal Board** as the product-wide baseline. It gives the clearest improvement to density, filter exposure, and page hierarchy while staying realistic for a multi-surface operational product. For the conversational routes, borrow the split-pane logic from **Relationship Studio**.
