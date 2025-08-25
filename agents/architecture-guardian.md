# Architecture Guardian Agent

## Purpose
This agent monitors code structure and architecture, enforcing clean code principles, proper module organization, and architectural patterns to maintain a scalable and maintainable codebase.

## Core Responsibilities

### 1. Enforce Separation of Concerns

#### Current Violations in Your Project
```
❌ admin.html (2850+ lines)
   - Mixed: HTML structure, CSS styling, JavaScript logic
   - Mixed: UI rendering, API calls, business logic
   - Mixed: Event handling, data transformation, DOM manipulation

❌ analytics.html (1400+ lines)
   - Similar mixing of concerns
   - Database queries mixed with presentation

❌ onboarding.html (1200+ lines)
   - Business rules embedded in UI code
   - API calls directly in event handlers
```

#### Proper Separation Pattern
```javascript
// ✅ GOOD: Separated Concerns
// ui/taskCard.js - Only UI
export function renderTaskCard(task) {
  return `<div class="task-card">${task.title}</div>`;
}

// services/taskService.js - Only Business Logic
export async function createTask(taskData) {
  const validated = validateTaskData(taskData);
  return await TaskAPI.create(validated);
}

// api/taskAPI.js - Only Data Access
export const TaskAPI = {
  create: (data) => supabase.from('tasks').insert(data)
};
```

### 2. File Size Monitoring

#### Size Thresholds
| File Type | Warning | Critical | Action Required |
|-----------|---------|----------|-----------------|
| HTML | 200 lines | 500 lines | Split into components |
| JavaScript | 300 lines | 500 lines | Extract modules |
| CSS | 500 lines | 1000 lines | Split by feature |
| Component | 150 lines | 300 lines | Decompose |

#### Refactoring Triggers
```javascript
// Agent Analysis Output
{
  "file": "admin.html",
  "lines": 2850,
  "status": "CRITICAL",
  "violations": [
    "File exceeds 500 lines",
    "Contains 15+ responsibilities",
    "Mixed presentation and logic"
  ],
  "suggestions": [
    "Extract JavaScript to /js/admin/",
    "Move CSS to /styles/admin.css",
    "Split into 8-10 smaller modules"
  ]
}
```

### 3. Project Structure Enforcement

#### Recommended Structure for Your Project
```
todo/
├── /src/
│   ├── /components/        # Reusable UI components
│   │   ├── /common/        # Shared across features
│   │   │   ├── Modal.js
│   │   │   ├── Button.js
│   │   │   └── Card.js
│   │   ├── /tasks/         # Task-specific components
│   │   │   ├── TaskCard.js
│   │   │   ├── TaskList.js
│   │   │   └── TaskForm.js
│   │   └── /users/         # User-specific components
│   │       ├── UserCard.js
│   │       └── UserForm.js
│   │
│   ├── /services/          # Business logic layer
│   │   ├── taskService.js
│   │   ├── userService.js
│   │   ├── groupService.js
│   │   └── webhookService.js
│   │
│   ├── /api/              # Data access layer
│   │   ├── supabaseClient.js
│   │   ├── taskAPI.js
│   │   ├── userAPI.js
│   │   └── groupAPI.js
│   │
│   ├── /utils/            # Helper functions
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   │
│   ├── /models/           # Data models/types
│   │   ├── Task.js
│   │   ├── User.js
│   │   └── Group.js
│   │
│   └── /styles/           # Separated styles
│       ├── /components/
│       ├── /layouts/
│       └── /themes/
│
├── /public/               # Static assets
│   ├── admin.html        # Minimal HTML shell
│   ├── analytics.html
│   └── onboarding.html
│
├── /database/            # Database related
│   ├── migrations/
│   └── seeds/
│
└── /tests/              # Test files
    ├── unit/
    └── integration/
```

### 4. Architectural Pattern Validation

