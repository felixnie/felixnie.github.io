#!/bin/bash
set -e

echo "==== Validating GIT_DEPLOY_KEY ===="
if [ -z "$GIT_DEPLOY_KEY" ]; then
  echo "❌ Error: GIT_DEPLOY_KEY is empty!"
  exit 1
else
  echo "✅ GIT_DEPLOY_KEY is set. Length: ${#GIT_DEPLOY_KEY} characters"
fi

echo "==== Writing SSH Key to /tmp/deploy_key ===="
echo "$GIT_DEPLOY_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

echo "==== Starting ssh-agent ===="
eval $(ssh-agent -s)

echo "==== Adding SSH Key to Agent ===="
ssh_add_output=$(ssh-add /tmp/deploy_key 2>&1)
ssh_add_exit_code=$?
if [ $ssh_add_exit_code -ne 0 ]; then
  echo "❌ Failed to add SSH key:"
  echo "$ssh_add_output"
  exit $ssh_add_exit_code
else
  echo "✅ SSH key added successfully."
fi

echo "==== SSH Key List in Agent ===="
ssh-add -l

echo "==== Testing SSH Connection to GitHub ===="
ssh_output=$(ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -T git@github.com 2>&1)
ssh_exit_code=$?
if [ $ssh_exit_code -ne 0 ]; then
  echo "❌ SSH connection failed:"
  echo "$ssh_output"
  exit $ssh_exit_code
else
  echo "✅ SSH connection successful."
fi

echo "==== Updating Git Submodules ===="
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git submodule sync
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git submodule update --init --recursive || { echo "❌ Submodule update failed"; exit 1; }
echo "✅ Submodules updated successfully."

echo "==== Installing NPM Dependencies ===="
npm install

echo "==== Running Quartz Build ===="
npx quartz build

echo "✅ Build completed successfully."