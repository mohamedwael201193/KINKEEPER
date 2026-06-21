# Generates a fake bank invoice PNG for OCR pipeline testing (Windows System.Drawing).
$ErrorActionPreference = "Stop"
$outDir = Join-Path (Join-Path $PSScriptRoot "..") "samples"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Add-Type -AssemblyName System.Drawing

$path = Join-Path $outDir "fake-bank-invoice.png"
$bmp = New-Object System.Drawing.Bitmap 800, 600
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)

$fontTitle = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Arial", 14)
$brush = [System.Drawing.Brushes]::Black
$red = [System.Drawing.Brushes]::DarkRed

$g.DrawString("FIRST NATIONAL BANK - URGENT PAYMENT NOTICE", $fontTitle, $red, 40, 40)
$g.DrawString("Account holder: Margaret Thompson", $fontBody, $brush, 40, 100)
$g.DrawString("Amount due: $4,850.00", $fontBody, $brush, 40, 140)
$g.DrawString("Pay immediately via wire transfer or gift cards to avoid account seizure.", $fontBody, $brush, 40, 180)
$g.DrawString("Call 1-800-555-0199 now. Do not tell your bank.", $fontBody, $brush, 40, 220)
$g.DrawString("Reference: IRS-SUSPENSION-2026", $fontBody, $brush, 40, 260)

$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Output "Generated: $path"
Get-Item $path | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
