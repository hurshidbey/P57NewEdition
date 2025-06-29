# DEPLOYMENT CHECKLIST - CRITICAL FIXES

## 🚨 USE THE DEPLOYMENT SCRIPT INSTEAD!
```bash
./deploy-production.sh
```
This script handles ALL the issues automatically!

## ⚠️ NEVER FORGET THESE STEPS AGAIN!

### 1. **OPENAI API KEY ISSUE** 
**Problem**: Every deployment loads placeholder OpenAI key instead of real key
**Root Cause**: .env.production on server has placeholder values

**MANDATORY STEPS AFTER EVERY DEPLOYMENT:**
```bash
# 1. Update OpenAI key on server
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-proj-1-pgPwLCCJgDq9kWPJuF01aLnLdSFHW6I4RrKWxRsKmQmnA-BhXyKONKl3A32HhJ_LryoUnQR0MpT3BlbkFJm5hCSpIgqTFUTFDHJDfCeB2dPpS6lkwwJayT0nnS9hNsNzSJZH7OwG-QsZxRiYjdg6HqDZtlkA/' .env.production"

# 2. Restart containers to pick up new env vars
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose down && docker compose up -d"

# 3. Restart Traefik if needed
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker restart root-traefik-1"

# 4. VERIFY OpenAI key is loaded
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker exec protokol57-protokol57-1 printenv | grep OPENAI"
# Should show: OPENAI_API_KEY=sk-proj-1-pgPwLC...

# 5. Test OpenAI endpoint
curl -s "https://p57.birfoiz.uz/api/test-openai"
# Should show: {"connected":true,...}
```

### 2. **TRAEFIK ROUTING ISSUE**
**Problem**: After rebuilds, Traefik can't route to new containers
**Solution**: Always restart Traefik after container rebuilds

### 3. **COMPLETE DEPLOYMENT PROCESS**
```bash
# Standard deployment
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && git pull && docker compose down && docker compose build --no-cache && docker compose up -d"

# CRITICAL: Fix OpenAI key
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-proj-1-pgPwLCCJgDq9kWPJuF01aLnLdSFHW6I4RrKWxRsKmQmnA-BhXyKONKl3A32HhJ_LryoUnQR0MpT3BlbkFJm5hCSpIgqTFUTFDHJDfCeB2dPpS6lkwwJayT0nnS9hNsNzSJZH7OwG-QsZxRiYjdg6HqDZtlkA/' .env.production"

# CRITICAL: Restart containers
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && docker compose restart"

# CRITICAL: Fix Traefik routing
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker restart root-traefik-1"

# VERIFY everything works
curl -s "https://p57.birfoiz.uz/api/test-openai"
curl -s "https://p57.birfoiz.uz/api/protocols?limit=1"
```

### 4. **VERIFICATION CHECKLIST**
- [ ] OpenAI key loaded in container: `docker exec protokol57-protokol57-1 printenv | grep OPENAI`
- [ ] OpenAI API working: `curl https://p57.birfoiz.uz/api/test-openai`
- [ ] Protocols API working: `curl https://p57.birfoiz.uz/api/protocols?limit=5`
- [ ] Site accessible: `curl https://p57.birfoiz.uz`
- [ ] Navigation working: Check next/previous buttons on protocol pages
- [ ] Confetti working: Test evaluation with score ≥70

## ⚠️ REMEMBER: THESE STEPS ARE MANDATORY AFTER EVERY DEPLOYMENT!