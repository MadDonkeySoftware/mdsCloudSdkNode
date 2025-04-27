#!/usr/bin/env bash

# Check if package.json and README.md exist to confirm we're at the project root
if [ ! -f "package.json" ] || [ ! -f "README.md" ]; then
  echo "Error: Could not find package.json or README.md. Make sure you're running this script from the project root."
  exit 1
fi

# Run the prepublish setup script
npm run prepublish:setup

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. The prepublish:setup script may have failed."
  exit 1
fi

# Change directory to the dist folder
cd dist

# Execute npm publish
npm publish