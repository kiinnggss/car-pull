#!/usr/bin/env bash
set -euo pipefail

npm ci --ignore-scripts
npm test
npx eslint \
  src/lib/liveTracking.ts \
  src/lib/supabase/client.ts \
  src/lib/supabase/realtime.ts \
  src/app/page.tsx \
  src/components/auth/AuthLanding.tsx \
  src/components/common/Header.tsx \
  src/components/common/BottomNav.tsx \
  src/components/carpool/QuickBidPills.tsx \
  src/components/carpool/MatchesList.tsx \
  src/components/pass/CommutePass.tsx
npm run build
