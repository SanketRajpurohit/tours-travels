1. First Time Setup
    # Set username & email (only once)
    git config --global user.name "Your Name"
    git config --global user.email "your@email.com"

    # Clone project repo
    git clone <https://github.com/SanketRajpurohit/tours-travels.git>
    cd <tours-travels>

2. Branching
    # See all branches
    git branch -a

    # Create new branch from dev
    git checkout dev
    git pull origin dev
    git checkout -b feature/branch-name

    # Switch between branches
    git checkout branch-name

3. Daily Work
    # Check current status
    git status

    # Add changes
    git add .

    # Commit changes
    git commit -m "Your clear commit message"

    # Push branch to GitHub
    git push origin feature/branch-name

4. Sync with Team
    # Pull latest dev
    git checkout dev
    git pull origin dev

    # Update your branch with dev
    git checkout feature/branch-name
    git merge dev

    # If conflicts → fix manually, then:
    git add .
    git commit -m "Resolved merge conflicts"

5. Pull Request (PR)
    1. Push your branch:
        git push origin feature/branch-name
    2. Go to GitHub → Open Pull Request → Base: dev, Compare: feature/branch-name
    3. Get review → Merge into dev

6. Main Release
    # After dev is tested
    git checkout main
    git pull origin main
    git merge dev
    git push origin main

7. Common Fixes
    # Undo last commit (keep changes)
    git reset --soft HEAD~1

    # Discard local changes
    git checkout -- .

    # Delete local branch
    git branch -d branch-name

    # Delete remote branch
    git push origin --delete branch-name
