#!/bin/bash

echo "Setting up SSH Key..."
echo "$GIT_DEPLOY_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

# debug
first50=$(head -c 50 /tmp/deploy_key)
last50=$(tail -c 50 /tmp/deploy_key)
echo "First 50 chars of deploy key: $first50"
echo "Last 50 chars of deploy key: $last50"

echo "Starting ssh-agent..."
eval $(ssh-agent -s)
ssh-add /tmp/deploy_key || { echo "Failed to add SSH key"; exit 1; }

echo "Configuring SSH..."
mkdir -p ~/.ssh
echo -e "Host github.com\n\tStrictHostKeyChecking no\n" > ~/.ssh/config

echo "Testing SSH connection..."
ssh -T git@github.com || { echo "SSH connection failed"; exit 1; }

echo "Updating submodules..."
git submodule update --init --recursive || { echo "Submodule update failed"; exit 1; }

npm install
npx quartz build