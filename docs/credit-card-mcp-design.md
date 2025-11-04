# Credit Card Benefits MCP Server - Architecture Design

## Overview

**Production-Ready Credit Card Benefits MCP Server with OpenAI Apps SDK Widgets**

This document describes the design and implementation of a Node.js MCP server that provides interactive credit card benefit analysis through 4 tools and 3 React widgets.

**Status**: ✅ Implemented and tested
**Implementation**: Node.js with @modelcontextprotocol/sdk v0.5.0
**Widgets**: React 19 + Tailwind CSS 4.x
**Dataset**: 5 premium travel credit cards

---

## Design Philosophy

### Key Principle: **Single MCP Server with Multiple Tools**

Rather than creating separate servers for Amex and Visa, create **ONE unified MCP server** with multiple tools that handle different aspects of credit card benefits.

**Why?**
- Easier to maintain data consistency
- Simpler deployment and versioning
- Better for comparison operations
- Single source of truth for card data
- Reduces complexity in ChatGPT integration

---

## Architecture Design

### **Option 1: Single MCP Server (RECOMMENDED)**

```
credit-cards_server_node/
├── src/
│   ├── server.ts              # MCP server with SSE transport
│   └── data/
│       ├── cards.ts           # Card dataset + utilities
│       └── types.ts           # TypeScript type definitions
├── package.json
└── README.md

src/credit-cards/
└── types.ts                   # Shared payload types

src/benefits-list/
└── index.tsx                  # Card catalog widget

src/card-detail/
└── index.tsx                  # Individual card detail widget

src/comparison-table/
└── index.tsx                  # Comparison widget

assets/                        # Build output (gitignored)
├── benefits-list-2d2b.{html,js,css}
├── card-detail-2d2b.{html,js,css}
└── comparison-table-2d2b.{html,js,css}
```

**Actual Implementation Highlights**:
- Node.js server (not Python) for consistency with example patterns
- SSE transport over HTTP (port 8000)
- Static dataset (no external APIs)
- Content-based hashing for widget assets (2d2b from package v5.0.16)
---

## Tool Boundaries

### **Tool 1: `list_cards`**
**Purpose**: List all available credit cards

**Input**:
- `issuer` (optional): "amex", "visa", "all"
- `category` (optional): "travel", "cashback", "business"

**Output**:
```json
{
  "cards": [
    {
      "id": "amex-platinum",
      "name": "American Express Platinum",
      "issuer": "amex",
      "annual_fee": 695,
      "category": "travel"
    },
    {
      "id": "visa-signature-preferred",
      "name": "Visa Signature Preferred",
      "issuer": "visa",
      "annual_fee": 95,
      "category": "travel"
    }
  ]
}
```

**Widget**: Card grid/carousel showing card images and basic info

---

### **Tool 2: `get_card_benefits`**
**Purpose**: Get detailed benefits for a specific card

**Input**:
- `card_id` (required): "amex-platinum"

**Output**:
```json
{
  "card": {
    "id": "amex-platinum",
    "name": "American Express Platinum",
    "issuer": "amex",
    "annual_fee": 695
  },
  "benefits": [
    {
      "category": "travel",
      "name": "Airport Lounge Access",
      "description": "Unlimited access to 1,400+ airport lounges",
      "value": 500
    },
    {
      "category": "travel",
      "name": "Hotel Credit",
      "description": "$200 annual hotel credit",
      "value": 200
    },
    {
      "category": "dining",
      "name": "Restaurant Credit",
      "description": "$15/month Uber Eats credit",
      "value": 180
    }
  ],
  "total_benefit_value": 880
}
```

**Widget**: Single card detail view with categorized benefits

---

### **Tool 3: `compare_cards`**
**Purpose**: Side-by-side comparison of multiple cards

**Input**:
- `card_ids` (required): ["amex-platinum", "visa-signature-preferred"]
- `comparison_type` (optional): "benefits", "fees", "rewards", "all"

**Output**:
```json
{
  "comparison": {
    "cards": [
      {
        "id": "amex-platinum",
        "name": "American Express Platinum",
        "annual_fee": 695,
        "benefits_count": 15,
        "total_benefit_value": 1400
      },
      {
        "id": "visa-signature-preferred",
        "name": "Visa Signature Preferred",
        "annual_fee": 95,
        "benefits_count": 8,
        "total_benefit_value": 500
      }
    ],
    "benefit_comparison": [
      {
        "category": "travel",
        "benefit": "Airport Lounge Access",
        "amex-platinum": "1,400+ lounges",
        "visa-signature-preferred": "Not included"
      },
      {
        "category": "travel",
        "benefit": "Travel Insurance",
        "amex-platinum": "Up to $500k",
        "visa-signature-preferred": "Up to $100k"
      }
    ],
    "winner": {
      "best_value": "amex-platinum",
      "best_for_fees": "visa-signature-preferred",
      "recommendation": "Amex Platinum offers 2.8x more benefits despite higher fee"
    }
  }
}
```

