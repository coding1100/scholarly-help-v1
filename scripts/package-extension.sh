#!/usr/bin/env bash
# Builds the download offered on /tools/mcq-practice. *.zip is gitignored, so
# this runs on every build and the file always matches extension/.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
output="$root/public/downloads/mcq-practice-scanner.zip"

mkdir -p "$(dirname "$output")"
rm -f "$output"
cd "$root/extension"
zip -qrX "$output" . -x README.md
