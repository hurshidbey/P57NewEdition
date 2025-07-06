# 🚨 CRITICAL: MODULE LOADING FIX - DO NOT FORGET THIS!

## THE PROBLEM
Docker keeps failing with: `Error: Cannot find module '/app/dist/index.js'`

## THE CAUSE
The build script in package.json has `--out-extension:.js=.mjs` which creates `index.mjs` but Docker CMD expects `index.js`

## THE PERMANENT FIX

### Option 1: Fix package.json (RECOMMENDED)
Remove the `--out-extension:.js=.mjs` flag from the build script:

```bash
# On server:
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73
cd /opt/protokol57
sed -i 's/ --out-extension:.js=.mjs//' package.json
```

### Option 2: Fix Dockerfile
Change the CMD to use index.mjs:
```dockerfile
CMD ["node", "dist/index.mjs"]
```

### Option 3: Use the WORKING build command
Replace the build script in package.json with:
```json
"build": "vite build && esbuild server/index.ts --define:process.env.SUPABASE_URL=process.env.SUPABASE_URL --define:process.env.SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

## FULL RECOVERY PROCESS

```bash
# 1. SSH to server
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73

# 2. Fix package.json
cd /opt/protokol57
sed -i 's/ --out-extension:.js=.mjs//' package.json

# 3. Rebuild and deploy
docker compose down
docker rmi protokol57-protokol57:latest || true
docker compose build --no-cache
docker compose up -d

# 4. Verify it's working
docker ps | grep protokol57
# Should show "Up X seconds" not "Restarting"
```

## NEVER ADD THIS FLAG AGAIN
- `--out-extension:.js=.mjs` breaks Docker deployment
- The default output is `index.js` which Docker expects
- If you need .mjs, update Dockerfile CMD accordingly