**Widget**: Comparison table with highlighting and winner badges

---

### **Tool 4: `search_benefits`**
**Purpose**: Find cards by specific benefit or category

**Input**:
- `benefit_type` (required): "airport_lounge", "hotel_credit", "travel_insurance"
- `min_value` (optional): 200

**Output**:
```json
{
  "benefit_type": "airport_lounge",
  "matching_cards": [
    {
      "card_id": "amex-platinum",
      "card_name": "American Express Platinum",
      "benefit_details": "1,400+ lounges worldwide",
      "estimated_value": 500
    }
  ]
}
```

**Widget**: Filtered card list with benefit highlights

---

## Data Flow

```
User Query in ChatGPT
        ↓
ChatGPT reasons about query
        ↓
Selects appropriate tool(s) from MCP server
        ↓
MCP Server receives tool call
        ↓
Tool handler processes request
        ↓
Fetches data from internal database/API
        ↓
Returns structured JSON + widget metadata
        ↓
ChatGPT receives response
        ↓
Apps SDK renders widget inline
        ↓
User sees rich UI with card comparison
```

---

## Control Flow

### **Scenario 1: "Show me Amex Platinum benefits"**

```
1. ChatGPT → calls `get_card_benefits` tool
   - card_id: "amex-platinum"

2. MCP Server → returns card details + benefits
   - Includes widget: card-detail component

3. ChatGPT → displays response with widget
   - User sees detailed card with all benefits
```

### **Scenario 2: "Compare Amex Platinum with Visa Signature"**

```
1. ChatGPT → calls `compare_cards` tool
   - card_ids: ["amex-platinum", "visa-signature-preferred"]

2. MCP Server → returns comparison data
   - Includes widget: comparison-table component

3. ChatGPT → displays side-by-side comparison
   - User sees interactive comparison table
```

### **Scenario 3: "Which cards have airport lounge access?"**

```
1. ChatGPT → calls `search_benefits` tool
   - benefit_type: "airport_lounge"

2. MCP Server → returns matching cards
   - Includes widget: benefits-list component

3. ChatGPT → displays filtered results
   - User sees cards with lounge access highlighted
```

---

## Data Structure Design

### **Card Model**

```python
// Actual TypeScript implementation in src/data/types.ts

export interface CardRecord {
  id: string;                    // "amex_platinum"
  name: string;                  // "American Express Platinum Card"
  shortName: string;             // "Amex Platinum"
  issuer: string;                // "amex" | "chase" | "capital_one"
  category: string;              // "premium-travel"
  annualFee: number;             // 695
  welcomeOffer: WelcomeOffer;
  benefits: Benefit[];
  earningRates: EarningRate[];
  apr: APRInfo;
  creditRequirement: string;
  bestFor: string[];
}

export interface Benefit {
  id: string;
  type: "statement_credit" | "perk" | "protection";
  category: string;              // "travel", "dining", "shopping"
  name: string;
  description: string;
  estimatedValue: number;        // Annual dollar value
  frequency?: "monthly" | "annual" | "one-time" | "ongoing";
  highlight?: boolean;           // Featured benefit
  tags?: string[];               // ["lounge", "priority_pass"]
}
```

**Implemented Cards (5 Total)**:
1. **American Express Platinum Card** - $695/year, $1,500 benefit value
2. **American Express Gold Card** - $250/year, $580 benefit value
3. **Chase Sapphire Reserve** - $550/year, $1,400 benefit value
4. **Chase Sapphire Preferred** - $95/year, $450 benefit value
5. **Capital One Venture X** - $395/year, $1,095 benefit value

---

## Implementation Details

### **Actual Tool Implementations**

All four tools implemented in `credit-cards_server_node/src/server.ts`:

