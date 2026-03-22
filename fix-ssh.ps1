# fix-ssh.ps1 — Run this as Administrator on the Windows machine
# Fixes SSH access so Mac Mini can connect over Tailscale

$ErrorActionPreference = "Continue"
Write-Host "=== SSH Fix Script ===" -ForegroundColor Cyan

# ── STEP 1: DIAGNOSE ──
Write-Host "`n[1/6] Diagnosing system..." -ForegroundColor Yellow
Write-Host "Windows Version: $([System.Environment]::OSVersion.VersionString)"
Write-Host "OS: $((Get-CimInstance Win32_OperatingSystem).Caption)"
Write-Host "Build: $((Get-CimInstance Win32_OperatingSystem).BuildNumber)"

$sshCap = Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'
Write-Host "OpenSSH Server State: $($sshCap.State)"

$sshService = Get-Service sshd -ErrorAction SilentlyContinue
if ($sshService) {
    Write-Host "sshd service exists, status: $($sshService.Status)"
    if ($sshService.Status -eq 'Running') {
        Write-Host "sshd is already running! Skipping to verification." -ForegroundColor Green
        goto verification  # won't work in PS, handled below
    }
}

# ── STEP 2: Try Windows capability install (quick attempt) ──
if ($sshCap.State -eq 'Installed') {
    Write-Host "`n[2/6] OpenSSH Server already installed via Windows capability." -ForegroundColor Green
} elseif ($sshCap.State -eq 'NotPresent') {
    Write-Host "`n[2/6] Attempting Windows capability install (15s timeout)..." -ForegroundColor Yellow

    # Check Windows Update service
    $wuSvc = Get-Service wuauserv
    Write-Host "  Windows Update service: $($wuSvc.Status) (StartType: $($wuSvc.StartType))"

    if ($wuSvc.Status -ne 'Running') {
        Write-Host "  Starting Windows Update service..." -ForegroundColor Yellow
        try {
            Set-Service wuauserv -StartupType Manual
            Start-Service wuauserv -ErrorAction Stop
            Write-Host "  Windows Update service started." -ForegroundColor Green
        } catch {
            Write-Host "  Could not start Windows Update: $_" -ForegroundColor Red
        }
    }

    # Try the install with a timeout via job
    Write-Host "  Running Add-WindowsCapability (15s timeout)..."
    $job = Start-Job -ScriptBlock {
        Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    }
    $completed = Wait-Job $job -Timeout 15
    if ($completed) {
        $result = Receive-Job $job
        Write-Host "  Result: $($result.State)" -ForegroundColor Green
    } else {
        Stop-Job $job
        Remove-Job $job -Force
        Write-Host "  Timed out. Windows capability install won't work." -ForegroundColor Red
        Write-Host "  Proceeding to manual install..." -ForegroundColor Yellow
    }
}

# ── STEP 3: Check if we need manual install ──
$sshService = Get-Service sshd -ErrorAction SilentlyContinue
$sshCap = Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'

