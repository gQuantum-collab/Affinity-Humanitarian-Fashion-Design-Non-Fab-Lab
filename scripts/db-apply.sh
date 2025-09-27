#!/usr/bin/env bash
set -euo pipefail

# Apply a SQL file to the database using POSTGRES_URL_NON_POOLING
# Usage: ./scripts/db-apply.sh [path/to/file.sql] [--insecure] [--ca=/path/to/ca.pem]
# If --insecure is passed, the script runs psql with NODE_TLS_REJECT_UNAUTHORIZED=0

if [ ! -f .env.secrets ]; then
  echo ".env.secrets not found. Copy .env.example to .env.secrets and fill values."
  exit 1
fi

set -a; source .env.secrets; set +a

# default values
INSECURE=0
SQL_FILE="ops/supabase/notes.sql"
CA_PATH=${SUPABASE_CA_PATH-}

# parse args: first non-flag arg is SQL file
for arg in "$@"; do
  case "$arg" in
    --insecure)
      INSECURE=1
      ;;
    --ca=*)
      CA_PATH="${arg#--ca=}"
      ;;
    --help|-h)
      echo "Usage: $0 [path/to/file.sql] [--insecure] [--ca=/path/to/ca.pem]"
      exit 0
      ;;
    *)
      # if it looks like a .sql file, treat it as SQL_FILE
      if [[ "$arg" == *.sql ]]; then
        SQL_FILE="$arg"
      fi
      ;;
  esac
done

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file $SQL_FILE not found"
  exit 1
fi

if [ -n "$CA_PATH" ]; then
  if [ ! -f "$CA_PATH" ]; then
    echo "SUPABASE_CA_PATH set but file not found: $CA_PATH"
    exit 1
  fi
  echo "Using CA at $CA_PATH for TLS verification"
  export PGSSLROOTCERT="$CA_PATH"
  # enforce verification
  export PGSSLMODE=verify-full
fi

if [ $INSECURE -eq 1 ]; then
  echo "Running insecure (NODE_TLS_REJECT_UNAUTHORIZED=0) — local testing only"
  NODE_TLS_REJECT_UNAUTHORIZED=0 psql "$POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
else
  psql "$POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
fi

echo "Done."
