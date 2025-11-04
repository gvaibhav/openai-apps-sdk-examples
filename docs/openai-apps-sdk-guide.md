# OpenAI Apps SDK Examples - Complete Guide

## Repository Overview

The `openai/openai-apps-sdk-examples` repository provides example applications and UI components for building apps that integrate with ChatGPT using the Apps SDK.

**Repository URL**: https://github.com/openai/openai-apps-sdk-examples

---

## What is the Apps SDK?

The Apps SDK is a framework that allows developers to create applications that run inside ChatGPT, using the Model Context Protocol (MCP) to connect AI applications to external tools, data, and user interfaces.

---

## Model Context Protocol (MCP)

MCP is an open specification for connecting large language model clients to external tools, data, and user interfaces.

### Key Features:
- **Exposes Tools**: An MCP server exposes tools that a model can call during a conversation
- **Returns Rich UI**: Results can include extra metadata (inline HTML) that the Apps SDK uses to render rich UI components (widgets)
- **Keeps Everything in Sync**: MCP keeps the server, model, and UI synchronized
- **Transport Agnostic**: Works over Server-Sent Events or streaming HTTP

### Three Core Capabilities:

1. **List Tools**: Server advertises supported tools with their JSON Schema contracts
2. **Call Tools**: Model selects a tool, server executes the action
3. **Return Widgets**: Returns embedded resources in response metadata for inline rendering in ChatGPT

---

## Repository Structure

```
openai-apps-sdk-examples/
├── src/                          # Source code for widget examples
├── assets/                       # Generated HTML, JS, CSS bundles
├── pizzaz_server_node/          # MCP server (TypeScript)
├── pizzaz_server_python/        # MCP server (Python)
├── solar-system_server_python/  # Python MCP server for 3D solar system
└── build-all.mts                # Vite build orchestrator
```

---

## Example Apps Included

1. **Pizzaz** (Node.js & Python)
   - Pizza-themed collection of tools and components
   - Demonstrates various UI widgets

2. **Solar System** (Python)
   - 3D solar system viewer
   - Interactive planetary visualization

---

## Requirements

- **Node.js 18+** (for building widgets only)
- **pnpm** (recommended) or npm/yarn (for building widgets only)
- **Python 3.10+** (for running Python MCP servers)

---

## Setup and Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples
pnpm install
```

### 2. Build Widget Assets

```bash
pnpm run build
```

This runs `build-all.mts`, producing versioned `.html`, `.js`, and `.css` files inside `assets/`.

### 3. Development Mode (Optional)

For local iteration:
```bash
pnpm run dev
```

### 4. Serve Assets

After building, start the static file server:
```bash
pnpm run serve
```

Assets are exposed at `http://localhost:4444` with CORS enabled.

---

## Running MCP Servers

### Pizzaz Server (Node.js)

```bash
cd pizzaz_server_node
pnpm start
```

### Pizzaz Server (Python)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r pizzaz_server_python/requirements.txt
uvicorn pizzaz_server_python.main:app --port 8000
```

### Solar System Server (Python)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r solar-system_server_python/requirements.txt
uvicorn solar-system_server_python.main:app --port 8000
```

**Note**: You can reuse the same virtual environment for all Python servers.

---

## Adding Apps to ChatGPT

1. Enable **developer mode** in ChatGPT
2. Add your apps in **Settings > Connectors**

### Local Development with ngrok

To test locally without deploying:

```bash
ngrok http 8000
```

You'll get a public URL like: `https://<custom_endpoint>.ngrok-free.app/mcp`

Add this URL to ChatGPT in Settings > Connectors.

---

## Do You Need Node.js?

### If You Only Want to Use Python Server:

**NO**, if `assets/` folder already contains built files. The Python server just serves pre-built assets.

### If You Need to Build/Modify Widgets:

**YES**, but only once. Node.js is needed to build widgets from `src/` into `assets/`.

---

## The `src/` Folder Explained

### What is it?

The `src/` folder contains **source code for UI widgets** - React components, HTML, CSS, and JavaScript files that define interactive UI elements.

