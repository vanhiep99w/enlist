# AGENTS.md - Language Learning App

## Commands

- **Backend (be/)**: `./mvnw spring-boot:run` | Build: `./mvnw clean package` | Test: `./mvnw test` | Single test: `./mvnw test -Dtest=ClassName#methodName` | Checkstyle: `./mvnw checkstyle:check`
- **Frontend (fe/)**: `bun run dev` | Build: `bun run build` | Test: `bun run test` | Single test: `bun run test -- path/to/file.test.ts`
- **Frontend Quality**: Before completing ANY FE task, MUST run:
  1. `cd fe && bun run lint:fix` (auto-fix linting issues)
  2. `cd fe && bun run lint` (verify no remaining issues)
  3. Only mark task as complete if lint passes with 0 errors/warnings
- **Backend Quality**: Before completing ANY BE task, MUST run:
  1. `cd be && ./mvnw checkstyle:check` (verify Java code style compliance)
  2. Only mark task as complete if checkstyle passes or violations are documented

## Architecture

- **be/**: Spring Boot 3.2.x backend (Java 21+) with Spring Security 6.x, JPA, PostgreSQL 15.x, Redis 7.x. REST API at `/api/*`
- **fe/**: React 18.x + TanStack Router + Vite + Vitest + TypeScript + Tailwind CSS + Axios frontend (port 5173)
- **AI Integration**: Groq API (llama-3.1-8b-instant) or Ollama (llama3.2:3b) for translation evaluation via AIService
- **TTS Integration**: ttsforfree.com API for high-quality word pronunciation with browser fallback
- **Key Services**: TranslationService, FeedbackService, AchievementService, TTSService
- **DB Tables**: users, exercises, submissions, achievements, progress, feedback

## API Endpoints

- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Translation: `POST /api/translate/evaluate`, `GET /api/exercises/random?difficulty=`
- User: `GET /api/users/profile`, `GET /api/users/statistics`

## Code Style

- **Backend**: Use Lombok; Spring conventions; JPA entities; services for business logic
- **Frontend**: TypeScript strict; TanStack Router; functional React; Tailwind CSS
- **Naming**: camelCase (JS/TS), PascalCase (components/classes), snake_case (DB columns)
- **Error Handling**: Backend custom exceptions; frontend try/catch with error states
- **Database**: Do NOT create actual Foreign Keys (FK) in the database - use application-level references only
- **User ID Rule (CRITICAL)**:
  - ✅ **ALWAYS** get `userId` from `AuthContext` using `const { user } = useAuth(); const userId = user?.id ?? 0;`
  - ❌ **NEVER** hardcode `userId = 1` or use default values like `userId = 1` in component props
  - ❌ **NEVER** use optional userId props with defaults: `userId?: number` with `userId = 1`
- **Commits**: Follow conventional commits format:
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `style:` Formatting, missing semicolons, etc.
  - `refactor:` Code restructuring without behavior change
  - `perf:` Performance improvements
  - `test:` Adding or updating tests
  - `build:` Build system or dependency changes
  - `ci:` CI/CD configuration
  - `chore:` Maintenance tasks
  - Example: `feat: add React Query integration for API calls`
- **Git/Commit Rule**: ❌ **NEVER** run `git commit` or `git push` until explicitly instructed by the user

## Frontend Implementation Rules (CRITICAL)

When implementing ANY frontend task, you MUST follow these rules:

### 1. Theme Compatibility (MANDATORY)

**ALWAYS use CSS variables for colors** - NEVER hardcode colors:

✅ **CORRECT**:

```tsx
style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
className="border-[var(--color-border)]"
```

❌ **WRONG**:

```tsx
style={{ backgroundColor: '#12121a', color: '#f8fafc' }}
className="bg-zinc-900 text-white"
```

**Available CSS Variables**:

- **Surfaces**: `--color-surface-dark`, `--color-surface`, `--color-surface-light`, `--color-surface-elevated`
- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-highlight`
- **Primary/Accent**: `--color-primary`, `--color-primary-light`, `--color-primary-dark`, `--color-accent`
- **Semantic**: `--color-success`, `--color-warning`, `--color-error`
- **Borders**: `--color-border`

**4 Themes** (must work with all):

- **midnight** 🌙 - Purple/cyan (dark)
- **sunrise** 🌅 - Amber/orange (warm dark)
- **arctic** ❄️ - Blue/teal (cool)
- **desert** 🏜️ - Warm light theme

### 2. Component Library (MANDATORY)

**Prefer shadcn/ui components** when available:

- Check `/fe/src/components/ui/` for existing components
- Use shadcn Button, Card, Dialog, Tooltip, etc.
- Only create custom components when shadcn doesn't provide the needed functionality

**Tailwind CSS**:

- Use Tailwind utility classes for layout/spacing
- Combine with CSS variables for colors: `className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)' }}`
- Avoid inline RGB values: ❌ `bg-[#123456]`

### 3. Responsive Design

- Mobile-first approach
- Use responsive classes: `sm:`, `md:`, `lg:`, `xl:`
- Test on different screen sizes
- Hide text on mobile when needed: `<span className="hidden sm:inline">Text</span>`

### 4. Accessibility

- Use semantic HTML
- Add `aria-label` for icon-only buttons
- Ensure keyboard navigation works
- Color contrast meets WCAG standards (handled by CSS variables)

### 5. Frontend Quality Checklist

Before completing ANY frontend task:

1. ✅ **Test with all 4 themes** (midnight, sunrise, arctic, desert)
2. ✅ **Run linter**: `cd fe && bun run lint:fix` then `bun run lint`
3. ✅ **Check responsive**: Test on mobile/tablet/desktop sizes
4. ✅ **Verify no hardcoded colors**: Search for `#` in your code
5. ✅ **Use shadcn/ui**: Prefer existing components over custom ones

## Release Process

- **Versioning**: Automated via semantic-release based on conventional commits
- **Release Commands**:
  - `bun run release:dry` - Test release process without publishing
  - `bun run release` - Create new release (auto-generates version, CHANGELOG.md, Git tag)
- **Workflow**: Commits trigger semantic-release to analyze changes and auto-bump version (major/minor/patch)
- **CHANGELOG**: Automatically generated in CHANGELOG.md from commit messages
- **GitHub Integration**: Releases published to GitHub Releases with auto-generated notes

## Frontend Design Rule (CRITICAL)

**MANDATORY**: Before implementing ANY frontend task (components, pages, layouts, styling, UI updates), you MUST:

1. **Load the `frontend-design` skill** using the `skill` tool with `name: "frontend-design"`
2. **Follow ALL instructions** from the loaded skill for implementation
3. This applies to:
   - Creating new components
   - Modifying existing components
   - Building pages or layouts
   - Updating styles or UI elements
   - Any visual/interactive frontend work

**Purpose**: Ensures high-quality, production-grade interfaces that avoid generic AI aesthetics.

**Example workflow**:

```
User: "Create a dashboard component"
Agent: [Loads frontend-design skill] → [Implements following skill guidelines]

User: "Update the login page styling"
Agent: [Loads frontend-design skill] → [Updates following skill guidelines]
```

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" -t bug|feature|task -p 0-4 --json
bd create "Issue title" -p 1 --deps discovered-from:bd-123 --json
bd create "Subtask" --parent <epic-id> --json  # Hierarchical subtask (gets ID like epic-id.1)
```

**Claim and update:**

```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`
6. **Commit together**: Always commit the `.beads/issues.jsonl` file together with the code changes so issue state stays in sync with code state

### CLI Help

Run `bd <command> --help` to see all available flags for any command.
For example: `bd create --help` shows `--parent`, `--deps`, `--assignee`, etc.

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ✅ Store AI planning docs in `history/` directory
- ✅ Run `bd <cmd> --help` to discover available flags
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems
- ❌ Do NOT clutter repo root with planning documents

For more details, see README.md and QUICKSTART.md.
