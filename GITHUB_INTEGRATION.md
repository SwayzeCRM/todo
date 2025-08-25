# GitHub Integration Guide

## Initial Setup - Creating a New Repository

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name your repository (e.g., `todo-admin-panel`)
4. Choose visibility (Public or Private)
5. **Don't** initialize with README (we already have files)
6. Click "Create repository"

### Step 2: Initialize Git Locally
Open Terminal and navigate to your project:
```bash
cd /Users/timjames/Documents/Projects/todo
```

Initialize Git:
```bash
git init
```

### Step 3: Add Files to Git
Add all files:
```bash
git add .
```

Create your first commit:
```bash
git commit -m "Initial commit - Todo Admin Panel with HighLevel integration"
```

### Step 4: Connect to GitHub
Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your actual values:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Push to GitHub:
```bash
git branch -M main
git push -u origin main
```

## Using GitHub Desktop (Easier for Beginners)

### Step 1: Download GitHub Desktop
1. Download from [desktop.github.com](https://desktop.github.com)
2. Install and sign in with your GitHub account

### Step 2: Add Your Project
1. Click "Add" → "Add Existing Repository"
2. Navigate to `/Users/timjames/Documents/Projects/todo`
3. If not initialized, click "Create a Repository"

### Step 3: Publish to GitHub
1. Click "Publish repository" in the top bar
2. Choose name and visibility
3. Click "Publish Repository"

## Recommended .gitignore File

Create a `.gitignore` file to exclude sensitive/unnecessary files: