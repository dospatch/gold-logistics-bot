# BC Gold Logistics — Enterprise Foundation

## Company identity
- Brand: BC Gold Logistics
- Tagline: Driven by Excellence. Delivered with Pride.
- Primary simulator: American Truck Simulator
- Operating model: multiplayer-only virtual trucking company
- Multiplayer platform: built-in ATS Convoy mode; TruckersMP is not required
- Fleet model: company-managed virtual fleet records
- Expansion: multiple operating divisions, introduced in phases
- Visual identity: preserve the existing black-and-gold truck emblem

## Enterprise divisions
1. Executive & Company Administration
2. Transportation & Driver Operations
3. Dispatch & Freight Coordination
4. Fleet & Equipment Management
5. Safety & Training
6. Human Resources & Recruitment
7. Technology & Systems
8. Convoy & Community Operations
9. Future expansion divisions, announced only when approved and staffed

## Connected company platform
The long-term platform is one connected system:
- Public website for company information and recruitment
- Discord as the member communication and event workspace
- Company bot for applications, roster, convoy notices, load records, and delivery updates
- Employee portal for driver profiles, assigned equipment, schedules, and activity records
- Management portal for recruitment, departments, fleet, dispatch, reports, and permissions
- Shared persistent database as the authoritative company record
- Optional local ATS telemetry companion for supported verified game events

## Core data domains
- People: Discord user ID, employee identifier, status, department, role, join date
- Fleet: company unit ID, truck, trailer, assigned driver, availability, inspection state
- Operations: convoy/event ID, route, scheduled time, participants, briefing, status
- Freight: load ID, origin, destination, cargo, assigned driver/unit, status, delivery evidence
- Training: module, completion state, date, reviewer
- Governance: role permissions, audit events, policy version, access history

## Security principles
- Public, member, employee, and management areas must be separated.
- Discord identity is the starting point for account linking.
- Access is granted by explicit role and department permissions (least privilege).
- Applications, employee records, and management reports are private.
- Never expose bot tokens, OAuth secrets, session secrets, or database credentials in source control.
- Important management actions should be audit logged.
- Existing Discord roles, channels, and message history must not be deleted during upgrades.

## Delivery phases
### Phase 1 — Foundation
- Align public company messaging with multiplayer-only ATS Convoy operations.
- Preserve and consistently display the existing company logo.
- Remove unverified fleet, workforce, and physical-campus claims.
- Document the company divisions, access principles, and system roadmap.

### Phase 2 — Discord company workspace
- Review the existing server before changing it.
- Map current roles to the approved company hierarchy.
- Add missing channels and permissions without deleting existing content.
- Verify private HR, management, dispatch, and driver spaces.

### Phase 3 — Website and identity
- Finish public pages and division descriptions.
- Add consistent navigation and mobile layouts.
- Verify recruitment, Discord sign-in, and private portal access.
- Add truthful fleet and company status information.

### Phase 4 — Shared data and employee portal
- Select a free-tier-compatible database only after checking current limits.
- Define migrations, backups, and data retention.
- Add employee profiles, role/department records, schedules, and equipment assignments.
- Keep secrets in hosting environment variables.

### Phase 5 — Dispatch, fleet, and reporting
- Add freight board, driver/unit assignment, delivery status, and maintenance reports.
- Add management views and CSV exports.
- Clearly distinguish manually entered records from telemetry-verified records.

### Phase 6 — ATS telemetry and expansion
- Harden the optional local telemetry companion.
- Verify driver identity and event authenticity.
- Add mileage and delivery analytics only after end-to-end testing.
- Evaluate future bus/coach or other divisions as separate approved projects.

## Operating constraints
- Prefer free hosting and free tiers.
- Do not activate paid plans, add billing, or purchase domains/services without explicit approval.
- Do not claim features are live until deployed and tested.
- Do not publish fictional company capacity as current operational fact.
