# Claude Development Guidelines

## Code Structure & Organization

### Monitor and Enforce Separation of Concerns
- **Single Responsibility Principle**: Each file/module should have one clear purpose
- **File Size Limits**: Suggest refactoring when files exceed ~500 lines
- **Mixed Responsibilities**: Flag when business logic, UI, and data access are combined

### Refactoring Triggers
1. **File Too Large** (>500 lines)
   - Split into logical modules
   - Extract reusable components
   - Separate concerns (UI, logic, data)

2. **Mixed Responsibilities**
   - Separate API calls from UI components
   - Extract business logic into service files
   - Move data transformations to utility functions

3. **Code Duplication**
   - Extract shared functions to utilities
   - Create reusable components
   - Implement proper inheritance/composition

### Suggested Module Organization

```
project/
├── /components/        # UI components
│   ├── /common/       # Shared UI elements
│   └── /features/     # Feature-specific components
├── /services/         # Business logic & API calls
├── /utils/           # Helper functions & utilities
├── /models/          # Data models & types
├── /config/          # Configuration files
└── /styles/          # CSS/styling files
```

### Current Project Analysis

Looking at the current structure:
- **admin.html** (2850+ lines) - NEEDS REFACTORING
  - Mix of HTML, CSS, and JavaScript
  - Multiple responsibilities: UI, data fetching, business logic
  - Should be split into modules

- **analytics.html** (1400+ lines) - NEEDS REFACTORING
  - Similar issues as admin.html
  - Mixed concerns

- **onboarding.html** (1200+ lines) - NEEDS REFACTORING
  - Combined UI and logic
  - Should separate API calls

### Recommended Refactoring

1. **Immediate Priority**: Extract JavaScript from HTML files
   ```
   /js/
   ├── admin/
   │   ├── taskManagement.js
   │   ├── groupManagement.js
   │   ├── webhookHandlers.js
   │   └── ui-controllers.js
   ├── analytics/
   │   ├── userManagement.js
   │   └── dataVisualization.js
   └── shared/
       ├── supabaseClient.js
       └── utils.js
   ```

2. **Extract Styles**: Move inline styles to CSS files
   ```
   /styles/
   ├── admin.css
   ├── analytics.css
   ├── onboarding.css
   └── shared.css
   ```

3. **Modularize Components**: Create reusable components
   ```javascript
   // Example: taskCard.js
   export function createTaskCard(task) {
     // Single responsibility: render task card
   }
   
   // Example: apiService.js
   export const TaskAPI = {
     async fetchTasks() { /* ... */ },
     async createTask(data) { /* ... */ },
     async updateTask(id, data) { /* ... */ }
   };
   ```

## Enforcement Rules

When reviewing/modifying code, always:
1. Check file line count
2. Identify mixed responsibilities
3. Look for duplicate code patterns
4. Suggest extraction when appropriate
5. Maintain consistent module organization

## Benefits
- **Maintainability**: Easier to understand and modify
- **Testability**: Isolated units are easier to test
- **Reusability**: Extracted modules can be reused
- **Performance**: Smaller files load faster
- **Collaboration**: Clear boundaries reduce conflicts