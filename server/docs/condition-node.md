# 🔀 Condition Node / If-Else Router Module

**Complete implementation guide for the Condition/If-Else routing module in AutoDesk workflow automation platform.**

---

## 📋 Overview

The Condition Node enables users to create branching logic in workflows by evaluating rules against execution context data and routing to either a **True** or **False** branch.

**Key Features:**

- Multi-rule evaluation with AND/OR logic
- Safe template variable resolution (`{{context.payload.email}}`)
- Type coercion and multiple comparison operators
- Visual True/False output handles in workflow editor
- Secure rule evaluation (no `eval()`)
- Detailed execution logging with sensitive data masking

---

## 🏗️ Architecture

### Backend Components

#### 1. **Condition Evaluator** (`server/src/engine/resolvers/conditionEvaluator.js`)

Core rule evaluation engine with safe variable resolution and type coercion.

**Key Functions:**

```javascript
// Evaluate all rules in condition config
evaluateCondition(config, context) → boolean

// Resolve template variables
resolveTemplate(template, context) → string

// Evaluate single rule
evaluateRule(rule, context) → boolean

// Validate condition config
validateConditionConfig(config) → { valid: boolean, error: string | null }

// Mask sensitive fields in logs
maskSensitiveFields(rule) → object
```

#### 2. **Condition Handler** (`server/src/engine/handlers/condition.handler.js`)

Executes condition nodes and returns routing decision.

```javascript
export default async function conditionHandler(action, context, log)
  // Returns: { result: boolean, branchTaken: "true" | "false", ... }
```

#### 3. **Execute Node Updates** (`server/src/engine/executeNode.js`)

Modified to support condition-aware edge routing:

```javascript
function pickNextEdges(nodeId, result, edges, actionType)
  // For condition nodes: filter edges by sourceHandle (true/false)
  // For regular nodes: follow all outgoing edges
```

#### 4. **Workflow Controller** (`server/src/controllers/workflowController.js`)

Added validation for condition node configs in workflow updates.

```javascript
function validateWorkflowConfig(nodes, actions)
  // Validates all condition nodes before saving
```

---

### Frontend Components

#### 1. **ConditionNode** (`client/src/components/shared/ConditionNode.jsx`)

Visual representation with two labeled output handles.

**Features:**

- Single input handle (top)
- Two output handles (bottom): True (green) and False (red)
- Branch indicators below node label
- Consistent styling with other action nodes

#### 2. **ConditionConfig** (`client/src/configs/ConditionConfig.jsx`)

Interactive rule builder UI.

**Features:**

- Condition name input
- Mode selection (ALL/ANY)
- Rule builder with:
  - Left value (variable or literal)
  - Operator dropdown
  - Right value and type selector
  - Add/Remove rule buttons
- Example helpers and documentation
- Input validation

#### 3. **useConditionSaveHandler** (`client/src/hooks/useConditionSaveHandler.js`)

Hook for saving and loading condition configurations.

```javascript
const { saveConditionConfig, loadConditionConfig } = useConditionSaveHandler();

// Save condition to server
await saveConditionConfig(workflowId, condition, nodeId);

// Load condition from action
const config = loadConditionConfig(action);
```

---

## 📊 Data Flow

### Condition Configuration Schema

```json
{
  "type": "condition",
  "name": "If user is premium",
  "enabled": true,
  "config": {
    "mode": "all" | "any",
    "rules": [
      {
        "left": "{{context.payload.user.plan}}",
        "operator": "eq" | "neq" | "gt" | "gte" | "lt" | "lte" |
                    "contains" | "not_contains" | "starts_with" | "ends_with" |
                    "exists" | "not_exists" | "regex",
        "right": "premium",
        "rightType": "string" | "number" | "boolean" | "json" | "null"
      }
    ]
  }
}
```

### Execution Flow