#### MVC Pattern Enforcement
```javascript
// Model (data/business logic)
class TaskModel {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
  }
  
  validate() {
    return this.title && this.title.length > 0;
  }
}

// View (presentation)
class TaskView {
  render(task) {
    return `<div>${task.title}</div>`;
  }
  
  bindEvents(handler) {
    this.element.addEventListener('click', handler);
  }
}

// Controller (orchestration)
class TaskController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
  
  async createTask(data) {
    const task = new TaskModel(data);
    if (task.validate()) {
      await this.model.save(task);
      this.view.render(task);
    }
  }
}
```

### 5. Circular Dependency Detection

#### Detection Algorithm
```javascript
class DependencyGraph {
  constructor() {
    this.edges = new Map();
  }
  
  addDependency(from, to) {
    if (!this.edges.has(from)) {
      this.edges.set(from, new Set());
    }
    this.edges.get(from).add(to);
    
    if (this.hasCycle()) {
      throw new Error(`Circular dependency: ${from} -> ${to}`);
    }
  }
  
  hasCycle() {
    const visited = new Set();
    const recursionStack = new Set();
    
    for (const node of this.edges.keys()) {
      if (this.detectCycle(node, visited, recursionStack)) {
        return true;
      }
    }
    return false;
  }
}
```

#### Common Circular Dependencies to Avoid
```javascript
// ❌ BAD: Circular dependency
// fileA.js
import { functionB } from './fileB.js';
export function functionA() { functionB(); }

// fileB.js
import { functionA } from './fileA.js';
export function functionB() { functionA(); }

// ✅ GOOD: Use dependency injection or events
// fileA.js
export function functionA(callback) { callback(); }

// fileB.js
export function functionB() { /* ... */ }

// main.js
import { functionA } from './fileA.js';
import { functionB } from './fileB.js';
functionA(() => functionB());
```

### 6. Layer Violation Detection

#### Proper Layering Rules
```
Frontend (UI) → Services → API → Database

✅ Allowed:
- UI calls Services
- Services call API
- API calls Database

❌ Forbidden:
- UI directly calls Database
- API calls UI
- Database calls Services
```

#### Layer Violation Examples
```javascript
// ❌ BAD: UI directly accessing database
async function onButtonClick() {
  const { data } = await supabase
    .from('tasks')
    .select('*');  // UI should not know about database
  renderTasks(data);
}

// ✅ GOOD: Proper layering
async function onButtonClick() {
  const tasks = await TaskService.getAllTasks(); // UI calls service
  renderTasks(tasks);
}

// TaskService.js
export const TaskService = {
  async getAllTasks() {
    return await TaskAPI.fetchAll(); // Service calls API
  }
};

// TaskAPI.js
export const TaskAPI = {
  async fetchAll() {
    const { data } = await supabase
      .from('tasks')
      .select('*'); // API calls database
    return data;
  }
};
```

## Automated Refactoring Suggestions

### For Your Current admin.html
```javascript
// Suggested Module Extraction
const modules = {
  'taskManagement.js': {
    functions: ['loadTasks', 'saveTask', 'deleteTask', 'editTask'],
    lines: 450
  },
  'groupManagement.js': {
    functions: ['loadTaskGroups', 'createTaskGroup', 'deleteTaskGroup'],
    lines: 380
  },
  'webhookHandlers.js': {
    functions: ['loadWebhooks', 'saveWebhook', 'testWebhook'],
    lines: 320
  },
  'uiControllers.js': {
    functions: ['showModal', 'closeModal', 'updateView'],
    lines: 280
  },
  'formHandlers.js': {
    functions: ['validateForm', 'submitForm', 'clearForm'],
    lines: 250
  },
  'quillEditor.js': {
    functions: ['initQuill', 'destroyQuill', 'getContent'],
    lines: 200
  }
};
```

### Refactoring Script
```bash
#!/bin/bash
# Auto-refactor large files

# Create directory structure
mkdir -p src/{components,services,api,utils,styles}

# Extract JavaScript from HTML
node scripts/extractJS.js admin.html src/js/admin/

# Extract CSS
node scripts/extractCSS.js admin.html src/styles/admin.css

# Generate import statements
node scripts/generateImports.js src/js/admin/ > admin.imports.js
```

