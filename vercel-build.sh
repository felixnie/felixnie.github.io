#!/bin/bash

set +e # do not exit automatically, printing details

echo "==== 1. Validating GIT_DEPLOY_KEY ===="
if [ -z "$GIT_DEPLOY_KEY" ]; then
  echo "❌ Error: GIT_DEPLOY_KEY is empty!"
else
  echo "✅ GIT_DEPLOY_KEY is set. Length: ${#GIT_DEPLOY_KEY} characters"
fi

echo "==== 2. Writing SSH Key to /tmp/deploy_key ===="
echo "$GIT_DEPLOY_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

echo "==== 3. Starting ssh-agent ===="
eval $(ssh-agent -s)

echo "==== 4. Adding SSH Key to Agent ===="
ssh_add_output=$(ssh-add /tmp/deploy_key 2>&1)
ssh_add_exit_code=$?
echo "$ssh_add_output"
echo "ssh-add exit code: $ssh_add_exit_code"

if [ $ssh_add_exit_code -ne 0 ]; then
  echo "❌ Failed to add SSH key."
else
  echo "✅ SSH key added successfully."
fi

echo "==== 5. SSH Key List ===="
ssh-add -l

echo "==== 6. Testing SSH Connection to GitHub ===="
ssh_output=$(ssh -v -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -T git@github.com 2>&1)
ssh_exit_code=$?
echo "$ssh_output"
echo "SSH connection exit code: $ssh_exit_code"

if echo "$ssh_output" | grep -q "successfully authenticated"; then
  echo "✅ SSH connection successful."
else
  echo "⚠️ SSH connection might have issues."
fi

echo "==== 7. Updating Git Submodules ===="
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git submodule sync
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git submodule update --init --recursive
submodule_exit_code=$?
echo "git submodule exit code: $submodule_exit_code"

if [ $submodule_exit_code -ne 0 ]; then
  echo "❌ Submodule update failed."
else
  echo "✅ Submodules updated successfully."
fi

echo "==== 8. Installing NPM Dependencies ===="
npm install
npm_exit_code=$?
echo "npm install exit code: $npm_exit_code"

echo "==== 9. Running Quartz Build ===="
npx quartz build
quartz_exit_code=$?
echo "quartz build exit code: $quartz_exit_code"

echo "==== 🎉 Script Completed ===="