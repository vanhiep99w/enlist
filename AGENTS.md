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

- **be/**: Spring Boot 3.2.x backend (Java 17+) with Spring Security 6.x, JPA, PostgreSQL 15.x, Redis 7.x. REST API at `/api/*`
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

### Auto-Sync

bd automatically syncs with git:
- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### GitHub Copilot Integration

If using GitHub Copilot, also create `.github/copilot-instructions.md` for automatic instruction loading.
Run `bd onboard` to get the content, or see step 2 of the onboard instructions.

### MCP Server (Recommended)

If using Claude or MCP-compatible clients, install the beads MCP server:

```bash
pip install beads-mcp
```

Add to MCP config (e.g., `~/.config/claude/config.json`):
```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

Then use `mcp__beads__*` functions instead of CLI commands.

### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, IMPLEMENTATION.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store ALL AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

**Benefits:**
- ✅ Clean repository root
- ✅ Clear separation between ephemeral and permanent documentation
- ✅ Easy to exclude from version control if desired
- ✅ Preserves planning history for archeological research
- ✅ Reduces noise when browsing the project

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
