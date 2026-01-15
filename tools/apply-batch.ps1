<#
.SYNOPSIS
  Applies a "FILE MANIFEST" batch into the current repository.

.DESCRIPTION
  Reads a text file that contains repeated blocks in this format:

  FILE: relative/path/to/file
  <full file content>
  FILE: another/relative/path
  <full file content>

  - Creates parent directories as needed
  - Writes/overwrites files
  - Normalizes line endings to LF (configurable)
  - Refuses unsafe paths (absolute, .., drive letters)
  - Preserves content exactly as provided (no trimming inside file bodies)

.PARAMETER InputFile
  Path to the batch text file.

.PARAMETER RepoRoot
  Repo root (default: current directory).

.PARAMETER LineEndings
  "LF" (default) or "CRLF"

.EXAMPLE
  .\apply-batch.ps1 -InputFile .\batch.txt

#>

param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile,

  [Parameter(Mandatory = $false)]
  [string]$RepoRoot = (Get-Location).Path,

  [Parameter(Mandatory = $false)]
  [ValidateSet("LF","CRLF")]
  [string]$LineEndings = "LF"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Throw-UserError([string]$Message) {
  throw "apply-batch.ps1: $Message"
}

function Is-UnsafeRelativePath([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) { return $true }

  # Normalize slashes
  $p2 = $p.Replace("\","/").Trim()

  # Disallow absolute paths, drive letters, UNC paths
  if ($p2.StartsWith("/") -or $p2.StartsWith("//")) { return $true }
  if ($p2 -match "^[A-Za-z]:/") { return $true }

  # Disallow traversal
  if ($p2.Contains("../") -or $p2.Contains("..\")) { return $true }
  if ($p2 -eq ".." -or $p2.StartsWith("..")) { return $true }

  # Disallow weird control chars
  if ($p2 -match "[\x00-\x1F]") { return $true }

  return $false
}

function Normalize-LineEndings([string]$text, [string]$mode) {
  # First normalize to LF
  $t = $text -replace "`r`n", "`n"
  $t = $t -replace "`r", "`n"
  if ($mode -eq "CRLF") {
    $t = $t -replace "`n", "`r`n"
  }
  return $t
}

if (-not (Test-Path -LiteralPath $InputFile)) {
  Throw-UserError "InputFile not found: $InputFile"
}

if (-not (Test-Path -LiteralPath $RepoRoot)) {
  Throw-UserError "RepoRoot not found: $RepoRoot"
}

# Read entire file as raw text
$raw = Get-Content -LiteralPath $InputFile -Raw

if ([string]::IsNullOrWhiteSpace($raw)) {
  Throw-UserError "InputFile is empty."
}

# We'll parse by finding lines starting with "FILE:"
# Use regex to find all FILE headers and their positions
$headerRegex = [regex]"(?m)^\s*FILE:\s*(.+?)\s*$"
$matches = $headerRegex.Matches($raw)

if ($matches.Count -eq 0) {
  Throw-UserError "No 'FILE:' headers found. Expected format: FILE: relative/path"
}

$written = 0
$skipped = 0

for ($i = 0; $i -lt $matches.Count; $i++) {
  $m = $matches[$i]
  $path = $m.Groups[1].Value.Trim()

  if (Is-UnsafeRelativePath $path) {
    Throw-UserError "Unsafe path detected in FILE header: '$path' (must be a safe relative path)"
  }

  $start = $m.Index + $m.Length
  $end = $raw.Length
  if ($i -lt $matches.Count - 1) {
    $end = $matches[$i + 1].Index
  }

  # Extract content between this FILE header and next FILE header
  $content = $raw.Substring($start, $end - $start)

  # Remove one leading newline if present (so file starts exactly after header line)
  if ($content.StartsWith("`r`n")) { $content = $content.Substring(2) }
  elseif ($content.StartsWith("`n")) { $content = $content.Substring(1) }

  # Important: do NOT trim end; preserve exact content as given.
  # But many manifests include a trailing newline before next FILE header; keep it.
  # We only normalize line endings if requested.
  $content = Normalize-LineEndings $content $LineEndings

  $dest = Join-Path -Path $RepoRoot -ChildPath $path

  # Ensure destination stays within RepoRoot
  $fullRepo = (Resolve-Path -LiteralPath $RepoRoot).Path
  $fullDest = [System.IO.Path]::GetFullPath($dest)

  if (-not $fullDest.StartsWith($fullRepo, [System.StringComparison]::OrdinalIgnoreCase)) {
    Throw-UserError "Refusing to write outside RepoRoot: $path"
  }

  $parent = Split-Path -Parent $dest
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  # Write file as UTF-8 without BOM (most repos prefer no BOM)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($dest, $content, $utf8NoBom)

  Write-Host ("[OK] Wrote: " + $path)
  $written++
}

Write-Host ""
Write-Host ("Done. Files written: " + $written)