#### Tool 1: `list_cards`
- **Handler**: `handleListCards()`
- **Input Schema**: `{ issuer?: string, category?: string }`
- **Widget**: `benefits-list` (ui://widget/benefits-list.html)
- **Payload**: ListCardsPayload with stats, filters, cards array

#### Tool 2: `get_card_benefits`
- **Handler**: `handleGetCardBenefits()`
- **Input Schema**: `{ card_id: string }` (required)
- **Widget**: `card-detail` (ui://widget/card-detail.html)
- **Payload**: CardDetailPayload with benefit groups, pros/cons

#### Tool 3: `compare_cards`
- **Handler**: `handleCompareCards()`
- **Input Schema**: `{ card_ids: string[], comparison_type?: "all" | "benefits" | "fees" | "rewards" }`
- **Widget**: `comparison-table` (ui://widget/comparison-table.html)
- **Payload**: ComparisonPayload with ranked cards, metric rows, highlights

#### Tool 4: `search_benefits`
- **Handler**: `handleSearchBenefits()`
- **Input Schema**: `{ benefit_type: string, min_value?: number }`
- **Widget**: `benefits-list` (reused, differentiated by resultType)
- **Payload**: ListCardsPayload with benefitMatches array

### **Widget Metadata Pattern**

Every tool response includes comprehensive Apps SDK metadata:

```typescript
function widgetMeta(widget: WidgetDefinition, overrides?: Record<string, unknown>) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
    "openai.com/widget": {
      uri: widget.templateUri,
      mimeType: "text/html+skybridge",
      text: widget.html,  // Embedded HTML for Inspector
    },
    ...overrides,
  };
}
```

**Critical Fields**:
- `openai/outputTemplate`: URI for ChatGPT to match widget
- `openai.com/widget`: Embedded HTML for MCPJam Inspector
- `openai/widgetAccessible`: Enables widget rendering in ChatGPT
- `openai/toolInvocation/*`: Status messages during tool execution

### **Widget Implementation Patterns**

All widgets follow this structure:

```tsx
import { createRoot } from "react-dom/client";
import { useWidgetProps, useWidgetState, useOpenAiGlobal } from "../hooks";

export default function App() {
  const { payload, ready, error } = useWidgetProps<PayloadType>();
  const [state, setState] = useWidgetState<StateType>("key", defaultValue);
  const theme = useOpenAiGlobal("theme");

  if (!ready || !payload) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      {/* Widget UI */}
    </div>
  );
}

// Critical: Mount React to DOM
createRoot(document.getElementById("widget-name-root")!).render(<App />);
```

**Key Hooks**:
- `useWidgetProps<T>()`: Reads `window.openai.toolOutput` (structured payload)
- `useWidgetState<T>()`: Persists state across conversation turns
- `useOpenAiGlobal()`: Reactive access to theme, locale, displayMode

---

## Build System

### **Multi-Entry Widget Bundler**

Implemented in `build-all.mts`:

```bash
# Build command
pnpm run build
```

**Build Process**:
1. Vite multi-entry build (`src/*/index.{tsx,jsx}`)
2. Generate JS/CSS bundles
3. Calculate hash from `package.json` version (SHA-256 → first 4 chars)
4. Rename files: `benefits-list.js` → `benefits-list-2d2b.js`
5. Generate HTML wrappers referencing hashed assets
6. Output to `assets/` directory

**Critical Configuration**:
- `BASE_URL`: Controls asset URL in HTML (default: `http://localhost:4444`)
- `targets` array: Must include widget folder names or they won't build
- Double-hash prevention: Skips files already ending with current hash

**Output Example**:
```
assets/
├── benefits-list-2d2b.html    (widget HTML wrapper)
├── benefits-list-2d2b.js      (196 kB → 61 kB gzip)
├── benefits-list-2d2b.css     (49 kB)
├── card-detail-2d2b.html
├── card-detail-2d2b.js        (195 kB → 60 kB gzip)
├── card-detail-2d2b.css
├── comparison-table-2d2b.html
├── comparison-table-2d2b.js   (193 kB → 60 kB gzip)
└── comparison-table-2d2b.css
```

---

## Testing
## Widget Design
### **MCPJam Inspector**

Tested with `@mcpjam/inspector@beta`:

```bash
# Terminal 1: Serve assets
pnpm run serve  # → http://localhost:4444

# Terminal 2: Start MCP server
cd credit-cards_server_node
pnpm start      # → http://localhost:8000

# Terminal 3: Launch Inspector
npx -y @mcpjam/inspector@beta
```

**Inspector Configuration**:
- Transport: SSE
- Endpoint: `http://localhost:8000/mcp`

**Test Coverage**:
- ✅ All 4 tools invokable from Inspector
- ✅ Widgets render with real data
- ✅ Card selection persists via `useWidgetState`
- ✅ Tool chaining works (list → compare → detail)
- ✅ Dark mode toggle functional
- ✅ Responsive on mobile viewports


### **Widget 1: Card Detail**
- Single card layout
- Tabbed interface: Overview | Benefits | Fees | Rewards
- Benefit categories with icons
- Estimated value calculations

### **Widget 2: Comparison Table**
- Side-by-side card comparison
- Color-coded better/worse indicators
- Expandable benefit details
- Summary scorecard at top
- Winner badges/highlights

### **Widget 3: Benefits List**
- Filterable by category
- Search functionality
- Sort by value/name
- Cards grouped by benefit

---

## Storage Strategy

### **Using Persistent Storage (window.storage)**

For user preferences and saved comparisons:

```javascript
// Save user's favorite cards
await window.storage.set('favorite_cards',
    JSON.stringify(['amex-platinum', 'visa-signature']),
    false  // personal data
);

// Save comparison history
await window.storage.set('comparison_history',
    JSON.stringify([
        {
            cards: ['amex-platinum', 'visa-signature'],
            timestamp: Date.now()
        }
    ]),
    false
);
```

---

## Best Practices

### **1. Single Source of Truth**
- Maintain card data in one location
- Benefits database with versioning
- Clear data update process

### **2. Tool Granularity**
- Each tool has ONE clear purpose
- Tools can be composed (list → detail → compare)
- Avoid overlapping functionality

### **3. Response Structure**
- Always include both text content and widget
- Text for accessibility and context
- Widget for rich interaction

### **4. Error Handling**
```python
if card_id not in cards_database:
    return {
        "content": [{
            "type": "text",
            "text": f"Card '{card_id}' not found. Available cards: {list(cards_database.keys())}"
        }],
        "isError": True
    }
```

### **5. Data Freshness**
- Cache benefit data appropriately
- Include "last_updated" timestamps
- Provide data source attribution

---

## Alternative Design: Multiple Servers (NOT RECOMMENDED)

```
amex-mcp-server/        ← Separate server for Amex
visa-mcp-server/        ← Separate server for Visa
comparison-service/     ← Third service to orchestrate
```

**Why avoid this?**
- Requires coordination between servers
- Data consistency challenges
- More complex deployment
- ChatGPT can only call one server at a time per tool call
- Difficult to maintain synchronized data

---

## Conversation Examples

### Example 1: Simple Query
```
User: "What are the benefits of Amex Platinum?"

Flow:
1. ChatGPT calls: get_card_benefits(card_id="amex-platinum")
2. Server returns: Card details + benefits list widget
3. User sees: Rich card UI with all benefits categorized
```

### Example 2: Complex Query
```
User: "Compare Amex Platinum and Visa Signature for travel benefits"

Flow:
1. ChatGPT calls: compare_cards(
     card_ids=["amex-platinum", "visa-signature"],
     comparison_type="travel"
   )
2. Server returns: Filtered comparison focusing on travel benefits
3. User sees: Side-by-side comparison table with travel category highlighted
```

### Example 3: Multi-Turn Conversation
```
User: "Show me travel cards"
→ ChatGPT calls: list_cards(category="travel")

User: "Compare the top 2"
→ ChatGPT calls: compare_cards(card_ids=["amex-platinum", "chase-sapphire"])

User: "Which is better for lounge access?"
→ ChatGPT calls: search_benefits(benefit_type="airport_lounge")
   Then references previous comparison data
```

---

## Deployment Considerations

### **Local Development**
```bash
# Start assets server
pnpm run serve  # Port 4444

# Start MCP server
uvicorn main:app --port 8000

# Expose with ngrok
ngrok http 8000
```

### **Production**
- Deploy MCP server to cloud (AWS, GCP, Azure)
- Host assets on CDN
- Use proper authentication
- Rate limiting on tool calls
- Logging and monitoring

---

## Summary

✅ **Single MCP Server** with multiple tools
✅ **Clear tool boundaries** - each tool has one job
✅ **Shared data layer** - single source of truth
✅ **Rich widgets** - comparison tables, card details, filtered lists
✅ **Composable tools** - ChatGPT can chain tool calls
✅ **Persistent storage** - save user preferences
✅ **Scalable design** - easy to add new cards/issuers

This architecture allows ChatGPT to naturally reason about credit cards and compose tool calls to answer complex user queries while providing rich, interactive UI experiences.