### When to Update `src/`:

- Create a new widget/UI component
- Modify existing widget appearance or behavior
- Add new interactive features

### Build Process Flow:

```
src/ (source code)
  ↓
[pnpm run build] ← Uses Vite bundler
  ↓
assets/ (compiled bundles: .html, .js, .css)
  ↓
[MCP Server serves these assets]
  ↓
ChatGPT renders the widgets
```

---

## Creating New Assets for a Custom MCP Server

### Step 1: Add Your Widget to `src/`

Create a new folder in `src/`:

```
src/
  my-custom-widget/
    index.tsx (or .jsx, .html)
    styles.css
```

Components dropped into `src/` are automatically picked up by the build script.

### Step 2: Build the Assets

```bash
pnpm run build
```

Generates:
```
assets/
  my-custom-widget-[hash].html
  my-custom-widget-[hash].js
  my-custom-widget-[hash].css
```

### Step 3: Reference in Your MCP Server

In your Python MCP server tool response:

```python
{
    "content": [
        {
            "type": "text",
            "text": "Here's your data..."
        }
    ],
    "_meta": {
        "openai/outputTemplate": {
            "type": "html",
            "source": "http://localhost:4444/assets/my-custom-widget-[hash].html",
            "data": {
                # Your widget's data
                "title": "My Data",
                "items": [...]
            }
        }
    }
}
```

---

## Example: Building a Weather MCP Server

### 1. Create Widget Source

`src/weather-dashboard/index.tsx`:
```tsx
export default function WeatherDashboard({ data }) {
  return (
    <div>
      <h1>{data.city}</h1>
      <p>Temperature: {data.temp}°F</p>
      <p>Condition: {data.condition}</p>
    </div>
  );
}
```

### 2. Build

```bash
pnpm run build
```

### 3. Create MCP Server

`weather_server_python/main.py`:
```python
@app.post("/mcp/v1/tools/call")
async def get_weather(location: str):
    weather_data = fetch_weather(location)

    return {
        "content": [...],
        "_meta": {
            "openai/outputTemplate": {
                "type": "html",
                "source": "http://localhost:4444/assets/weather-dashboard-[hash].html",
                "data": weather_data
            }
        }
    }
```

### 4. Serve Assets

```bash
pnpm run serve
```

### 5. Run Server

```bash
uvicorn weather_server_python.main:app --port 8000
```

---

## Switching Between MCP Servers

### What Changes:
- **Tools Available**: Different servers expose different tools
- **Widget Assets**: Each server points to specific widget bundles
- **Data & Logic**: Business logic is specific to each server

### What Stays the Same:
- **`assets/` folder**: Collection of pre-built UI widgets
- **Architecture**: MCP protocol, `_meta.openai/outputTemplate` metadata
- **Widget Rendering**: ChatGPT Apps SDK hydrates widgets the same way

### Key Insight:
- MCP server = **Backend API**
- Widgets in `assets/` = **Frontend UI components**
- You can swap servers freely and reuse/mix widgets

---

## Customization

### Customize Widget Data:
Edit handlers in:
- `pizzaz_server_node/src`
- `pizzaz_server_python/main.py`
- `solar-system_server_python/main.py`

### Create New Components:
Drop new entries into `src/` - they're automatically picked up by the build script.

---

## Key Points

✅ **Node.js only needed for building** - Python server serves pre-built assets
✅ **Assets are versioned/hashed** - Prevents caching issues
✅ **Widgets are self-contained** - Include HTML, JS, and CSS
✅ **Decoupled architecture** - Reuse widgets across different servers
✅ **Each widget is independent** - Can mix and match as needed

---

## License

This project is licensed under the MIT License.

---

## Contributing

Issues and PRs are welcome, but note that not all suggestions may be reviewed.

---

## Additional Resources

- **OpenAI Platform Documentation**: https://platform.openai.com/docs
- **Developer Mode Guide**: https://platform.openai.com/docs/guides/developer-mode
- **ngrok**: https://ngrok.com/
