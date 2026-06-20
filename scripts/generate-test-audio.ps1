# Generates real speech WAV files via Windows SAPI (not synthetic silence).
$ErrorActionPreference = "Stop"
$outDir = Join-Path (Join-Path $PSScriptRoot "..") "test-data"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

$sentinelPath = Join-Path $outDir "sentinel-scam-call.wav"
$cogPath = Join-Path $outDir "cognoscente-checkin.wav"

$synth.SetOutputToWaveFile($sentinelPath)
$synth.Speak("Hello Margaret, this is Officer Smith from the IRS. Your social security number has been suspended due to suspicious activity. You must pay five thousand dollars in gift cards today or we will send police to your home.")
$synth.SetOutputToWaveFile($cogPath)
$synth.Speak("Good morning. I slept well last night. I had oatmeal for breakfast and I plan to walk in the garden later. My memory feels fine today.")

$synth.Dispose()

Write-Output "Generated:"
Write-Output $sentinelPath
Write-Output $cogPath
Get-Item $sentinelPath, $cogPath | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
