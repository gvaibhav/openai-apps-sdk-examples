# AI Agent Instructions for Apps SDK Examples

## Architecture Overview

This is a **monorepo** showcasing OpenAI Apps SDK widgets and MCP servers. The key architectural pattern:

1. **Widget UI components** (`src/`) → built into standalone HTML bundles (`assets/`)
2. **MCP servers** (Node/Python) → serve widgets as tool responses to ChatGPT
3. **Apps SDK integration** → widgets read `window.openai` globals for bidirectional communication

### Data Flow
```
ChatGPT → MCP Server Tool Call → Returns HTML + metadata → Apps SDK renders widget
Widget ← window.openai globals ← Apps SDK ← MCP Server structured response
```

## Critical Build System

### Multi-Entry Widget Bundler (`build-all.mts`)
- Auto-discovers `src/**/index.{tsx,jsx}` entries (e.g., `src/pizzaz/index.jsx`)
- Emits one JS and one CSS per widget and writes HTML wrappers referencing the hashed files: `assets/pizzaz-2d2b.js/.css` and `assets/pizzaz.html`
- Hash is derived from `package.json` version (first 4 chars of SHA-256)
- Creates both hashed (`pizzaz-2d2b.html`) and non-hashed (`pizzaz.html`) HTML; both reference hashed JS/CSS
- Servers dynamically load the latest hashed HTML for each widget using a glob fallback
- **Targets array controls builds**: update `targets` in `build-all.mts` to include any new widget folder name, or it won’t be bundled
- **BASE_URL controls absolute asset URLs**: set `BASE_URL` before building to point HTML `<script>`/`<link>` tags to the right host (defaults to `http://localhost:4444`)
- **Must run `pnpm run build`** before starting any MCP server—servers will fail at runtime if assets are missing
- Assets are **gitignored** and must be built locally before running servers

### Development vs Production
- **Dev**: `pnpm run dev` → Vite dev server at `http://localhost:4444` with HMR and multi-entry endpoints (visit `/{name}.html`, e.g. `/pizzaz.html`)
- **Build**: `pnpm run build` → Generates production bundles in `assets/`
- **Serve static**: `pnpm run serve` → Hosts `assets/` at `:4444` for testing (production bundles)

## MCP Server Patterns

### Node Server (`pizzaz_server_node/`)
- Uses `@modelcontextprotocol/sdk` official TypeScript SDK
- SSE transport over HTTP
- Widget HTML loaded from `../../assets/` using glob fallback for hashed files
- Metadata keys: `openai/outputTemplate`, `openai/toolInvocation/invoking`, `openai/widgetAccessible`

### Python Servers (`pizzaz_server_python/`, `solar-system_server_python/`)
- Uses `mcp.server.fastmcp.FastMCP` from official `mcp` package (NOT `modelcontextprotocol` on PyPI)
- Streamable HTTP transport via FastAPI + uvicorn (no SSE endpoint)
- **Critical**: Run from server directory (`cd pizzaz_server_python`) with `uvicorn main:app` NOT `uvicorn pizzaz_server_python.main:app` (module import fails on Windows due to hyphenated folder names)
- Widget HTML loading: same `@lru_cache` pattern as Node, reads from `../assets/`
- MIME type for widgets: `"text/html+skybridge"`

### Tool Response Structure
Every tool returns:
```python
{
  "content": [{"type": "text", "text": "Human-readable confirmation"}],
  "structuredContent": {"pizzaTopping": "pepperoni"},  # Arbitrary JSON
  "_meta": {
    "openai/outputTemplate": "ui://widget/pizza-map.html",
    "openai/widgetAccessible": True,
    "openai.com/widget": {...},  # Python servers include embedded resource
    ...
  }
}
```

The `_meta.openai/outputTemplate` URI matches widget's `template_uri` to hydrate the correct UI. Python servers also embed the widget HTML in `openai.com/widget` for inline delivery.

### Tool Annotations (disable approval prompts)
Both servers disable approval prompts so widgets render immediately when tools are called:

```ts
annotations: {
  destructiveHint: false,
  openWorldHint: false,
  readOnlyHint: true,
}
```

## Widget Development Conventions

### Required Exports
Each widget entry must `export default function App()` (see `src/pizzaz/index.jsx`, `src/solar-system/solar-system.jsx`).
- Entry file creates root and renders: `createRoot(document.getElementById("${name}-root")).render(<App />)`
- Widget ID in HTML matches folder name: `<div id="pizzaz-root"></div>` for `src/pizzaz/`

