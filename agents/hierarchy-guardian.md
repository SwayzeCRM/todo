# Hierarchy Guardian Agent

## Purpose
This agent manages hierarchical relationships and business rules throughout the application, ensuring data integrity and proper parent-child relationships at all times.

## Core Responsibilities

### 1. Monitor Parent-Child Relationships
- Track all parent-child entity relationships in the database
- Validate that every child has a valid parent reference
- Ensure parent entities exist before children are created
- Monitor relationship changes and flag inconsistencies

### 2. Cascading Operations Management
```sql
-- Example: Proper cascading delete rules
ALTER TABLE child_table 
ADD CONSTRAINT fk_parent 
FOREIGN KEY (parent_id) 
REFERENCES parent_table(id) 
ON DELETE CASCADE;
```
- Implement CASCADE, SET NULL, or RESTRICT rules appropriately
- Handle soft deletes with proper child status updates
- Manage cascading updates for denormalized data

### 3. Data Integrity Enforcement
- Validate foreign key constraints before operations
- Check for circular references in hierarchical data
- Ensure unique constraints within parent scopes
- Validate data types and formats in relationships

### 4. Orphaned Records Detection
```javascript
// Example: Find orphaned records
async function findOrphanedRecords(table, parentField) {
  return await supabase
    .from(table)
    .select('*')
    .is(parentField, null)
    .not('parent_required', 'eq', false);
}
```
- Regular scans for orphaned child records
- Alert when parent references become invalid
- Provide cleanup strategies for orphaned data

### 5. Authorization Hierarchy
- Implement inheritance-based permissions
- Ensure parents can access children's data appropriately
- Validate access rights based on relationship chains
- Prevent unauthorized cross-branch access

### 6. Business Rules Implementation

#### Current Rules in Your Application:
1. **Task Groups → Tasks**
   - Tasks can belong to one task group
   - Deleting a task group should null task references or reassign

2. **User Groups → Users**
   - Users belong to exactly one group
   - "All Users" group cannot be deleted
   - Users without groups auto-assign to "All Users"

3. **Sequences → Task Groups**
   - Sequences link prerequisite and unlocked groups
   - Must validate both groups exist
   - Prevent circular dependencies

4. **Webhooks → Groups**
   - Webhooks can target multiple user groups
   - Validate group existence before webhook firing

## Implementation Patterns

### 1. Pre-Save Validation
```javascript
async function validateBeforeSave(entity, parentTable, parentId) {
  // Check parent exists
  const { data: parent, error } = await supabase
    .from(parentTable)
    .select('id')
    .eq('id', parentId)
    .single();
    
  if (error || !parent) {
    throw new Error(`Invalid parent reference: ${parentTable}#${parentId}`);
  }
  
  // Check for circular references
  if (await createsCircularReference(entity, parentId)) {
    throw new Error('Operation would create circular reference');
  }
  
  return true;
}
```

### 2. Cascade Handler
```javascript
async function handleCascadeDelete(parentTable, parentId, childTable, childField) {
  const strategy = getCascadeStrategy(parentTable, childTable);
  
  switch(strategy) {
    case 'CASCADE':
      await supabase
        .from(childTable)
        .delete()
        .eq(childField, parentId);
      break;
      
    case 'SET_NULL':
      await supabase
        .from(childTable)
        .update({ [childField]: null })
        .eq(childField, parentId);
      break;
      
    case 'RESTRICT':
      const { count } = await supabase
        .from(childTable)
        .select('count')
        .eq(childField, parentId);
      
      if (count > 0) {
        throw new Error('Cannot delete parent with existing children');
      }
      break;
  }
}
```

### 3. Integrity Check Schedule
```javascript
async function scheduleIntegrityChecks() {
  // Run every hour
  setInterval(async () => {
    await checkOrphanedTasks();
    await checkOrphanedUsers();
    await validateSequenceIntegrity();
    await cleanupBrokenReferences();
  }, 3600000);
}
```

## Database Schema Enforcement

### Required Indexes
```sql
-- Improve relationship query performance
CREATE INDEX idx_tasks_group ON onboarding_tasks(task_group_id);
CREATE INDEX idx_users_group ON users(user_group_id);
CREATE INDEX idx_sequences_prereq ON task_sequences(prerequisite_group_id);
CREATE INDEX idx_sequences_unlock ON task_sequences(unlocked_group_id);
```

### Trigger Examples
```sql
-- Auto-assign to "All Users" group
CREATE OR REPLACE FUNCTION assign_default_user_group()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_group_id IS NULL THEN
    SELECT id INTO NEW.user_group_id 
    FROM user_groups 
    WHERE group_name = 'All Users' 
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_user_group
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION assign_default_user_group();
```

## Monitoring & Alerts

### Key Metrics to Track
1. **Orphaned Records Count** - Should be 0
2. **Failed Constraint Violations** - Track patterns
3. **Circular Reference Attempts** - Log and prevent
4. **Cascade Operation Performance** - Monitor execution time
5. **Broken Reference Discovery Rate** - Should decrease over time

### Alert Conditions
- Orphaned records detected > threshold
- Circular reference attempt
- Mass cascade operation (>100 records)
- Foreign key violation patterns
- Unauthorized hierarchy access attempts

## Integration Points

### With Current Codebase
1. **admin.html** - Add validation before task/group operations
2. **analytics.html** - Validate user group assignments
3. **onboarding.html** - Ensure task hierarchy respected
4. **supabase_setup.sql** - Add missing constraints and triggers

### API Middleware
```javascript
// Add to all modification endpoints
app.use('/api/*', async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    try {
      await hierarchyGuardian.validate(req);
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    next();
  }
});
```

## Testing Scenarios

### Critical Test Cases
1. Delete parent with children (each cascade strategy)
2. Create child with non-existent parent
3. Update parent reference to create circular dependency
4. Bulk operations maintaining integrity
5. Concurrent modifications to hierarchy
6. Recovery from partial cascade failure

## Recovery Procedures

### When Integrity is Broken
1. **Identify** - Run full integrity scan
2. **Isolate** - Prevent further damage
3. **Analyze** - Determine root cause
4. **Repair** - Fix broken references
5. **Validate** - Ensure consistency restored
6. **Prevent** - Add guards against recurrence

## Performance Considerations
- Index all foreign key columns
- Batch cascade operations when possible
- Use database-level constraints where appropriate
- Cache hierarchy structures for read operations
- Implement optimistic locking for concurrent updates

## Success Metrics
- Zero orphaned records in production
- <1% constraint violation rate
- All cascade operations complete successfully
- No circular references ever created
- 100% of saves pass pre-validation
- Authorization checks respect hierarchy 100%