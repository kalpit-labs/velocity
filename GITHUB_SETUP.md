# Push to GitHub

Your git repository is initialized and ready to push to GitHub.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `mongodb-dashboard` (or your choice)
4. Description: `Full-stack MongoDB dashboard with React and Express`
5. Keep it **Public** (required for free deployment on Vercel/Render)
6. **DO NOT** check "Initialize with README" (we already have one)
7. Click "Create repository"

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

### Example:
```bash
git remote add origin https://github.com/john/mongodb-dashboard.git
git push -u origin main
```

## Step 3: Verify

1. Refresh your GitHub repository page
2. You should see all your files
3. Check that `.env` files are **NOT** visible (they're protected by .gitignore)

## Next Steps

Once your code is on GitHub:

1. **Deploy Backend to Render**
   - See `DEPLOYMENT.md` Step 2

2. **Deploy Frontend to Vercel**
   - See `DEPLOYMENT.md` Step 3

---

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Create repository and push in one go
gh repo create mongodb-dashboard --public --source=. --push
```

---

## Troubleshooting

### Authentication Error
If you get authentication errors, you have two options:

**Option 1: HTTPS with Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

**Option 2: SSH (Recommended)**
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

Then:
1. Go to GitHub Settings → SSH and GPG keys → New SSH key
2. Paste your public key
3. Use SSH remote URL:
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Branch Name Issues
If you're asked to set upstream:
```bash
git push --set-upstream origin main
```

### Remote Already Exists
If you need to change the remote:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```
