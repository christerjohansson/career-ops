# career batch runner - PowerShell implementation
# Processes job offers via claude -p workers

param(
    [int]$Parallel = 1,
    [switch]$DryRun,
    [switch]$RetryFailed,
    [int]$StartFrom = 0,
    [int]$MaxRetries = 2,
    [double]$MinScore = 0
)

$ErrorActionPreference = "Stop"

# Configuration
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_DIR = (Get-Item $SCRIPT_DIR).Parent.FullName
$BATCH_DIR = $SCRIPT_DIR
$INPUT_FILE = Join-Path $BATCH_DIR "batch-input.tsv"
$STATE_FILE = Join-Path $BATCH_DIR "batch-state.tsv"
$PROMPT_FILE = Join-Path $BATCH_DIR "batch-prompt.md"
$LOGS_DIR = Join-Path $BATCH_DIR "logs"
$TRACKER_DIR = Join-Path $BATCH_DIR "tracker-additions"
$REPORTS_DIR = Join-Path $PROJECT_DIR "reports"
$LOCK_FILE = Join-Path $BATCH_DIR "batch-runner.pid"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Acquire-Lock {
    if (Test-Path $LOCK_FILE) {
        $oldPid = Get-Content $LOCK_FILE -Raw
        try {
            $proc = Get-Process -Id $oldPid -ErrorAction Stop
            Write-Log "ERROR: Another batch-runner is running (PID $oldPid)"
            exit 1
        } catch {
            Write-Log "WARN: Stale lock file found. Removing."
            Remove-Item $LOCK_FILE -Force
        }
    }
    $PID | Set-Content $LOCK_FILE
}

function Release-Lock {
    if (Test-Path $LOCK_FILE) { Remove-Item $LOCK_FILE -Force }
}

function Init-State {
    if (-not (Test-Path $STATE_FILE)) {
        "id`turl`tstatus`tstarted_at`tcompleted_at`treport_num`tscore`terror`tretries" | Set-Content $STATE_FILE
    }
}

function Get-State {
    param([int]$Id)
    if (-not (Test-Path $STATE_FILE)) { return "none" }
    $content = Get-Content $STATE_FILE
    foreach ($line in $content) {
        if ($line -match "^$Id`t") {
            return ($line -split "`t")[2]
        }
    }
    return "none"
}

function Get-Retries {
    param([int]$Id)
    if (-not (Test-Path $STATE_FILE)) { return 0 }
    $content = Get-Content $STATE_FILE
    foreach ($line in $content) {
        if ($line -match "^$Id`t") {
            $parts = $line -split "`t"
            if ($parts.Count -ge 9) { return [int]$parts[8] }
        }
    }
    return 0
}

function Get-NextReportNum {
    $maxNum = 0
    if (Test-Path $REPORTS_DIR) {
        Get-ChildItem $REPORTS_DIR -Filter "*.md" | ForEach-Object {
            $num = [int]($_.BaseName -split "-")[0]
            if ($num -gt $maxNum) { $maxNum = $num }
        }
    }
    if (Test-Path $STATE_FILE) {
        Get-Content $STATE_FILE | ForEach-Object {
            if ($_ -match "t([0-9]{3})t") {
                $num = [int]$matches[1]
                if ($num -gt $maxNum) { $maxNum = $num }
            }
        }
    }
    return $maxNum + 1
}

function Update-State {
    param(
        [int]$Id,
        [string]$Url,
        [string]$Status,
        [string]$Started,
        [string]$Completed,
        [string]$ReportNum,
        [string]$Score,
        [string]$Error,
        [int]$Retries
    )
    
    $tmpFile = "$STATE_FILE.tmp"
    $header = "id`turl`tstatus`tstarted_at`tcompleted_at`treport_num`tscore`terror`tretries"
    $header | Set-Content $tmpFile
    
    $found = $false
    if (Test-Path $STATE_FILE) {
        Get-Content $STATE_FILE | Where-Object { $_ -notmatch "^id`t" } | ForEach-Object {
            $parts = $_ -split "`t"
            if ([int]$parts[0] -eq $Id) {
                "$Id`t$Url`t$Status`t$Started`t$Completed`t$ReportNum`t$Score`t$Error`t$Retries" | Add-Content $tmpFile
                $found = $true
            } else {
                $_ | Add-Content $tmpFile
            }
        }
    }
    
    if (-not $found) {
        "$Id`t$Url`t$Status`t$Started`t$Completed`t$ReportNum`t$Score`t$Error`t$Retries" | Add-Content $tmpFile
    }
    
    Move-Item $tmpFile $STATE_FILE -Force
}

