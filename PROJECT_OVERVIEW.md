# AutoDesk - Workflow Automation Platform

## Complete Project Overview & Architecture

---

## 📋 Project Summary

**AutoDesk** is a full-stack workflow automation platform that enables users to create, manage, and execute complex automation workflows. The platform supports multiple integrations (Email, Google Sheets, Webhooks, etc.), scheduled execution, AI-powered workflows, team collaboration, and enterprise-grade role-based access control.

**Tech Stack:**

- **Frontend:** React 19, Vite, Redux Toolkit, React Router, TailwindCSS, React Flow (visual workflow builder)
- **Backend:** Node.js/Express 5, MongoDB with Mongoose, JWT Authentication
- **Key Libraries:** Cron scheduling, Nodemailer, Google APIs, OpenAI, JWT, bcrypt

---

## 📁 Architecture Overview

### Directory Structure

```
AutoDesk/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main routing component
│   │   ├── main.jsx       # Entry point
│   │   ├── index.css
│   │   ├── admin/         # Superadmin panel
│   │   ├── assets/
│   │   ├── components/    # Reusable UI components
│   │   ├── configs/       # Action configuration components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── sections/      # Landing page sections
│   │   ├── store/         # Redux store
│   │   └── utils/         # Helper functions
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
└── server/                # Express backend
    ├── src/
    │   ├── index.js              # Entry point
    │   ├── app.js                # Express app setup
    │   ├── controllers/          # Business logic handlers
    │   ├── models/               # MongoDB schemas
    │   ├── routes/               # API endpoints
    │   ├── services/             # External service integrations
    │   ├── engine/               # Workflow execution engine
    │   ├── middlewares/          # Auth & authorization
    │   ├── utils/                # Helper functions
    │   ├── seeds/                # Database seeders
    │   └── db/                   # Database utilities
    └── package.json
```

---

## 🗄️ Database Schema

### Core Models

#### **User Model**

Stores user account information and subscription details.

```
- name, email, password (hashed with bcrypt)
- roleId (reference to Role)
- organizationId (reference to Organization)
- subscription: { planId, planName, tier, status, dates, paymentId }
- credits: { totalCredits, usedCredits, remainingCredits, lastReset }
- timestamps
```

#### **Organization Model**

Multi-tenant support for user groups.

```
- name
- adminId (reference to User)
- users[] (array of user references)
- createdAt
```

#### **Team Model**

Sub-groups within an organization.

```
- name
- organizationId (reference to Organization)
- users[] (array of user references)
- timestamps
```

#### **Role Model**

Role-based access control system.

```
- name (Superadmin, Admin, Member, etc.)
- permissions[] { module, access }
- createdAt
```

#### **Workflow Model** 🔑

Core workflow definition and execution.

```
- userId, organizationId
- name, description, status (draft/active/archived)
- nodes[]           # Visual flow nodes
  - id, type, position, data (label, config)
- edges[]           # Node connections
- actions[]         # Action definitions
- triggers          # Trigger configuration
- timestamps
```

#### **Node Schema Structure**

```
{
  id: String,
  type: String (custom, trigger, action),
  position: { x, y },
  data: {
    label: String,
    actionType: String,
    config: Object
  }
}
```

#### **Action Schema**

```
{
  nodeId: String,
  type: String (email, webhook, schedule, delay, condition, ai_prompt, slack, etc.)
  service: String,
  config: Object,
  filters[]  # Conditional execution
}
```

#### **Schedule Model**

Cron-based workflow scheduling.

```
- userId, organizationId, workflowId
- cron (cron expression)
- frequency (hourly, daily, weekly, monthly, custom, once)
- time, minute, dayOfWeek, dayOfMonth
- runOnce, runAt, timezone
- status (active, inactive, failed)
- lastRun, nextRun
- timestamps
```

#### **Webhook Model**

Webhook trigger configuration.

```
- userId, organizationId, workflowId
- secret (unique identifier)
- url, requestMethod
- event (workflow.started, completed, failed, payment.*, custom)
- status (active, inactive, failed)
- isListening, listeningStartedAt
- samplePayload, parsedFields[]
```

#### **Email Model**

Email action configuration.

