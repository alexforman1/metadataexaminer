#!/bin/bash
# Run this script to set up Node 20 for this project
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use
npm run dev
