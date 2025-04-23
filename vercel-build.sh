#!/bin/bash

# write SSH Key
echo "$GIT_DEPLOY_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

# start ssh-agent and add the Key
eval $(ssh-agent -s)
ssh-add /tmp/deploy_key

# config SSH, skip HostKey checking
mkdir -p ~/.ssh
echo -e "Host github.com\n\tStrictHostKeyChecking no\n" > ~/.ssh/config

# clone repo
git submodule update --init --recursive

# build
npx quartz build