```
- workflowId, nodeId
- type: "email", service: "email"
- to (recipient)
- subject, body
- timestamps
```

#### **GoogleSheets Model**

Google Sheets integration data.

```
- workflowId, nodeId
- spreadsheetId, range
- values
- timestamps
```

#### **Integration Model**

Third-party service integrations.

```
- userId, organizationId
- service (gmail, slack, discord, github, trello, notion, zapier, webhook, custom)
- apiKey (encrypted, not returned by default)
- status (active, inactive, expired, invalid)
- timestamps
```

#### **GoogleAccount Model**

OAuth2 Google account credentials.

```
- userId
- googleId (Google's unique ID)
- email, name, picture
- accessToken, refreshToken, expiryDate
- scopes[]
- timestamps
```

#### **AIScenario Model**

AI-powered workflow scenarios (ChatGPT/Claude).

```
- userId, organizationId
- name, prompt
- response
- model (gpt-3.5-turbo, gpt-4, claude-3-*, etc.)
- status (draft, completed, failed, processing)
- timestamps
```

#### **Execution Model**

Tracks individual workflow executions.

```
- workflowId, userId, organizationId
- status (running, completed, failed, cancelled)
- startedAt, completedAt
- log, error
```

#### **WorkflowLog Model** 📊

Detailed execution logs and audit trail.

```
- executionId, workflowId, organizationId
- executedBy
- executionSteps[] {
    nodeId, stepName, action,
    status, startedAt, completedAt,
    input, output, errorMessage
  }
- status, errorMessage, finishedAt
```

#### **Notification Model**

User notifications system.

```
- userId, organizationId
- message
- type (info, success, warning, error, workflow, billing, system)
- status (unread, read)
- createdAt
```

#### **Subscription Model**

Billing & plan information.

```
- name, price, currency
- features { workflowLimit, aiRequestLimit, premiumIntegrations }
- createdAt
```

#### **Transaction Model**

Payment transaction records.

```
[Not detailed in review, for billing system]
```

---

## 🔄 Data Flow & Workflow Execution

### 1. **Workflow Creation Flow**

```
User (Frontend)
    ↓
Create Workflow (WorkflowEditor.jsx)
    ↓ [Save nodes, edges, actions]
POST /api/workflows
    ↓
workflowController.createWorkflow()
    ↓
Workflow.create() → MongoDB
    ↓ [Workflow saved in draft status]
Response: Workflow object
```

### 2. **Workflow Execution Flow** 🎯 (Core Engine)

```
Trigger Event (Webhook/Schedule)
    ↓
executeWorkflow() [executeWorkflow.js]
    ├─ buildInitialContext() - Create execution context
    ├─ Find trigger node (webhook or first node)
    ├─ Create WorkflowLog record
    ├─ Check & consume user credits
    │
    └─ executeNode() recursively
        ├─ Resolve action type from node
        ├─ resolveAction() - Load action config
        ├─ Load handler for action type
        │
        ├─ EMAIL HANDLER
        │   ├─ resolveTemplate() - Replace variables
        │   ├─ sendEmail() via Nodemailer
        │   └─ Return result
        │
        ├─ WEBHOOK HANDLER
        │   ├─ Extract webhook payload
        │   └─ Pass to context
        │
        ├─ GOOGLE SHEETS HANDLER
        │   ├─ Get authorized client
        │   ├─ Append/update sheets
        │   └─ Return result
        │
        ├─ SCHEDULE HANDLER
        │   ├─ Create cron schedule
        │   └─ Register with scheduler
        │
        ├─ Store step output in context
        ├─ Log execution step
        └─ Traverse edges to next nodes

    ↓
Save WorkflowLog (success/failed)
```

### 3. **Authentication & Authorization Flow**

```
User Registration/Login
    ↓
authController.registerUser() / login()
    ├─ Create User, Organization, Default Team
    ├─ Hash password with bcrypt
    ├─ Generate JWT token (7d expiry)
    └─ Set httpOnly cookie

Protected Route Request
    ↓
authMiddleware.protect()
    ├─ Extract JWT from cookie/header
    ├─ Verify with JWT_SECRET
    ├─ Load User + populated Role
    └─ Attach to req.user

Role-Based Access
    ↓
authorizeRoles middleware
    ├─ Check user.roleId.name
    └─ Allow/deny based on required roles
```