function Resolve-Prompt {
    param([string]$Url, [string]$JdFile, [string]$ReportNum, [string]$Date, [string]$Id)
    
    $content = Get-Content $PROMPT_FILE -Raw
    $content = $content -replace "{{URL}}", $Url
    $content = $content -replace "{{JD_FILE}}", $JdFile
    $content = $content -replace "{{REPORT_NUM}}", $ReportNum
    $content = $content -replace "{{DATE}}", $Date
    $content = $content -replace "{{ID}}", $Id
    return $content
}

function Process-Offer {
    param([int]$Id, [string]$Url, [string]$Source, [string]$Notes)
    
    $startedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $retries = Get-Retries -Id $Id
    $reportNum = Get-NextReportNum
    $reportNumStr = $reportNum.ToString("000")
    $date = Get-Date -Format "yyyy-MM-dd"
    
    # Determine JD file path
    if ($Url -match "^local:jds/") {
        $jdPath = $Url -replace "local:jds/", (Join-Path $PROJECT_DIR "jds\")
    } else {
        $jdPath = $Url
    }
    $jdFile = Join-Path (Split-Path $jdPath -Parent) ([System.IO.Path]::GetFileName($jdPath))
    if (-not (Test-Path $jdFile)) { $jdFile = $jdPath }
    
    Write-Log "--- Processing offer #$Id (report $reportNumStr, attempt $($retries + 1))"
    Write-Log "   JD: $jdFile"
    
    $logFile = Join-Path $LOGS_DIR "${reportNumStr}-${Id}.log"
    $resolvedPrompt = Join-Path $BATCH_DIR ".resolved-prompt-${Id}.md"
    
    # Resolve prompt
    $promptContent = Resolve-Prompt -Url $Url -JdFile $jdFile -ReportNum $reportNumStr -Date $Date -Id $Id
    $promptContent | Set-Content $resolvedPrompt -Encoding UTF8
    
    # Build user prompt
    $userPrompt = "Procesa esta oferta de empleo. Ejecuta el pipeline completo: evaluación A-F + report .md + PDF + tracker line. "
    $userPrompt += "URL: $Url | JD file: $jdFile | Report number: $reportNumStr | Date: $date | Batch ID: $Id"
    
    # Launch claude -p worker using cmd /c
    $exitCode = 0
    try {
        $cmd = "claude -p --dangerously-skip-permissions --append-system-prompt-file `"$resolvedPrompt`" `"$userPrompt`""
        cmd /c $cmd 2>&1 | Out-File -FilePath $logFile -Encoding utf8
        $exitCode = $LASTEXITCODE
    } catch {
        $exitCode = 1
        "ERROR: $_" | Add-Content $logFile
    }
    
    # Cleanup resolved prompt
    if (Test-Path $resolvedPrompt) { Remove-Item $resolvedPrompt -Force }
    
    $completedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    if ($exitCode -eq 0) {
        # Try to extract score from log
        $score = "-"
        if (Test-Path $logFile) {
            $logContent = Get-Content $logFile -Raw
            if ($logContent -match '"score":[[:space:]]*([0-9.]+)') {
                $score = $matches[1]
            }
        }
        
        Update-State -Id $Id -Url $Url -Status "completed" -Started $startedAt -Completed $completedAt -ReportNum $reportNumStr -Score $score -Error "-" -Retries $retries
        Write-Log "   ✅ Completed (score: $score, report: $reportNumStr)"
    } else {
        $newRetries = $retries + 1
        $errorMsg = "Exit code: $exitCode"
        Update-State -Id $Id -Url $Url -Status "failed" -Started $startedAt -Completed $completedAt -ReportNum $reportNumStr -Score "-" -Error $errorMsg -Retries $newRetries
        Write-Log "   ❌ Failed (attempt $newRetries, exit code: $exitCode)"
    }
}

function Merge-Tracker {
    Write-Log "=== Merging tracker additions ==="
    try {
        node (Join-Path $PROJECT_DIR "merge-tracker.mjs")
    } catch {
        Write-Log "WARN: Merge failed - $_"
    }
    
    Write-Log "=== Verifying pipeline ==="
    try {
        node (Join-Path $PROJECT_DIR "verify-pipeline.mjs")
    } catch {
        Write-Log "WARN: Verification failed - $_"
    }
}

function Print-Summary {
    if (-not (Test-Path $STATE_FILE)) {
        Write-Log "No state file found."
        return
    }
    
    $total = 0; $completed = 0; $failed = 0; $pending = 0
    $scoreSum = 0; $scoreCount = 0
    
    Get-Content $STATE_FILE | Where-Object { $_ -notmatch "^id`t" } | ForEach-Object {
        $total++
        $parts = $_ -split "`t"
        $status = $parts[2]
        
        switch ($status) {
            "completed" { $completed++; if ($parts[6] -match "^[0-9.]+$") { $scoreSum += [double]$parts[6]; $scoreCount++ } }
            "failed" { $failed++ }
            default { $pending++ }
        }
    }
    
    Write-Log "=== Batch Summary ==="
    Write-Log "Total: $total | Completed: $completed | Failed: $failed | Pending: $pending"
    if ($scoreCount -gt 0) {
        $avg = [math]::Round($scoreSum / $scoreCount, 1)
        Write-Log "Average score: $avg/5 ($scoreCount scored)"
    }
}

# Main
Write-Log "=== career batch runner (PowerShell) ==="
Write-Log "Parallel: $Parallel | Max retries: $MaxRetries"

# Check prerequisites
if (-not (Test-Path $INPUT_FILE)) {
    Write-Log "ERROR: $INPUT_FILE not found"
    exit 1
}
if (-not (Test-Path $PROMPT_FILE)) {
    Write-Log "ERROR: $PROMPT_FILE not found"
    exit 1
}

# Create directories
if (-not (Test-Path $LOGS_DIR)) { New-Item -ItemType Directory -Path $LOGS_DIR | Out-Null }
if (-not (Test-Path $TRACKER_DIR)) { New-Item -ItemType Directory -Path $TRACKER_DIR | Out-Null }
if (-not (Test-Path $REPORTS_DIR)) { New-Item -ItemType Directory -Path $REPORTS_DIR | Out-Null }

if (-not $DryRun) { Acquire-Lock }
Init-State

# Read input offers
$offers = @()
Get-Content $INPUT_FILE | Where-Object { $_ -notmatch "^id`t" } | ForEach-Object {
    $parts = $_ -split "`t"
    if ($parts.Count -ge 2 -and $parts[0] -match "^[0-9]+$") {
        $id = [int]$parts[0]
        if ($id -ge $StartFrom) {
            $offers += @{
                Id = $id
                Url = $parts[1]
                Source = if ($parts.Count -ge 3) { $parts[2] } else { "" }
                Notes = if ($parts.Count -ge 4) { $parts[3] } else { "" }
            }
        }
    }
}

# Filter offers based on retry mode
$pendingOffers = @()
foreach ($offer in $offers) {
    $status = Get-State -Id $offer.Id
    
    if ($RetryFailed) {
        if ($status -eq "failed") {
            $offerRetries = Get-Retries -Id $offer.Id
            if ($offerRetries -lt $MaxRetries) {
                $pendingOffers += $offer
            }
        }
    } else {
        if ($status -ne "completed") {
            $offerRetries = Get-Retries -Id $offer.Id
            if ($status -ne "failed" -or $offerRetries -lt $MaxRetries) {
                $pendingOffers += $offer
            }
        }
    }
}

$pendingCount = $pendingOffers.Count
Write-Log "Pending: $pendingCount offers"
Write-Log ""

if ($pendingCount -eq 0) {
    Write-Log "No offers to process."
    Print-Summary
    if (-not $DryRun) { Release-Lock }
    exit 0
}

if ($DryRun) {
    Write-Log "=== DRY RUN (no processing) ==="
    foreach ($offer in $pendingOffers) {
        $status = Get-State -Id $offer.Id
        Write-Log "  #$($offer.Id): $($offer.Url) [$($offer.Source)] (status: $status)"
    }
    Write-Log ""
    Write-Log "Would process $pendingCount offers"
    if (-not $DryRun) { Release-Lock }
    exit 0
}

# Process offers
if ($Parallel -le 1) {
    # Sequential
    foreach ($offer in $pendingOffers) {
        Process-Offer -Id $offer.Id -Url $offer.Url -Source $offer.Source -Notes $offer.Notes
    }
} else {
    # Parallel - simplified implementation
    $jobs = @()
    foreach ($offer in $pendingOffers) {
        $job = Start-Job -ScriptBlock {
            param($offer, $scriptPath, $projectDir, $batchDir)
            
            Set-Location $projectDir
            # Call main script recursively for parallel execution
            & $scriptPath -StartFrom $offer.Id -Parallel 0
        } -ArgumentList $offer, $MyInvocation.ScriptName, $PROJECT_DIR, $BATCH_DIR
        
        $jobs += @{ Job = $job; Id = $offer.Id }
        
        # Simple parallel limit
        if ($jobs.Count -ge $Parallel) {
            $completed = $jobs | Where-Object { $_.Job.State -eq "Completed" }
            $completed | ForEach-Object { Remove-Job $_.Job -Force }
            $jobs = $jobs | Where-Object { $_.Job.State -ne "Completed" }
        }
    }
    
    # Wait for remaining
    $jobs | ForEach-Object { 
        Receive-Job $_.Job -ErrorAction SilentlyContinue
        Remove-Job $_.Job -Force 
    }
}

# Merge tracker
Merge-Tracker

# Print summary
Print-Summary

Release-Lock