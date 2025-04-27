#!/usr/bin/env bash
set -euo pipefail

# Check if package.json and README.md exist to confirm we're at the project root
if [ ! -f "package.json" ] || [ ! -f "README.md" ]; then
  echo "Error: Could not find package.json or README.md. Ensure you're running this from the project root." >&2
  exit 1
fi

# Run the prepublish setup script
npm run prepublish:setup || { echo "Error: prepublish:setup failed" >&2; exit 1; }

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Ensure the build step succeeded." >&2
  exit 1
fi

# Change directory to the dist folder
cd dist || { echo "Error: failed to change into dist directory" >&2; exit 1; }

# Execute npm publish
npm publish