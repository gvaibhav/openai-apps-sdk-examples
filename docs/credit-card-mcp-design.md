# Credit Card Benefits MCP Server - Architecture Design

## Overview

Designing an MCP server for comparing credit card benefits (Amex vs Visa) that integrates with ChatGPT.

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
credit-cards-mcp-server/
├── main.py                    # FastAPI app with MCP endpoints
├── tools/
│   ├── __init__.py
│   ├── list_cards.py         # List available cards
│   ├── get_card_benefits.py  # Get benefits for specific card
│   ├── compare_cards.py      # Compare multiple cards
│   └── search_benefits.py    # Search benefits by category
├── data/
│   ├── cards_data.py         # Card definitions
│   ├── benefits_data.py      # Benefits database
│   └── categories.py         # Benefit categories
├── widgets/
│   └── src/
│       ├── card-detail/      # Single card view
│       ├── comparison-table/ # Side-by-side comparison
│       └── benefits-list/    # Benefits listing
└── requirements.txt
```

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
from pydantic import BaseModel
from typing import List, Optional

class Card(BaseModel):
    id: str
    name: str
    issuer: str  # "amex", "visa", "mastercard"
    annual_fee: float
    category: str  # "travel", "cashback", "business"
    image_url: Optional[str]
    application_url: Optional[str]

class Benefit(BaseModel):
    id: str
    category: str  # "travel", "dining", "shopping", "protection"
    name: str
    description: str
    estimated_value: float
    terms: Optional[str]

class CardWithBenefits(BaseModel):
    card: Card
    benefits: List[Benefit]
    total_benefit_value: float
```

---

## MCP Server Implementation Structure

### **main.py**

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from tools.list_cards import list_cards_tool
from tools.get_card_benefits import get_card_benefits_tool
from tools.compare_cards import compare_cards_tool
from tools.search_benefits import search_benefits_tool

app = FastAPI()

# MCP endpoints
@app.get("/mcp")
async def mcp_sse_stream():
    """SSE stream endpoint for MCP protocol"""
    # Implementation for SSE transport
    pass

@app.post("/mcp/messages")
async def mcp_messages(sessionId: str):
    """Message endpoint for tool calls"""
    # Route to appropriate tool handler
    pass

# Tool registry
TOOLS = {
    "list_cards": list_cards_tool,
    "get_card_benefits": get_card_benefits_tool,
    "compare_cards": compare_cards_tool,
    "search_benefits": search_benefits_tool
}
```

### **tools/compare_cards.py**

```python
from typing import List
from data.cards_data import get_card_by_id
from data.benefits_data import get_benefits_for_card

async def compare_cards_tool(card_ids: List[str]) -> dict:
    """Compare multiple credit cards"""

    # Fetch card data
    cards = [get_card_by_id(card_id) for card_id in card_ids]

    # Fetch benefits for each card
    comparison_data = []
    for card in cards:
        benefits = get_benefits_for_card(card.id)
        comparison_data.append({
            "card": card,
            "benefits": benefits,
            "total_value": sum(b.estimated_value for b in benefits)
        })

    # Build comparison matrix
    comparison_matrix = build_comparison_matrix(comparison_data)

    # Return with widget metadata
    return {
        "content": [
            {
                "type": "text",
                "text": f"Comparing {len(cards)} cards..."
            }
        ],
        "_meta": {
            "openai/outputTemplate": {
                "type": "html",
                "source": "http://localhost:4444/assets/comparison-table-[hash].html",
                "data": comparison_matrix
            }
        }
    }
```

---

## Widget Design

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
