# Push main to tncarely-png/carely using a PAT (bypasses wrong saved Windows creds).
# 1) Create a fine-grained PAT for this repo (Contents: Read and write) on an account with push access.
# 2) In PowerShell, from the repo root:
#    $env:GITHUB_TOKEN = "ghp_...."
#    .\scripts\push-github.ps1
# Do not commit tokens; rotate if leaked.

$ErrorActionPreference = "Stop"
if (-not $env:GITHUB_TOKEN) {
  Write-Error "Set GITHUB_TOKEN to your Personal Access Token, then run again."
  exit 1
}
$ref = "https://x-access-token:$($env:GITHUB_TOKEN)@github.com/tncarely-png/carely.git"
git -c credential.helper= push $ref main