```
1. Workflow Trigger (webhook/schedule)
   ↓
2. executeWorkflow() builds context
   ↓
3. executeNode() encounters condition node
   ↓
4. Calls conditionHandler(action, context)
   ↓
5. Evaluates all rules:
   a) Resolve template variables ({{...}})
   b) Coerce right value to target type
   c) Perform comparison
   d) Apply mode logic (all/any)
   ↓
6. Returns { result: true/false, branchTaken: "true"/"false" }
   ↓
7. pickNextEdges() filters:
   - If result=true: follow edges with sourceHandle="true"
   - If result=false: follow edges with sourceHandle="false"
   ↓
8. Continue execution on chosen branch
   ↓
9. Log execution step with:
   - Node ID and name
   - Evaluated rules (masked)
   - Result (true/false)
   - Branch taken
```

---

## 🎯 Operators & Behavior

### Comparison Operators

| Operator       | Type         | Behavior                          | Example                                    |
| -------------- | ------------ | --------------------------------- | ------------------------------------------ |
| `eq`           | All          | Equality (with numeric coercion)  | `5 == "5"` → true                          |
| `neq`          | All          | Not equal                         | `"admin" != "user"` → true                 |
| `gt`           | Numeric      | Greater than                      | `10 > 5` → true                            |
| `gte`          | Numeric      | Greater or equal                  | `5 >= 5` → true                            |
| `lt`           | Numeric      | Less than                         | `3 < 5` → true                             |
| `lte`          | Numeric      | Less or equal                     | `5 <= 5` → true                            |
| `contains`     | String/Array | String contains or array includes | `"hello" contains "ell"` → true            |
| `not_contains` | String/Array | Opposite of contains              | `"hello" not_contains "x"` → true          |
| `starts_with`  | String       | String starts with                | `"hello" starts_with "he"` → true          |
| `ends_with`    | String       | String ends with                  | `"hello" ends_with "lo"` → true            |
| `exists`       | All          | Value is not undefined/null       | `exists` (right value ignored)             |
| `not_exists`   | All          | Value is undefined/null           | `not_exists` (right value ignored)         |
| `regex`        | String       | Regex pattern match               | `/^[a-z]+@/ matches "test@example"` → true |

### Mode Logic

- **ALL (AND)**: All rules must evaluate to true
- **ANY (OR)**: At least one rule must evaluate to true

---

## 📝 Template Variables

### Supported Variable Paths

```javascript
{
  {
    context.payload;
  }
} // Top-level webhook payload
{
  {
    context.payload.email;
  }
} // Nested object properties
{
  {
    context.payload.user.plan;
  }
} // Deep nesting with dot notation
{
  {
    context.payload.items[0];
  }
} // Array access (partial support)
{
  {
    context.previousNode.output;
  }
} // Previous node outputs (if stored)
```

### Variable Resolution Algorithm

1. Extract path between `{{` and `}}`
2. Split by `.` for nested access
3. Walk through object hierarchy
4. Return `undefined` if path doesn't exist
5. Return original placeholder if resolution fails

### Example Payloads

```json
{
  "context": {
    "payload": {
      "email": "user@example.com",
      "user": {
        "id": 123,
        "plan": "premium",
        "credits": 1000
      },
      "items": [{ "name": "Item 1", "price": 50 }]
    }
  }
}
```

**Resolutions:**

- `{{context.payload.email}}` → `"user@example.com"`
- `{{context.payload.user.plan}}` → `"premium"`
- `{{context.payload.user.credits}}` → `1000`
- `{{context.payload.nonexistent}}` → `undefined` → false for `exists`

---

## 🔒 Security & Validation

### Template Resolution Safety

- **No `eval()`**: Uses safe dot-notation parsing
- **No Function Execution**: Template values treated as strings
- **Type Coercion**: Explicit, controlled type conversion
- **Regex Validation**: Wrapped in try-catch, invalid patterns → false

### Sensitive Field Masking

Fields automatically masked in logs:

- `password`, `token`, `secret`, `api_key`, `apikey`, `auth`, `credential`

```javascript
// Before logging
{ left: "{{context.user.password}}", right: "12345" }

// After masking
{ left: "{{***}}", right: "***" }
```

### Input Validation

**Workflow Update Validation:**