### 4. **Scheduled Workflow Execution**

```
App Startup → app.js
    ↓
loadSchedules() [from scheduler.js]
    ↓
Schedule.find({ status: "active" })
    ↓ For each schedule
registerJob() with node-cron
    ├─ Validate cron expression
    ├─ cron.schedule() - Register job
    └─ Store in jobs Map

Cron Trigger (e.g., "0 9 * * *" → 9 AM daily)
    ↓
Execute scheduled job async
    ├─ Fetch Workflow
    ├─ Call executeWorkflow()
    ├─ Update schedule.lastRun
    ├─ If runOnce: mark inactive
    └─ Log execution
```

### 5. **Google Sheets Integration Flow**

```
1. User connects Google Account
   ↓
   POST /api/google/auth-url
   ↓
   Return OAuth authorization URL

2. User authorizes app
   ↓
   googleAuthController.callback()
   ├─ Exchange code for tokens
   ├─ Create GoogleAccount record
   └─ Store accessToken, refreshToken

3. Workflow uses Google Sheets action
   ↓
   googleSheetsHandler()
   ├─ getAuthorizedClient() [googleClient.js]
   ├─ Check token expiry
   ├─ Auto-refresh if needed
   ├─ Append data to sheet
   └─ Return result
```

### 6. **Credit System Flow**

```
Workflow Execution Triggered
    ↓
checkAndConsumeCredit(userId)
    ├─ Load user.credits
    ├─ Check remainingCredits > 0
    ├─ If insufficient → Error
    └─ Decrement credits:
        ├─ remainingCredits--
        ├─ usedCredits++
        └─ Save user

If credits = 0
    ↓
User cannot execute workflows
    ↓
Upgrade plan to refill credits
```

---

## 🛣️ API Routes

### Authentication Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Workflow Management

- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - Get user's workflows
- `GET /api/workflows/:id` - Get workflow details
- `PATCH /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow manually

### Webhook Management

- `POST /api/workflows/:id/webhook` - Create webhook
- `GET /api/workflows/:id/webhooks` - List webhooks
- `POST /webhook/:secret` - **Public webhook trigger** ⚡

### Scheduling

- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - List schedules
- `PATCH /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Email Integration

- `POST /api/email/send` - Send email
- `GET /api/email/templates` - List templates

### Google Integration

- `GET /api/google/auth-url` - Get OAuth URL
- `GET /api/google/callback` - OAuth callback
- `GET /api/google/sheets/:id` - Get spreadsheet data
- `POST /api/google/sheets/:id/append` - Append to sheet

### Integrations

- `POST /api/integrations` - Create integration
- `GET /api/integrations` - List integrations
- `DELETE /api/integrations/:id` - Delete integration

### Organizations

- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List organizations
- `PATCH /api/organizations/:id` - Update organization

### Teams

- `POST /api/teams` - Create team
- `GET /api/teams` - List teams
- `POST /api/teams/:id/users` - Add user to team

### Analytics

- `GET /api/analytics/workflows` - Workflow statistics
- `GET /api/analytics/executions` - Execution metrics
- `GET /api/analytics/credits` - Credit usage

### Superadmin Routes

- `GET /api/superadmin/users` - List all users
- `GET /api/superadmin/organizations` - List all orgs
- `GET /api/superadmin/analytics` - System analytics

---

## 🎨 Frontend Architecture

### Page Structure

**Public Pages:**

- `/` - Landing page (Home.jsx)
- `/login` - Login page
- `/signup` - Registration page
- `/404` - Not found page

**Protected Dashboard:**

- `/dashboard` - Main dashboard (DashboardHome.jsx)
- `/dashboard/workflows` - List workflows
- `/dashboard/workflows/:id` - Workflow editor (WorkflowEditor.jsx)
- `/dashboard/create-ai-workflow` - AI workflow builder
- `/dashboard/integrations` - Integration management
- `/dashboard/analytics` - Execution analytics
- `/dashboard/settings` - User settings
- `/dashboard/organizations` - Organization management
- `/dashboard/teams` - Team management
- `/dashboard/plans` - Subscription plans

