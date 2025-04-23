#!/bin/bash

echo "Setting up SSH Key..."
echo "$GIT_DEPLOY_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

echo "Starting ssh-agent..."
eval $(ssh-agent -s)
ssh-add /tmp/deploy_key || { echo "Failed to add SSH key"; exit 1; }

echo "Configuring SSH..."
mkdir -p ~/.ssh
echo -e "Host github.com\n\tStrictHostKeyChecking no\n\tUserKnownHostsFile=/dev/null\n" > ~/.ssh/config

# 打印 ~/.ssh/config 内容
echo "Current ~/.ssh/config content:"
cat ~/.ssh/config

echo "Testing SSH connection..."
ssh_output=$(ssh -vvvT git@github.com 2>&1)
ssh_exit_code=$?

if [ $ssh_exit_code -ne 0 ]; then
  echo "SSH connection failed with verbose error:"
  echo "$ssh_output"
  exit $ssh_exit_code
else
  echo "SSH connection successful."
fi

echo "Updating submodules..."
git submodule update --init --recursive || { echo "Submodule update failed"; exit 1; }

npm install
npx quartz build