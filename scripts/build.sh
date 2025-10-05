#!/bin/bash

# Clean dist directory
rm -rf dist

# Build TypeScript
npx tsup src/bin/devark.ts --format esm --target node18 --dts --out-dir dist --clean

# Create bin directory and copy main file
mkdir -p dist/bin
cp dist/devark.js dist/bin/devark.js

# Copy template directories preserving structure
mkdir -p dist/packages

# Copy each package's templates directory
for package_dir in src/packages/*/; do
    package_name=$(basename "$package_dir")
    if [ -d "$package_dir/templates" ]; then
        mkdir -p "dist/packages/$package_name"
        cp -r "$package_dir/templates" "dist/packages/$package_name/"
    fi
done

echo "Build complete! Templates copied to dist/packages/"
