#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/build-android.sh [apk|aab]
MODE="${1:-aab}"

echo "==> Building Ionic app..."
npm run build:prod

echo "==> Syncing Capacitor..."
npx cap sync android

if [[ "$MODE" == "apk" ]]; then
  echo "==> Building signed APK via Fastlane..."
  bundle exec fastlane android build_apk
  echo "Output: android/app/build/outputs/apk/release/app-release.apk"
else
  echo "==> Building signed AAB and uploading to Play Store (internal)..."
  bundle exec fastlane android deploy
fi

echo "Done."