**Superadmin Panel:**

- `/superadmin` - Admin dashboard
- `/superadmin/users` - User management
- `/superadmin/organizations` - Organization management
- `/superadmin/teams` - Team management
- `/superadmin/roles` - Role management
- `/superadmin/logs` - System logs
- `/superadmin/settings` - Admin settings

### Key Components

#### **Workflow Editor (WorkflowEditor.jsx)**

Uses React Flow for visual workflow building:

- Drag-and-drop nodes
- Connect nodes with edges
- Right-click context menu
- Modules panel (available actions)
- Data panel (workflow variables)
- Configuration panels for each action type:
  - WebhookConfig
  - DefaultConfig
  - EmailConfig
  - SchedulerConfig
  - GoogleSheetsConfig
  - GoogleDriveConfig

#### **Custom Node (CustomNode.jsx)**

Visual representation of workflow actions:

- Custom styling per action type
- Icon display
- Connection validation
- Mouse hover effects

#### **Modules Panel (ModulesPanel.jsx)**

Available actions to add to workflow:

- Email, Webhook, Schedule, Delay
- Conditions, AI Prompt
- Slack, Google Sheets, Discord

#### **Data Panel (DataPanel.jsx)**

Shows available variables/data in current execution context

### Redux Store

**slices/authSlice.js:**

- `signup` - Register user
- `login` - Authenticate user
- `logout` - Clear session
- `getCurrentUser` - Load user from cookie

**slices/darkModeSlice.js:**

- Theme toggle management

### Custom Hooks

- `useEmailSaveHandler.js` - Email action save logic
- `useSchedulerSaveHandler.js` - Schedule action save logic
- `useGoogleSheetsSaveHandler.js` - Google Sheets action save logic
- `useWebhookSaveHandler.js` - Webhook configuration save logic
- `useVariableDrop.js` - Handle variable drag-drop

### Utilities

**actionStyles.js** - Style configuration for each action type
**moduleRules.js** - Validation rules for module connections
**api.js** - Axios instance with error handling

---

## ⚙️ Workflow Execution Engine

### File Structure

```
server/src/engine/
├── executeWorkflow.js      # Main orchestrator
├── executeNode.js          # Node executor
├── contextBuilder.js       # Initial context creation
├── handlers/               # Action handlers
│   ├── index.js           # Handler registry
│   ├── email.handler.js   # Email action
│   ├── webhook.handler.js # Webhook handler
│   ├── schedule.handler.js
│   ├── googleSheets.handler.js
│   └── ...
└── resolvers/             # Data resolvers
    ├── actionResolver.js
    ├── resolveTemplate.js # Variable substitution
    └── ...
```

### Key Functions

**executeWorkflow(workflow, webhookPayload, options)**

- Entry point for workflow execution
- Creates WorkflowLog record
- Checks & consumes credits
- Finds trigger node
- Recursively executes nodes
- Handles success/error

**executeNode(nodeId, workflow, context, log)**

- Resolves action from node
- Loads appropriate handler
- Executes handler with context
- Stores output in context
- Logs execution step
- Traverses edges for next nodes

**buildInitialContext(webhookPayload, workflow)**

- Creates execution context object
- Parses webhook payload
- Prepares variables for template substitution

**resolveTemplate(template, context)**

- Replaces {{variables}} with actual values
- Supports nested object access ({{obj.prop}})

### Handler Pattern

Each handler is an async function:

```javascript
export default async function actionHandler(action, context) {
  // 1. Resolve template variables in action config
  // 2. Execute the action
  // 3. Return result object
  return { success: true, output: ... }
}
```

---

## 🔐 Security Features

### Authentication

- JWT tokens (7-day expiry)
- HttpOnly cookies (prevent XSS)
- Password hashing with bcrypt
- Secure token verification

### Authorization

- Role-Based Access Control (RBAC)
- Middleware: `protect` (auth check) + `authorizeRoles`
- Superadmin-only endpoints
- Organization-scoped data access

### Data Protection

- API keys stored with `select: false` (not returned by default)
- Google OAuth tokens encrypted (infrastructure ready)
- Webhook secrets unique and indexed