### Apps SDK Integration Hooks
- `useWidgetProps<T>()` → reads `window.openai.toolOutput` (structured data from MCP server)
- `useOpenAiGlobal(key)` → reactive access to any `window.openai` property (theme, locale, displayMode, etc.)
- `useWidgetState<T>()` → persists state across ChatGPT conversation turns
- `useDisplayMode()`, `useMaxHeight()` → layout-aware responsiveness

### Theme & Styling
- All widgets use Tailwind CSS 4.x with `@tailwindcss/vite` plugin
- Globals in `src/index.css` imported by build system
- Per-widget CSS auto-discovered via glob `**/*.{css,pcss,scss,sass}` (excluding `*.module.*`)
- Dark mode: `window.openai.theme` drives `dark:` variants

### Global API (`window.openai`)
Widgets can call:
- `window.openai.callTool(name, args)` → invoke another MCP tool
- `window.openai.sendFollowUpMessage({prompt})` → append to ChatGPT conversation
- `window.openai.requestDisplayMode({mode: 'fullscreen'})` → change layout
- `window.openai.setWidgetState(state)` → persist widget state

## Developer Workflows

### Creating a New Widget
1. Add `src/my-widget/index.jsx` with `export default function App()`
2. Use `useWidgetProps<T>()` to read tool output
3. Add your folder name to the `targets` array in `build-all.mts`
4. `pnpm run build` → generates `assets/my-widget-[hash].html` and hashed JS/CSS
5. Add tool to MCP server:
   - Node: add to `widgets` array in `pizzaz_server_node/src/server.ts`
   - Python: add `PizzazWidget` to `widgets` list in `main.py`
6. Register tool with `inputSchema` and return `_meta.openai/outputTemplate: "ui://widget/my-widget.html"`

### Windows-Specific Notes
- **Pre-commit**: Install via `python -m pipx install pre-commit` (not `pnpm`)
- **Venv activation**: `.\.venv\Scripts\Activate.ps1` (not `source .venv/bin/activate`)
- **Python servers**: Must `cd` into server dir before running `uvicorn main:app` (hyphenated folder names break module imports)

### Package Management
- **Enforce pnpm**: `packageManager` field in `package.json` locks to pnpm@10.13.1
- **Python**: Use venv per server, install from `requirements.txt` in server dir
- **Pre-commit hooks**: Runs ruff (check+format), YAML/JSON validation, trailing whitespace fixes

## Testing & Debugging

### Local Testing with ChatGPT
1. Build widgets: `pnpm run build`
2. Start server: `cd pizzaz_server_node && pnpm start` (Node) or `cd pizzaz_server_python && uvicorn main:app --port 8000` (Python)
3. Expose with ngrok: `ngrok http 8000`
4. Add connector in ChatGPT Settings → Connectors → `https://<id>.ngrok-free.app/mcp`
5. Enable "More" options in ChatGPT to invoke tools

### Common Pitfalls
- **Assets missing**: MCP servers fail with `FileNotFoundError` → run `pnpm run build`
- **Module import error** (Python): Using `uvicorn solar-system_server_python.main:app` from repo root → `cd` into server dir first
- **Widget not loading**: Check `template_uri` in tool metadata matches widget ID in `build-all.mts` targets array
- **Stale bundle**: After widget code changes, re-run `pnpm run build` (hashed filenames update)

## Repository Structure
```
src/                       # Widget UI components (React + Tailwind)
  pizzaz/                  # Map widget example
  pizzaz-carousel/         # Carousel variant
  solar-system/            # 3D solar system (Three.js)
  use-widget-props.ts      # Apps SDK integration hooks
  types.ts                 # window.openai type definitions
assets/                    # Built HTML bundles (gitignored, generated by build-all.mts)
pizzaz_server_node/        # MCP server (TypeScript, official SDK)
pizzaz_server_python/      # MCP server (Python, FastMCP)
solar-system_server_python/# Separate Python server for solar system
build-all.mts              # Multi-entry Vite bundler
vite.config.mts            # Dev server with multi-entry endpoints
```

## Key Files for Understanding Patterns
- `src/use-widget-props.ts` → How widgets receive MCP tool output
- `src/types.ts` → Complete `window.openai` API surface
- `pizzaz_server_node/src/server.ts` → Node MCP server implementation
- `pizzaz_server_python/main.py` → Python FastMCP server pattern
- `build-all.mts` → Widget bundling logic (hashing from version, BASE_URL injection, HTML wrapping with hashed JS/CSS)

## External Dependencies
- **MCP SDK**: `@modelcontextprotocol/sdk` (Node), `mcp[fastapi]` (Python)
- **UI**: React 19, Tailwind CSS 4.x, Three.js (for 3D widgets)
- **Rendering**: Vite 7.x for build + dev
- **Python version**: 3.10+ required (uses match/case, new typing features)
- **Node version**: 18+ required (native fetch, node: imports)
