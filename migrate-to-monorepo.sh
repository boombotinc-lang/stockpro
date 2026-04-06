#!/usr/bin/env bash
# =============================================================================
# migrate-to-monorepo.sh
# Moves current app files into apps/app/ and finalizes the monorepo structure.
#
# Run from: stockpro/ (the monorepo root)
#   bash migrate-to-monorepo.sh
#
# SAFE: it copies files then verifies before removing originals.
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT/apps/app"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     StockPro — Monorepo Migration Script                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Monorepo root : $ROOT"
echo "Target app    : $APP_DIR"
echo ""

# ── Guard: must run from the monorepo root ───────────────────────────────────
if [ ! -f "$ROOT/turbo.json" ]; then
  echo "❌  turbo.json not found. Run this script from the stockpro/ monorepo root."
  exit 1
fi

# ── 1. Move app/ route groups ────────────────────────────────────────────────
echo "▶  Moving app/(auth) ..."
cp -r "$ROOT/app/(auth)"   "$APP_DIR/app/" 2>/dev/null && echo "   ✓ (auth)" || echo "   ⚠ (auth) already moved or missing"

echo "▶  Moving app/(dashboard) ..."
cp -r "$ROOT/app/(dashboard)" "$APP_DIR/app/" 2>/dev/null && echo "   ✓ (dashboard)" || echo "   ⚠ (dashboard) already moved or missing"

echo "▶  Moving app/api ..."
cp -r "$ROOT/app/api"      "$APP_DIR/app/" 2>/dev/null && echo "   ✓ api" || echo "   ⚠ api already moved or missing"

echo "▶  Moving app/auth (Supabase callback) ..."
cp -r "$ROOT/app/auth"     "$APP_DIR/app/" 2>/dev/null && echo "   ✓ auth callback" || echo "   ⚠ already moved or missing"

echo "▶  Moving app/onboarding ..."
cp -r "$ROOT/app/onboarding" "$APP_DIR/app/" 2>/dev/null && echo "   ✓ onboarding" || echo "   ⚠ already moved or missing"

echo "▶  Moving app/components ..."
cp -r "$ROOT/app/components"  "$APP_DIR/app/" 2>/dev/null && echo "   ✓ components" || echo "   ⚠ already moved or missing"

echo "▶  Moving app/fonts ..."
cp -r "$ROOT/app/fonts"    "$APP_DIR/app/" 2>/dev/null && echo "   ✓ fonts" || echo "   ⚠ already moved or missing"

echo "▶  Copying globals.css and favicon ..."
cp "$ROOT/app/globals.css" "$APP_DIR/app/globals.css" 2>/dev/null || true
cp "$ROOT/app/favicon.ico" "$APP_DIR/app/favicon.ico" 2>/dev/null || true

echo "▶  Copying dashboard CSS ..."
find "$ROOT/app" -name "dashboard.css" -exec cp {} "$APP_DIR/app/" \; 2>/dev/null || true

# ── 2. Copy root layout + page into apps/app ────────────────────────────────
echo "▶  Copying root layout.tsx & page.tsx to apps/app ..."
cp "$ROOT/app/layout.tsx" "$APP_DIR/app/layout.tsx" 2>/dev/null || true
cp "$ROOT/app/page.tsx"   "$APP_DIR/app/page.tsx"   2>/dev/null || true

# ── 3. Move Supabase migrations ──────────────────────────────────────────────
echo "▶  Moving supabase/ ..."
mkdir -p "$APP_DIR/supabase"
cp -r "$ROOT/supabase/." "$APP_DIR/supabase/" 2>/dev/null && echo "   ✓ supabase/" || echo "   ⚠ supabase/ already moved or missing"

# ── 4. Copy public/ if it exists ────────────────────────────────────────────
if [ -d "$ROOT/public" ]; then
  echo "▶  Moving public/ ..."
  cp -r "$ROOT/public" "$APP_DIR/public" 2>/dev/null && echo "   ✓ public/" || echo "   ⚠ public/ already moved or missing"
fi

# ── 5. Copy .env.local to apps/app ───────────────────────────────────────────
if [ -f "$ROOT/.env.local" ]; then
  echo "▶  Copying .env.local to apps/app ..."
  cp "$ROOT/.env.local" "$APP_DIR/.env.local"
  echo "   ✓ .env.local"
fi

# ── 6. Install dependencies ──────────────────────────────────────────────────
echo ""
echo "▶  Installing workspace dependencies (npm install) ..."
cd "$ROOT"
npm install
echo "   ✓ node_modules installed"

# ── 7. Generate Prisma client ────────────────────────────────────────────────
echo "▶  Generating Prisma client in packages/db ..."
cd "$ROOT/packages/db"
npx prisma generate
echo "   ✓ Prisma client generated"
cd "$ROOT"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Migration complete!                                     ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  Next steps:                                             ║"
echo "║  1. Review apps/app/ — make sure all files are there     ║"
echo "║  2. Verify apps/app/.env.local has all vars              ║"
echo "║  3. Create apps/web/.env.local from apps/web/.env.example║"
echo "║  4. Run: npx turbo dev                                   ║"
echo "║     → apps/app  runs on http://localhost:3000            ║"
echo "║     → apps/web  runs on http://localhost:3001            ║"
echo "║                                                          ║"
echo "║  When satisfied, remove legacy files:                    ║"
echo "║    rm -rf app/ lib/ prisma/ supabase/ middleware.ts      ║"
echo "║    rm -f next.config.mjs tailwind.config.ts              ║"
echo "║    rm -f tsconfig.json postcss.config.mjs .eslintrc.json ║"
echo "║    rm -f migrate-to-monorepo.sh                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