### Request Validation

- express-validator for input validation
- Schema validation in models
- CORS configured (localhost:5173)

---

## 📊 Key Features Implemented

### ✅ Core Workflow Features

- [x] Visual workflow builder (React Flow)
- [x] Node-based action system (Email, Webhook, Schedule, etc.)
- [x] Workflow versioning & status tracking
- [x] Manual workflow execution
- [x] Execution logging & audit trail
- [x] Error handling & retry logic

### ✅ Triggers & Execution

- [x] Webhook triggers (unique secret URLs)
- [x] Cron scheduling (multiple frequencies)
- [x] Scheduled execution with timezone support
- [x] One-time scheduled runs
- [x] Automatic token refresh for Google APIs

### ✅ Integrations

- [x] Email (Nodemailer)
- [x] Google Sheets (read/write/append)
- [x] Google Drive (integration ready)
- [x] Custom webhooks (incoming)
- [x] Multi-service integration model

### ✅ AI Features

- [x] AI Scenario model (ChatGPT, Claude support)
- [x] Prompt management
- [x] Response logging
- [x] Multiple AI model support

### ✅ Multi-Tenancy

- [x] Organization model
- [x] Team structure
- [x] User roles (Superadmin, Admin, Member, etc.)
- [x] Permission-based access control

### ✅ Billing & Credits

- [x] Credit-based execution system
- [x] Credit consumption per workflow execution
- [x] Subscription tiers (free, basic, pro, enterprise)
- [x] Plan features (workflow limits, AI limits)
- [x] Payment tracking (Transaction model)

### ✅ Admin Features

- [x] Superadmin panel
- [x] User management
- [x] Organization management
- [x] Team management
- [x] Role management
- [x] System logs & analytics

### ✅ Analytics & Monitoring

- [x] Workflow execution metrics
- [x] Credit usage tracking
- [x] Execution logs with detailed steps
- [x] Error tracking & diagnostics
- [x] User activity logs

---

## 🔧 Configuration & Services

### Services

**scheduler.js**

- Loads all active schedules on startup
- Manages cron jobs in-memory
- Auto-refresh job registration
- Handles job cleanup

**googleClient.js**

- OAuth2 client initialization
- Token management
- Auto-refresh expired tokens
- Permission scoping

**mailer.js**

- Email sending via Nodemailer
- Template support
- Error handling

**googleSheetsService.js**

- Spreadsheet operations
- Append data to sheets
- Read sheet data

**googleDriveService.js**

- Drive file operations

### Utilities

**creditManager.js**

- Check remaining credits
- Consume credits on execution
- Prevent execution if insufficient credits

**moduleRules.js**

- Defines which nodes can connect
- Validation rules for workflow graph

**actionStyles.js**

- Visual configuration for action types
- Icons, gradients, borders

---

## 🚀 Data Flow Summary (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER FRONTEND                           │
│  (React App - WorkflowEditor, Dashboard, etc.)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (API Calls)
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER                             │
│  ├─ Auth Routes (login, signup, logout)                    │
│  ├─ Workflow Routes (CRUD)                                 │
│  ├─ Webhook Routes (public trigger)                        │
│  ├─ Schedule Routes (cron management)                      │
│  ├─ Integration Routes (3rd party config)                  │
│  └─ Analytics Routes (metrics)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
   ┌─────────┐  ┌──────────────┐  ┌──────────────┐
   │Scheduler│  │Webhook       │  │Manual Exec   │
   │(node-   │  │Trigger       │  │(User click)  │
   │cron)    │  │(Public URL)  │  │              │
   └────┬────┘  └──────┬───────┘  └──────┬───────┘
        │               │                 │
        └───────────────┼─────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  executeWorkflow()            │
        │  (Workflow Engine)            │
        ├───────────────────────────────┤
        │ 1. buildInitialContext()      │
        │ 2. checkAndConsumeCredit()    │
        │ 3. createWorkflowLog()        │
        │ 4. findTriggerNode()          │
        │ 5. executeNode() [RECURSIVE]  │
        │    └─ resolveTemplate()       │
        │    └─ loadHandler()           │
        │    └─ executeHandler()        │
        │    └─ storeOutput()           │
        │    └─ traverseEdges()         │
        │ 6. saveWorkflowLog()          │
        └───────────┬───────────────────┘
                    │
      ┌─────────────┼──────────────────────────┐
      ↓             ↓              ↓            ↓
   ┌─────────┐ ┌─────────┐  ┌──────────┐ ┌──────────┐
   │Email    │ │Google   │  │Webhook   │ │Schedule  │
   │Service  │ │Sheets   │  │POST      │ │Register  │
   │(Send)   │ │(Append) │  │(External)│ │(Cron)    │
   └─────────┘ └─────────┘  └──────────┘ └──────────┘
                    │
                    ↓
            ┌───────────────┐
            │   MONGODB     │
            │               │
            │ - Workflows   │
            │ - Logs        │
            │ - Executions  │
            │ - Schedules   │
            │ - Users       │
            │ - etc.        │
            └───────────────┘
