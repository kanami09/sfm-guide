# Parse every ```sfml code block in src/ with the released SFM 4.34.0 grammar.
# PowerShell counterpart of check.sh; both share the ./work directory.
# Requires: java and javac (JDK 17+). Downloads ANTLR 4.9.1 and the grammar into ./work on first run.
#
# Usage:
#   ./tools/sfml-check/check.ps1                     check all code blocks in src/
#   ./tools/sfml-check/check.ps1 -Tree "<program>"   print the parse tree of a program
param(
    [string]$Tree
)

$ErrorActionPreference = 'Stop'

$Here = $PSScriptRoot
$Root = (Resolve-Path (Join-Path $Here '..\..')).Path
$Work = Join-Path $Here 'work'
$Commit = 'e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82'
$GrammarUrl = "https://raw.githubusercontent.com/TeamDman/SuperFactoryManager/$Commit/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/antlr/sfml/SFML.g4"
$AntlrUrl = 'https://repo1.maven.org/maven2/org/antlr/antlr4/4.9.1/antlr4-4.9.1-complete.jar'

# Run a native command and stop if it fails ($ErrorActionPreference does not cover exit codes).
function Invoke-Native {
    param([string]$Exe, [string[]]$Arguments)
    & $Exe @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Exe exited with code $LASTEXITCODE" }
}

foreach ($tool in 'java', 'javac') {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "$tool was not found on PATH. Install a JDK (17 or newer)."
    }
}

New-Item -ItemType Directory -Force -Path $Work | Out-Null
$Jar = Join-Path $Work 'antlr4-4.9.1-complete.jar'
$Grammar = Join-Path $Work 'SFML.g4'

# Windows PowerShell 5.1 defaults to old TLS versions
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
if (-not (Test-Path $Jar)) { Invoke-WebRequest -Uri $AntlrUrl -OutFile $Jar -UseBasicParsing }
if (-not (Test-Path $Grammar)) { Invoke-WebRequest -Uri $GrammarUrl -OutFile $Grammar -UseBasicParsing }

$Out = Join-Path $Work 'out'
if (-not (Test-Path $Out)) {
    $Gen = Join-Path $Work 'gen\ca\teamdman\langs'
    Push-Location $Work
    try {
        Invoke-Native 'java' @('-jar', $Jar, '-o', $Gen, '-Xexact-output-dir', '-visitor', 'SFML.g4')
    } finally {
        Pop-Location
    }
    $Sources = @(Get-ChildItem -Path $Gen -Filter '*.java' | ForEach-Object { $_.FullName }) + (Join-Path $Here 'Check.java')
    Invoke-Native 'javac' (@('-nowarn', '-encoding', 'UTF-8', '-cp', $Jar, '-d', $Out) + $Sources)
}

$ClassPath = $Out + [IO.Path]::PathSeparator + $Jar
if ($PSBoundParameters.ContainsKey('Tree')) {
    & java -cp $ClassPath Check --tree $Tree
} else {
    # Run from the repository root so failures are reported as src/...
    Push-Location $Root
    try {
        & java -cp $ClassPath Check 'src'
    } finally {
        Pop-Location
    }
}
exit $LASTEXITCODE
