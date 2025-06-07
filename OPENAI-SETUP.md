# OpenAI API Setup for Protokol 57

## Problem
The AI prompt evaluation feature is not working on production because the OpenAI API key is not configured.

## Solution

### Option 1: Manual Configuration (Recommended)

1. **Get your OpenAI API key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key or use an existing one
   - Copy the key (starts with `sk-`)

2. **SSH into the production server**
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73
   ```

3. **Edit the environment file**
   ```bash
   cd /opt/protokol57
   nano .env
   ```

4. **Update the OpenAI API key**
   - Find the line: `OPENAI_API_KEY=your_openai_api_key_here`
   - Replace `your_openai_api_key_here` with your actual API key
   - Save the file (Ctrl+X, then Y, then Enter)

5. **Restart the application**
   ```bash
   pm2 restart protokol57
   ```

### Option 2: Using the Fix Script

1. **Run the diagnostic script**
   ```bash
   ./fix-openai-production.sh
   ```
   This will show you the current status and provide instructions.

2. **Update via command line** (replace with your actual key)
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "cd /opt/protokol57 && sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-your-actual-key-here/' .env && pm2 restart protokol57"
   ```

## Verification

After updating, test the AI evaluation:

1. Visit https://srv852801.hstgr.cloud/
2. Login to the app
3. Select any protocol
4. Enter a prompt and click evaluate
5. You should see the AI evaluation results

## Troubleshooting

### If evaluation still doesn't work:

1. **Check logs**
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'pm2 logs protokol57 --lines 50'
   ```

2. **Verify API key is loaded**
   ```bash
   ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 'cd /opt/protokol57 && grep OPENAI_API_KEY .env'
   ```

3. **Test OpenAI connection**
   ```bash
   curl https://srv852801.hstgr.cloud/api/test-openai
   ```

### Common Issues:

- **Invalid API key**: Make sure you copied the full key including the `sk-` prefix
- **Quota exceeded**: Check your OpenAI account for usage limits
- **Network issues**: The VPS might have firewall restrictions

## Security Notes

- Never commit the API key to git
- Keep the `.env` file permissions restricted
- Consider using OpenAI's usage limits to prevent unexpected charges
- Monitor your OpenAI dashboard for usage

## Cost Considerations

The app uses GPT-4 for evaluations, which costs approximately:
- $0.03 per 1K input tokens
- $0.06 per 1K output tokens
- Each evaluation uses ~1,000-1,500 tokens total
- Estimated cost: ~$0.05-0.08 per evaluation

Consider setting usage limits in your OpenAI account to control costs.