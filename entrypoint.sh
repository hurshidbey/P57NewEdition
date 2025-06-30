#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Print the environment variables for debugging
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: $VITE_SUPABASE_ANON_KEY"
echo "VITE_TELEGRAM_BOT_USERNAME: $VITE_TELEGRAM_BOT_USERNAME"

# Application already built during Docker build
echo "Starting application..."
# Use the command passed to the container, or default to npm run start
exec "$@"
