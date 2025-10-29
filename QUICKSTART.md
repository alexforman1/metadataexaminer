# Quick Start (Node Version Fix)

If you're getting "Node.js version >=20.9.0 is required" error:

## Option 1: Load nvm and use Node 20 (Recommended)
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use
npm run dev
```

## Option 2: Make nvm auto-load (Permanent fix)
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Then in any new terminal:
```bash
cd /home/alexpc/Desktop/metadata
nvm use  # auto-switches to Node 20 using .nvmrc
npm run dev
```

## Option 3: Use the helper script
```bash
./setup-node.sh
```

## Verify Node version
```bash
node -v  # Should show v20.x.x
```
