// Singleton is now managed by @stockpro/db.
// This file is kept only for backward compatibility during migration.
// After running migrate-to-monorepo.sh, this file will be removed.
export { prisma, default } from '@stockpro/db'
