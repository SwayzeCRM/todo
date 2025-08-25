# How to Update GitHub After Changes

## Quick Update Methods:

### Method 1: Use the Script (Easiest!)
After I make changes, simply run:
```bash
./push-to-github.sh "Description of what changed"
```

Example:
```bash
./push-to-github.sh "Fixed navigation styling and added dark mode"
```

### Method 2: Manual Commands
```bash
git add .
git commit -m "Your change description"
git push
```

### Method 3: Using GitHub Desktop
1. Open GitHub Desktop
2. It will show all changes
3. Write a commit message
4. Click "Commit to main"
5. Click "Push origin"

## When to Update GitHub:

### After Each Session ✅
When we finish working on features, push the changes:
```bash
./push-to-github.sh "Today's updates: fixed UI, added features"
```

### After Major Changes ✅
- New features added
- Bug fixes completed
- UI improvements made
- Configuration changes

## Checking What Changed:
Before pushing, you can see what changed:
```bash
git status        # See which files changed
git diff          # See actual changes in detail
```

## Common Scenarios:

### "I made changes with Claude, how do I update GitHub?"
```bash
./push-to-github.sh "Updates from Claude session"
```

### "I want to see what will be uploaded"
```bash
git status
git diff --stat   # Summary of changes
```

### "I want to undo local changes"
```bash
git checkout -- filename   # Undo specific file
git checkout -- .          # Undo all changes
```

## Automatic Sync Options (Advanced):

### Option 1: Git Auto-Commit (Not Recommended for Main Branch)
You could set up a cron job, but manual control is better for production code.

### Option 2: Watch for Changes
Use tools like `fswatch` or `nodemon` to watch for changes and remind you to commit.

### Option 3: VS Code Auto-Save + Git Extension
If using VS Code, the Git extension can help track and push changes with UI buttons.

## Important Notes:

⚠️ **Why Not Automatic?**
1. **Quality Control**: Review changes before pushing
2. **Commit Messages**: Describe what changed and why
3. **Security**: Avoid accidentally pushing sensitive data
4. **Collaboration**: Others need to understand changes

## Quick Reference:

| Action | Command |
|--------|---------|
| Push changes | `./push-to-github.sh "message"` |
| Check status | `git status` |
| See changes | `git diff` |
| Pull updates | `git pull` |
| Undo changes | `git checkout -- .` |
| View history | `git log --oneline` |

## Setting Up Notifications (Optional):

To get reminded to push changes, you could:
1. Set a calendar reminder
2. Use terminal aliases
3. Add to your `.bashrc` or `.zshrc`:
```bash
alias update-todo='cd /Users/timjames/Documents/Projects/todo && ./push-to-github.sh'
```

Then just type `update-todo` from anywhere!

---

💡 **Pro Tip**: After each session with Claude, run the push script before closing your terminal!