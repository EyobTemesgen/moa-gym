#!/bin/sh
# MoA Gym Backend Entrypoint: ensures database is ready and migrated before launching the API
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. See .env.example." >&2
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "JWT_SECRET must be set. See .env.example." >&2
  exit 1
fi

echo "Preparing MoA Gym database..."
tries=0

until npx prisma db push --skip-generate --accept-data-loss >/tmp/db-push.log 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -ge 30 ]; then
    cat /tmp/db-push.log >&2
    echo "The database could not be reached after 60 seconds." >&2
    exit 1
  fi
  echo "Waiting for PostgreSQL database ($tries/30)..."
  sleep 2
done
echo "Database schema synchronized successfully."

# Seed initial baseline roles, lockers, and demo users if needed
if [ -f "dist/prisma/seed.js" ]; then
  echo "Running baseline database seeding..."
  node dist/prisma/seed.js || true
fi

exec "$@"