if (-not $sshService -and $sshCap.State -ne 'Installed') {
    Write-Host "`n[3/6] Manual OpenSSH install..." -ForegroundColor Yellow

    $installDir = "C:\Program Files\OpenSSH"
    $zipPath = "$env:TEMP\OpenSSH-Win64.zip"
    $extractPath = "$env:TEMP\OpenSSH-Extract"

    # Download latest release
    Write-Host "  Downloading OpenSSH-Win64..."
    try {
        # Get latest release URL from GitHub API
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $releases = Invoke-RestMethod -Uri "https://api.github.com/repos/PowerShell/Win32-OpenSSH/releases/latest"
        $asset = $releases.assets | Where-Object { $_.name -like "OpenSSH-Win64*.zip" -and $_.name -notlike "*arm*" } | Select-Object -First 1

        if (-not $asset) {
            # Fallback: try known recent version
            $downloadUrl = "https://github.com/PowerShell/Win32-OpenSSH/releases/download/v9.8.1.0p1-Preview/OpenSSH-Win64.zip"
        } else {
            $downloadUrl = $asset.browser_download_url
        }

        Write-Host "  URL: $downloadUrl"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
        Write-Host "  Downloaded." -ForegroundColor Green
    } catch {
        Write-Host "  Download failed: $_" -ForegroundColor Red
        Write-Host "  Falling back to Tailscale SSH (Step 5)..." -ForegroundColor Yellow
        $skipToTailscale = $true
    }

    if (-not $skipToTailscale) {
        # Extract
        Write-Host "  Extracting..."
        if (Test-Path $extractPath) { Remove-Item $extractPath -Recurse -Force }
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

        # Find the extracted folder (usually OpenSSH-Win64 inside)
        $sourceDir = Get-ChildItem $extractPath -Directory | Select-Object -First 1
        if (-not $sourceDir) { $sourceDir = Get-Item $extractPath }

        # Copy to Program Files
        if (Test-Path $installDir) {
            Write-Host "  Removing old $installDir..."
            # Stop service first if it exists
            Stop-Service sshd -ErrorAction SilentlyContinue
            Remove-Item $installDir -Recurse -Force
        }
        Copy-Item $sourceDir.FullName -Destination $installDir -Recurse -Force

        Write-Host "  Installed to $installDir" -ForegroundColor Green

        # Run install script
        Write-Host "  Running install-sshd.ps1..."
        & "$installDir\install-sshd.ps1"

        # Add to PATH if not already there
        $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($machinePath -notlike "*$installDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$machinePath;$installDir", "Machine")
            $env:Path += ";$installDir"
            Write-Host "  Added to system PATH." -ForegroundColor Green
        }

        # Cleanup
        Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
        Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# ── STEP 4: Configure and start sshd ──
$sshService = Get-Service sshd -ErrorAction SilentlyContinue
if ($sshService) {
    Write-Host "`n[4/6] Configuring sshd..." -ForegroundColor Yellow

    # Set to auto-start
    Set-Service -Name sshd -StartupType Automatic
    Write-Host "  StartupType set to Automatic."

    # Start the service
    if ($sshService.Status -ne 'Running') {
        Write-Host "  Starting sshd..."
        Start-Service sshd
    }

    $sshService = Get-Service sshd
    Write-Host "  sshd status: $($sshService.Status)" -ForegroundColor $(if ($sshService.Status -eq 'Running') {'Green'} else {'Red'})

    # Set default shell to PowerShell
    $regPath = "HKLM:\SOFTWARE\OpenSSH"
    if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    New-ItemProperty -Path $regPath -Name DefaultShell -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -PropertyType String -Force | Out-Null
    Write-Host "  Default shell set to PowerShell."

    # Ensure sshd_config allows password auth
    $configPath = "$env:ProgramData\ssh\sshd_config"
    if (-not (Test-Path $configPath)) {
        $configPath = "C:\Program Files\OpenSSH\sshd_config"
    }
    if (Test-Path $configPath) {
        $config = Get-Content $configPath -Raw
        # Make sure PubkeyAuthentication and PasswordAuthentication are enabled
        if ($config -match '#?\s*PasswordAuthentication\s+no') {
            (Get-Content $configPath) -replace '#?\s*PasswordAuthentication\s+no', 'PasswordAuthentication yes' | Set-Content $configPath
            Write-Host "  Enabled PasswordAuthentication in sshd_config."
            Restart-Service sshd
        }
    }
}

# ── STEP 5: Tailscale SSH fallback ──
if (-not $skipToTailscale) { $skipToTailscale = $false }
$sshService = Get-Service sshd -ErrorAction SilentlyContinue
if ((-not $sshService -or $sshService.Status -ne 'Running') -or $skipToTailscale) {
    Write-Host "`n[5/6] OpenSSH not working. Enabling Tailscale SSH fallback..." -ForegroundColor Yellow

    $tailscale = Get-Command tailscale -ErrorAction SilentlyContinue
    if (-not $tailscale) {
        $tailscale = Get-Command "C:\Program Files\Tailscale\tailscale.exe" -ErrorAction SilentlyContinue
    }

    if ($tailscale) {
        Write-Host "  Running: tailscale set --ssh"
        & $tailscale.Source set --ssh
        Write-Host "  Tailscale SSH enabled." -ForegroundColor Green
        $useTailscaleSsh = $true
    } else {
        Write-Host "  ERROR: tailscale command not found!" -ForegroundColor Red
        Write-Host "  Check if Tailscale is installed at C:\Program Files\Tailscale\" -ForegroundColor Red
    }
}

# ── STEP 6: VERIFICATION ──
Write-Host "`n[6/6] Verification..." -ForegroundColor Yellow

$sshService = Get-Service sshd -ErrorAction SilentlyContinue
if ($sshService -and $sshService.Status -eq 'Running') {
    Write-Host "  sshd is RUNNING" -ForegroundColor Green
    Write-Host "  Startup type: $($sshService.StartType)"

    # Check listening on port 22
    $listeners = netstat -an | Select-String ":22\s"
    if ($listeners) {
        Write-Host "  Port 22 is listening:" -ForegroundColor Green
        $listeners | ForEach-Object { Write-Host "    $_" }
    }

    Write-Host "`n  === FROM YOUR MAC MINI, RUN: ===" -ForegroundColor Cyan
    Write-Host '  ssh p-gre@100.120.17.102 "echo SSH connection successful"' -ForegroundColor White
} elseif ($useTailscaleSsh) {
    Write-Host "  Using Tailscale SSH" -ForegroundColor Green
    & tailscale status 2>$null

    Write-Host "`n  === FROM YOUR MAC MINI, RUN: ===" -ForegroundColor Cyan
    Write-Host '  tailscale ssh p-gre@100.120.17.102 "echo SSH connection successful"' -ForegroundColor White
    Write-Host "  OR (if regular SSH is configured for Tailscale):" -ForegroundColor Cyan
    Write-Host '  ssh p-gre@100.120.17.102 "echo SSH connection successful"' -ForegroundColor White
} else {
    Write-Host "  ERROR: Neither OpenSSH nor Tailscale SSH could be set up." -ForegroundColor Red
    Write-Host "  Manual intervention required." -ForegroundColor Red
}

Write-Host "`n=== Script complete ===" -ForegroundColor Cyan