- Condition config required for each condition node
- Rules array must be non-empty
- Each rule must have:
  - `left`: non-empty string
  - `operator`: valid operator from enum
  - `right`: required (except for exists/not_exists)
  - `rightType`: valid type or omitted

**API Error Responses:**

```json
{
  "success": false,
  "message": "Condition node 'Check plan': 'left' must be a non-empty string"
}
```

---

## 💾 Database Schema Integration

### Workflow Model

Condition nodes stored in workflow's `nodes[]` and `actions[]`:

```javascript
// nodes[] - Visual representation
{
  id: "node_123",
  type: "condition",
  position: { x: 100, y: 200 },
  data: {
    label: "If user is premium",
    actionType: "condition",
    config: { ... }  // Optional in data
  }
}

// actions[] - Configuration
{
  nodeId: "node_123",
  type: "condition",
  service: "condition",
  config: {
    mode: "all",
    rules: [...]
  }
}
```

### Edge Model

Condition edges include `sourceHandle`:

```javascript
{
  id: "edge_456",
  source: "node_123",           // Condition node
  target: "node_789",           // Next action
  sourceHandle: "true",         // "true" or "false"
  targetHandle: undefined       // Standard target
}
```

---

## 🎨 Frontend Integration

### Module Registration

**Automatically included in ModulesPanel** via `actionStyles`:

```javascript
// client/src/utils/actionStyles.js
condition: {
  label: "Condition",
  color: "#8b5cf6",
  gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  border: "2px solid #8b5cf6",
  icon: FaCodeBranch,
}
```

### Node Type Registration

```javascript
// client/src/pages/dashboard/WorkflowEditor.jsx
const nodeTypes = {
  custom: CustomNode,
  condition: ConditionNode, // ← New
  trigger: CustomNode,
  action: CustomNode,
};
```

### Configuration Panel Registration

```javascript
{activeNode?.actionType === "condition" ? (
  <ConditionConfig
    selectedNode={{ id, data }}
    onSave={handleConditionSave}
    onClose={handleClose}
  />
) : ...}
```

---

## 🧪 Testing Examples

### Test Case 1: Simple Equality

**Setup:**

```javascript
const condition = {
  mode: "all",
  rules: [
    {
      left: "{{context.payload.plan}}",
      operator: "eq",
      right: "premium",
      rightType: "string",
    },
  ],
};

const context = { payload: { plan: "premium" } };
```

**Result:** `true` ✓

---

### Test Case 2: Numeric Comparison with Type Coercion

**Setup:**

```javascript
const condition = {
  mode: "all",
  rules: [
    {
      left: "{{context.payload.age}}",
      operator: "gte",
      right: "18",
      rightType: "number",
    },
  ],
};

const context = { payload: { age: 25 } };
```

**Result:** `true` ✓ (25 >= 18)

---

### Test Case 3: AND Logic (Multiple Rules)

**Setup:**

```javascript
const condition = {
  mode: "all",
  rules: [
    {
      left: "{{context.payload.plan}}",
      operator: "eq",
      right: "premium",
      rightType: "string",
    },
    {
      left: "{{context.payload.credits}}",
      operator: "gte",
      right: "100",
      rightType: "number",
    },
  ],
};

const context = { payload: { plan: "premium", credits: 150 } };
```

**Result:** `true` ✓ (both rules true)

---

### Test Case 4: OR Logic (ANY mode)

**Setup:**

```javascript
const condition = {
  mode: "any",
  rules: [
    {
      left: "{{context.payload.plan}}",
      operator: "eq",
      right: "admin",
      rightType: "string",
    },
    {
      left: "{{context.payload.role}}",
      operator: "eq",
      right: "moderator",
      rightType: "string",
    },
  ],
};

const context = { payload: { plan: "user", role: "moderator" } };
```

**Result:** `true` ✓ (second rule true)

---

### Test Case 5: Existence Check

**Setup:**

```javascript
const condition = {
  mode: "all",
  rules: [
    {
      left: "{{context.payload.email}}",
      operator: "exists",
      right: null,
      rightType: "null",
    },
  ],
};

const context = { payload: { email: "user@example.com" } };
```