```

---

## 📈 Example Workflow Execution

**Scenario:** User creates a workflow triggered by webhook that emails summary of Google Sheets data

```
1. User creates workflow in editor
   - Trigger: Webhook (generates unique URL)
   - Action 1: Read Google Sheets
   - Action 2: Send Email

2. User activates workflow

3. External system POSTs to webhook URL:
   POST /webhook/abc123def456
   Body: { "data": "important_info" }

4. Server receives webhook:
   - Verify webhook secret
   - Load Workflow from DB
   - Call executeWorkflow()

5. Workflow execution starts:
   a) buildInitialContext()
      - context = { webhook: {data: "important_info"} }

   b) Find first action node (Google Sheets)

   c) executeNode("node_1")
      - resolveTemplate(): replaces {{webhook.data}}
      - Load googleSheetsHandler
      - getAuthorizedClient(userId) → fetch tokens from DB
      - appendToSheet(spreadsheetId, values)
      - Output: { success: true, rowsAdded: 1 }
      - Store in context.steps.node_1
      - Log this step

   d) Traverse to next node (Email)

   e) executeNode("node_2")
      - resolveTemplate(): uses data from context
      - Load emailHandler
      - sendEmail(to, subject, body)
      - Output: { success: true, messageId: "xyz" }
      - Store in context.steps.node_2
      - Log this step

   f) No more edges → execution complete

6. Save WorkflowLog:
   - executionSteps: [step1, step2]
   - status: "success"
   - finishedAt: timestamp

7. Update user credits:
   - remainingCredits--
   - usedCredits++

8. Response sent back to webhook caller:
   - 200 OK
```

---

## 🎯 Project Status

### Implemented Features ✅

- Complete authentication system (JWT + cookies)
- Workflow builder with visual editor
- 5+ action types (email, webhook, schedule, Google Sheets, etc.)
- Scheduling with cron expressions
- Google OAuth integration
- Credit-based execution system
- Multi-tenancy (orgs, teams, users)
- Role-based access control
- Execution logging & audit trail
- Workflow analytics
- Superadmin management panel

### Infrastructure Ready 🔧

- Encryption utilities (for sensitive data)
- Google Drive integration (models created)
- AI workflow system (models created)
- Payment transaction tracking (models created)
- Notification system (models created)

### Potential Enhancements 🚀

- Advanced workflow conditions (if/else logic)
- Slack integration handler
- Discord integration handler
- GitHub integration handler
- Advanced analytics dashboard
- Workflow templates & marketplace
- Workflow collaboration & sharing
- API rate limiting
- Webhook retry logic with exponential backoff
- Workflow versioning
- Rollback capability

---

## 📝 Notes

1. **Workflow Graph Execution**: Uses recursive depth-first traversal of the workflow graph starting from trigger node
2. **Context Propagation**: Each node receives full execution context, enabling data flow between steps
3. **Credit System**: Critical for SaaS model - prevents abuse, enables monetization
4. **Scheduling**: Uses node-cron running in-process; consider distributed scheduler for scale
5. **Token Management**: Google tokens auto-refresh based on expiry
6. **Error Handling**: Comprehensive try-catch in workflow execution + logging
7. **Async Operations**: All DB operations and external API calls are async/await

---

**Last Updated:** February 1, 2026