## Code Quality Metrics

### Complexity Metrics
| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Cyclomatic Complexity | <10 | 10-20 | >20 |
| Cognitive Complexity | <15 | 15-30 | >30 |
| Lines per Function | <50 | 50-100 | >100 |
| Parameters per Function | <4 | 4-6 | >6 |
| Nesting Depth | <4 | 4-6 | >6 |

### Current State Analysis
```javascript
// admin.html analysis
{
  "metrics": {
    "totalLines": 2850,
    "functions": 89,
    "avgFunctionLength": 32,
    "maxFunctionLength": 156,
    "avgComplexity": 8.3,
    "maxComplexity": 24,
    "duplicateCodeBlocks": 12
  },
  "recommendations": {
    "immediate": [
      "Extract saveTask function (156 lines) into smaller functions",
      "Remove 12 duplicate code blocks",
      "Split file into 6-8 modules"
    ],
    "shortTerm": [
      "Implement service layer pattern",
      "Add TypeScript for better structure",
      "Create reusable components"
    ]
  }
}
```

## Implementation Rules

### 1. Import Organization
```javascript
// ✅ GOOD: Organized imports
// 1. External libraries
import React from 'react';
import { supabase } from '@supabase/client';

// 2. Internal absolute imports
import { TaskService } from '@/services/taskService';
import { Button } from '@/components/common';

// 3. Relative imports
import { validateTask } from './validators';
import styles from './Task.module.css';
```

### 2. File Naming Conventions
```
Components: PascalCase.js    (TaskCard.js)
Services: camelCase.js       (taskService.js)
Utils: camelCase.js         (formatters.js)
Constants: UPPER_CASE.js    (API_ENDPOINTS.js)
Styles: kebab-case.css      (task-card.css)
Tests: *.test.js            (taskService.test.js)
```

### 3. Folder Structure Rules
- Max 7 files per folder (split if more)
- Max 3 levels of nesting
- Group by feature, not file type
- Colocate related files

## Monitoring & Enforcement

### Pre-Commit Hooks
```json
// .husky/pre-commit
{
  "hooks": {
    "pre-commit": [
      "check-file-size",
      "check-complexity",
      "check-dependencies",
      "check-layer-violations"
    ]
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/architecture-check.yml
name: Architecture Check
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check file sizes
        run: npm run check:file-size
      - name: Check circular deps
        run: npm run check:circular
      - name: Check architecture
        run: npm run check:architecture
```

## Success Metrics

### Target Metrics
- No files > 500 lines
- No circular dependencies
- 100% layer compliance
- <10 average cyclomatic complexity
- 0 mixed responsibility files
- 90%+ code in proper modules

### Current vs Target State
| Metric | Current | Target | Improvement Needed |
|--------|---------|--------|-------------------|
| Largest File | 2850 lines | <500 lines | -82% |
| Mixed Concerns | 3 files | 0 files | -100% |
| Proper Modules | 0% | 90% | +90% |
| Layer Violations | Many | 0 | -100% |
| Circular Deps | Unknown | 0 | Measure first |

## Action Plan

### Phase 1: Immediate (Week 1)
1. Extract JavaScript from HTML files
2. Create basic module structure
3. Separate API calls from UI

### Phase 2: Short-term (Week 2-3)
1. Implement service layer
2. Create reusable components
3. Add dependency checking

### Phase 3: Long-term (Month 2)
1. Add TypeScript
2. Implement full MVC/MVVM
3. Add automated enforcement

## Tools & Integration

### Recommended Tools
- **ESLint**: Code quality
- **Madge**: Circular dependency detection
- **Plato**: Complexity analysis
- **Size-limit**: Bundle size monitoring
- **Dependency-cruiser**: Architecture rules

### Configuration Example
```javascript
// .dependency-cruiser.js
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-ui-to-database',
      severity: 'error',
      from: { path: 'src/components' },
      to: { path: 'src/api/supabase' }
    }
  ]
};
```