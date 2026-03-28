#!/bin/sh
set -e

echo "Running migrations..."
node -e "
const { AppDataSource } = require('./dist/database/data-source');
AppDataSource.initialize()
  .then(() => AppDataSource.runMigrations())
  .then(() => { console.log('Migrations complete'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
"

echo "Starting app..."
exec node dist/main
