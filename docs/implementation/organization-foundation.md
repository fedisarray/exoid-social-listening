# Organization foundation

Implemented 4 November 2026. PowerPoint generation and organization management screens remain a subsequent milestone.

## Ownership and access

Each user belongs to at most one organization. Workspace requests resolve current membership from the database through `lib/auth/dal.ts`; JWT metadata and request inputs do not determine organization or role. Accounts without membership are redirected to `/organization-required` and can still sign out.

All organization members can discover listings, save places, edit/delete comparisons, collect reviews, inspect evidence and export Excel. Access to another organization's records is denied by both application scoping and RLS. Collection workers retain a separate authenticated internal context and take organization scope from their claimed job.

The migration creates a separate organization for each existing account. Resource IDs, comparison versions, review revisions, frozen snapshots and their contents are retained. Former `owner_id` columns become nullable `created_by` attribution with `ON DELETE SET NULL`; organization membership controls access. Removing an ordinary account does not remove shared data. An organization owner must transfer ownership before their account can be deleted.

Organization IDs are immutable on resources and memberships. Composite foreign keys bind all parent/child resource references to the same organization, including snapshot review revisions and worker ingestion. Saved-place and source-review uniqueness are scoped to the organization.

## Roles and backend operations

| Operation | Owner | Admin | Member |
|---|---|---|---|
| Normal workspace operations | Yes | Yes | Yes |
| Read organization settings and memberships | Yes | Yes | Yes |
| Update organization name and report template | Yes | Yes | No |
| Add/remove ordinary members | Yes | Yes | No |
| Appoint/demote/remove admins | Yes | No | No |
| Transfer ownership to an existing member | Yes | No | No |

Server actions and server queries live in `features/organizations`, with one use case per operation and a resource repository. Management writes use constrained database operations that re-read membership after locking the organization. Their privileged implementations are in the non-exposed `private` schema, with invoker wrappers in `public`. Direct client writes to organization/membership tables are denied.

- `getOrganization()` returns `{ id, name, reportTemplateId, role }`.
- `listOrganizationMembers()` returns user IDs, roles and join timestamps.
- `updateOrganization({ name, reportTemplateId })` updates both settings; `null` clears the template.
- `addOrganizationMember({ userId, role })` adds an existing account without membership; roles are `admin` or `member`.
- `changeOrganizationMemberRole({ userId, role })` changes a non-owner member's role.
- `removeOrganizationMember({ userId })` removes a non-owner member's access.
- `transferOrganizationOwnership({ userId })` promotes an existing member and makes the former owner an admin atomically.

Mutations return `{ ok: true }` or `{ ok: false, code }` for expected policy failures. Self-removal and self-role changes are rejected. A deferred database constraint requires exactly one owner at commit, with a unique index preventing multiple owners.

Existing accounts in another organization cannot be silently reassigned. There is no organization switcher, invitation flow, workspace merge or organization deletion endpoint.

## Provisioning and report configuration

Only an administrative connection can call `provision_organization(p_user_id, p_name)`. It creates the organization and its initial owner in one transaction. `pnpm db:seed` uses this operation when a seeded local account has no membership; rerunning it preserves existing memberships and settings. Login continues to accept only existing accounts and does not create organizations automatically.

The organization has a nullable `report_template_id`, initially `NULL`. Configure it through the authorized settings operation or an administrative database connection. It is an identifier, not a credential. The future reporting API key stays in server-side secrets; this milestone adds no provider calls or API key storage.

## Rollout and verification

Stop application writes and collection workers, take a database backup, then apply pending migrations with `pnpm exec supabase migration up --include-all`. Deploy the matching application and regenerate database types with `pnpm db:types` before restarting. Do not reset a populated database.

Disposable verification covered:

- Fresh replay of every migration and migration of a populated database copy.
- Exact comparison of all 191,608 existing resource rows across 10 tables, excluding only the new organization columns and renamed attribution field.
- Same-organization sharing, cross-organization denial, unassigned-account denial and immediate denial after membership removal.
- Role restrictions, owner protection, atomic ownership transfer, organization immutability and cross-organization foreign keys.
- Creator-account deletion retaining comparisons and frozen evidence.
- Comparison save/delete, discovery-backed place creation, place removal/restoration, collection queueing, synthetic worker ingestion and snapshot freezing.
- Live/frozen metrics, reviewer evidence, authenticated workspace pages and organization-shared Excel export using a complete synthetic dataset. Existing incomplete snapshots remain blocked by coverage rules.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, database lint and Supabase security advisors.

Verification scripts and synthetic databases are disposable; no permanent test suite or provider requests were added.
