#!/bin/bash

# Simple script to push changes to GitHub
# Usage: ./push-to-github.sh "Your commit message"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if commit message was provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}📝 Enter commit message:${NC}"
    read -r commit_message
else
    commit_message="$1"
fi

# Check if there are changes to commit
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}✨ No changes to commit${NC}"
    exit 0
fi

echo -e "${GREEN}🔍 Checking for changes...${NC}"
git status --short

echo -e "${GREEN}📦 Adding all changes...${NC}"
git add .

echo -e "${GREEN}💾 Committing with message: ${commit_message}${NC}"
git commit -m "$commit_message"

echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
git push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}🔗 View at: https://github.com/SwayzeCRM/todo${NC}"
else
    echo -e "${RED}❌ Push failed. Please check your connection and try again.${NC}"
    exit 1
fi