**Result:** `true` ✓ (email exists)

---

### Test Case 6: Regex Pattern

**Setup:**

```javascript
const condition = {
  mode: "all",
  rules: [
    {
      left: "{{context.payload.email}}",
      operator: "regex",
      right: "^[a-zA-Z]+@gmail\\.com$",
      rightType: "string",
    },
  ],
};

const context = { payload: { email: "john@gmail.com" } };
```

**Result:** `true` ✓ (matches regex)

---

## 📚 Usage Examples

### Example 1: Premium User Email

**Scenario:** Send premium notification only to premium users

```javascript
Condition Config:
- Name: "Is Premium User"
- Mode: ALL
- Rules:
  Left: {{context.payload.user.plan}}
  Operator: eq
  Right: premium
  Type: string

True Branch → Send Email (Premium offer)
False Branch → Send SMS (Free plan promotion)
```

---

### Example 2: High-Value Order

**Scenario:** Apply different processing for high-value orders

```javascript
Condition Config:
- Name: "Order Value > 1000"
- Mode: ALL
- Rules:
  Left: {{context.payload.order.total}}
  Operator: gt
  Right: 1000
  Type: number

True Branch → Manual Review
False Branch → Auto-process
```

---

### Example 3: Multiple Criteria (AND)

**Scenario:** Send to support if user has issue AND no active subscription

```javascript
Condition Config:
- Name: "Needs Support"
- Mode: ALL
- Rules:
  [1] Left: {{context.payload.hasIssue}}
      Operator: eq
      Right: true
      Type: boolean

  [2] Left: {{context.payload.subscription.status}}
      Operator: neq
      Right: active
      Type: string

True Branch → Route to Support
False Branch → Self-service
```

---

### Example 4: OR Logic

**Scenario:** Trigger alert if user is admin OR has security flag

```javascript
Condition Config:
- Name: "Security Check"
- Mode: ANY
- Rules:
  [1] Left: {{context.payload.role}}
      Operator: eq
      Right: admin
      Type: string

  [2] Left: {{context.payload.flags.security_alert}}
      Operator: eq
      Right: true
      Type: boolean

True Branch → Alert Security Team
False Branch → Continue Normal Flow
```

---

## 🐛 Troubleshooting

### Issue: Condition node shows no output

**Solution:** Ensure both true and false edges are connected or one edge per branch

---

### Issue: Template variables not resolving

**Check:**

1. Variable path spelled correctly: `{{context.payload.email}}`
2. Path exists in webhook payload
3. No typos in object keys (case-sensitive)

---

### Issue: Type coercion unexpected

**Note:**

- `"5" == 5` (eq operator coerces to number) → true
- For strict comparison, ensure both sides same type
- `rightType` must match intended comparison type

---

### Issue: Workflow validation fails on save

**Check error message:**

- "rules array is empty" → Add at least one rule
- "Invalid operator" → Select from dropdown
- "left must be a string" → Use template or literal string

---

## 🚀 Performance Considerations

- **Execution Cost**: 1 credit per workflow execution (includes condition evaluation)
- **Rule Evaluation**: O(n) where n = number of rules
- **No Loops**: Conditions cannot create infinite loops (linear DAG)
- **Async Safety**: All rule resolution is synchronous, safe within async context

---

## 🔮 Future Enhancements

- [ ] Switch nodes (3+ branches)
- [ ] Nested conditions
- [ ] Complex nested object queries
- [ ] Custom functions in rules
- [ ] Condition templates/presets
- [ ] Advanced analytics on branch taken

---

## 📖 Additional Resources

- **Execution Engine**: `server/src/engine/executeWorkflow.js`
- **Template Resolution**: `server/src/engine/resolvers/conditionEvaluator.js`
- **Frontend Editor**: `client/src/pages/dashboard/WorkflowEditor.jsx`
- **Test Suite**: (Add Jest tests to `server/__tests__/condition.test.js`)

---

**Last Updated:** February 1, 2026
