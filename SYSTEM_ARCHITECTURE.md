# System Architecture & Hierarchy Rules

## Core Hierarchy Model

```
Users → belong to → User Groups
User Groups → have → Active Sequences  
Sequences → control flow of → Task Groups
Task Groups → contain → Tasks
```

## 1. Hierarchy Rules

### User Membership
- Users belong to **exactly ONE** user group at a time (no multiple group memberships)
- Users can be reassigned to different groups but maintain only single membership
- A user without a group is considered "ungrouped" and follows default rules

### Task Organization
- Tasks belong to **exactly ONE** task group (or none for standalone tasks)
- Task groups exist independently and cannot contain other task groups
- Tasks maintain their group assignment throughout their lifecycle

### Sequence Structure
- Sequences define flows between task groups, not ownership
- Sequences are rules, not containers
- A sequence links prerequisite task groups to unlock task groups

## 2. Assignment Clarity

### Clear Separation of Concerns

| Concept | Determines | Example |
|---------|------------|---------|
| **User Groups** | WHO sees tasks | "New Employees", "Sales Team", "Managers" |
| **Task Groups** | WHAT tasks are grouped | "Onboarding Tasks", "Advanced Training" |
| **Sequences** | WHEN task groups unlock | "Complete Onboarding → Unlock Advanced" |

These three concepts remain **orthogonal** (independent) - changing one doesn't affect the others.

## 3. Flow Control Rules

### Sequence Application
- A sequence applies to either:
  - **ALL users** (universal sequence)
  - **Specific user groups** (targeted sequence)
- A user can only have **ONE active sequence** at a time
- When a sequence unlocks a task group, it becomes available to that user regardless of other rules
- Manual task assignments **override** all automatic rules

### Sequence Lifecycle
1. User completes all tasks in prerequisite task group
2. System checks for applicable sequences
3. If sequence conditions met, unlock task group is made available
4. User can now access newly unlocked tasks

## 4. State Management

### Task Completion Tracking
- Task completion is tracked at the **individual user level**
- Each user maintains their own progress state
- Completion status includes:
  - Not started
  - In progress  
  - Completed
  - Skipped (if allowed)

### Task Group Completion
- A task group is "complete" for a user when **ALL its tasks are done**
- Partial completion maintains "in progress" state
- Group completion triggers sequence evaluation

### Unlock Permanence
- Once a task group is unlocked for a user, it **cannot be re-locked**
- Unlocks are permanent to prevent confusion
- Admin can manually remove access if needed

### Independence Principle
- Progress in one task group **doesn't affect** progress in another
- Each task group maintains independent state
- Users can work on multiple task groups simultaneously

## 5. Conflict Resolution

### Priority Hierarchy
When rules conflict, apply this precedence (highest to lowest):

1. **Individual assignments** - Direct user-specific task assignments
2. **Sequence rules** - Unlocked task groups via sequences
3. **Group assignments** - Tasks assigned to user's group
4. **Default rules** - System-wide default tasks

### Specificity Rule
- More specific rules override general rules
- Example: User-specific > Group-specific > All users

### Time-Based Conflicts
- The most recent rule takes precedence in time-based conflicts
- Audit log maintains history of rule changes
- Admin can review and adjust as needed

## 6. Implementation Guidelines

### Database Schema Implications

```sql
-- Users have single group membership
users.user_group_id (FK to user_groups.id, nullable)

-- Tasks have single group assignment  
tasks.task_group_id (FK to task_groups.id, nullable)

-- Sequences link task groups
sequences.prerequisite_group_id (FK to task_groups.id)
sequences.unlock_group_id (FK to task_groups.id)
sequences.applies_to (enum: 'all', 'groups', 'users')

-- User progress tracking
user_task_progress.user_id (FK to users.id)
user_task_progress.task_id (FK to tasks.id)
user_task_progress.status (enum: 'not_started', 'in_progress', 'completed', 'skipped')
```

### Key Constraints

1. **Single Group Membership**: Enforce at database level with single FK
2. **Sequence Uniqueness**: One active sequence per user at a time
3. **Progress Integrity**: User can only have one progress record per task
4. **Unlock Permanence**: No mechanism to re-lock unlocked content

## 7. Benefits of This Architecture

### Clarity
- Clear separation of concerns
- No ambiguity in assignments
- Predictable behavior

### Flexibility
- Easy to add new groups without affecting existing structure
- Sequences can be modified without breaking assignments
- Individual overrides provide escape hatch

### Scalability
- Efficient queries due to clear relationships
- No recursive lookups needed
- State management remains simple

### Maintainability
- Easy to debug issues
- Clear audit trail
- Simple mental model for administrators

## 8. Common Scenarios

### Scenario 1: New Employee Onboarding
1. User created and assigned to "New Employees" group
2. Group has sequence: "Complete Basic Training → Unlock Advanced Training"
3. User completes all Basic Training tasks
4. Advanced Training automatically unlocked
5. User progresses through Advanced Training

### Scenario 2: Role Change
1. User moves from "Sales" to "Management" group
2. Previous task progress retained
3. New group's sequences become active
4. Any manually assigned tasks remain

### Scenario 3: Special Assignment
1. Admin manually assigns specific task to user
2. This overrides any group/sequence rules
3. User sees task immediately
4. Completion tracked individually

## 9. Future Considerations

### Potential Enhancements
- Time-based sequences (unlock after X days)
- Conditional sequences (unlock based on score/performance)
- Parallel sequences (multiple active paths)
- Group hierarchies (with inheritance)

### What NOT to Add
- Multiple group memberships (adds complexity)
- Nested task groups (creates confusion)
- Circular sequences (causes deadlocks)
- Dynamic re-locking (breaks user trust)

## 10. System Invariants

These rules must ALWAYS be true:

1. A user belongs to at most ONE user group
2. A task belongs to at most ONE task group
3. An unlocked task group remains unlocked
4. Individual assignments supersede all automatic rules
5. Progress is tracked per user, not per group
6. Sequences are acyclic (no circular dependencies)

---

*This architecture prioritizes simplicity, clarity, and predictability over flexibility. When in doubt, choose the simpler solution that maintains these core principles.*