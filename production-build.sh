#!/bin/sh -e

npm install

echo "Running tests..."
polymer test

echo "Building extension..."
polymer build

echo "Creating zip..."
(cd build/default && zip -r ../extension.zip .)

echo
echo
echo "Extension is ready to be uploaded: `pwd`/build/extension.zip"
