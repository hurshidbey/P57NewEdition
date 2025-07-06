# 🚨🚨🚨 ULTIMATE DOCKER FIX - READ THIS OR DIE 🚨🚨🚨

## THE PROBLEM CHAIN OF DEATH

1. **package.json build script** → Creates files in `/app/dist/`
2. **Dockerfile CMD** → Tries to run wrong file that doesn't exist
3. **Result** → ENDLESS RESTART LOOP OF DOOM

## THE TRUTH TABLE

| What Gets Built | What Docker Tries to Run | Result |
|-----------------|-------------------------|---------|
| dist/index.js   | start.mjs              | 💀 DEATH |
| dist/index.mjs  | dist/index.js          | 💀 DEATH |
| dist/index.js   | dist/index.js          | ✅ LIFE! |

## THE PERMANENT FIX CHECKLIST

### 1. CHECK WHAT BUILD CREATES
```bash
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && npm run build && ls -la dist/"
```

### 2. MAKE DOCKERFILE MATCH
If build creates `dist/index.js`:
```dockerfile
CMD ["node", "dist/index.js"]
```

If build creates `dist/index.mjs`:
```dockerfile
CMD ["node", "dist/index.mjs"]
```

### 3. THE WORKING CONFIGURATION (TESTED AND PROVEN)

**package.json:**
```json
"build": "vite build && esbuild server/index.ts --define:process.env.SUPABASE_URL=process.env.SUPABASE_URL --define:process.env.SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY --platform=node --packages=external --bundle --format=esm --outdir=dist"
```
(NO --out-extension flag!)

**Dockerfile:**
```dockerfile
# At the end of Dockerfile
WORKDIR /app
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

## EMERGENCY RECOVERY PROCEDURE

```bash
# 1. SSH to server
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73

# 2. Fix package.json (remove .mjs extension)
cd /opt/protokol57
sed -i 's/ --out-extension:.js=.mjs//' package.json

# 3. Fix Dockerfile (use correct path)
sed -i 's|CMD \["node", "start.mjs"\]|CMD ["node", "dist/index.js"]|' Dockerfile

# 4. Nuclear rebuild
docker compose down
docker system prune -af
docker compose build --no-cache
docker compose up -d

# 5. Verify success
docker ps | grep protokol57
# Should show "Up X seconds" NOT "Restarting"
```

## WHY THIS KEEPS HAPPENING

1. **Multiple people editing** → Different ideas about module systems
2. **ESM vs CommonJS confusion** → People add flags without understanding
3. **No testing before deployment** → Changes go live broken

## THE GOLDEN RULES

1. **NEVER add `--out-extension:.js=.mjs`** unless you also update Dockerfile
2. **NEVER use `start.mjs`** unless you create that file
3. **ALWAYS test locally**: `npm run build && node dist/index.js`
4. **ALWAYS match**: What build creates = What Docker runs

## THE OATH

"I solemnly swear to always check that my build output matches my Docker CMD, 
or may my containers restart forever in production hell."

---
LAST UPDATED: 2025-01-06 by someone who suffered through this