#!/bin/sh
# Push to GitHub using the GitHub CLI's login for credentials.
# Pushing changes under .github/workflows/ needs the "workflow" scope:
#   gh auth refresh -h github.com -s workflow
set -e
cd "$(dirname "$0")"
git -c credential.helper= -c credential.helper='!gh auth git-credential' push "$@"
