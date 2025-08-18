# 🚀 Git Workflow for Our Project

This document defines how the team will use Git & GitHub to collaborate without conflicts.

---

## 📌 Branching Strategy
- **main** → Always production-ready (stable code).  
- **dev** → Integration branch (all features are merged here before main).  
- **feature branches** → Each task/feature/bug fix gets its own branch.  
  - Naming convention:

    - `feature/<short-description>` (for new features)
    - `fix/<short-description>` (for bug fixes)
    - `hotfix/<short-description>` (for urgent production fixes)
  
  Example:  
    feature/login-page
    fix/navbar-alignment

-------

## 📌 Workflow Steps
### 
1. Clone repo
```bash
git clone <repo-url>
cd <repo-folder>

2. Create new branch from dev
    git checkout dev
    git pull origin dev
    git checkout -b feature/your-feature-name

3. Work & commit changes
    git add .
    git commit -m "Added login page UI"

4. Push branch to GitHub
    git push origin feature/your-feature-name

5. Create Pull Request (PR)
    Go to GitHub → Create Pull Request from your branch → into dev.
    PR must be reviewed by at least 1 teammate before merging.

    📌 Merging Rules

feature/* → merge into dev only via PR (not directly).

dev → merge into main only after testing & approval.

Never commit directly to main.

📌 Syncing with Team
Always keep your branch updated with the latest dev before pushing:
    git checkout dev
    git pull origin dev
    git checkout feature/your-feature-name
    git merge dev

----------