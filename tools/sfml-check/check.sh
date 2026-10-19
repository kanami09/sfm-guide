#!/usr/bin/env bash
# Parse every ```sfml code block in src/ with the released SFM 4.34.0 grammar.
# Requires: java, javac, curl, git. Downloads ANTLR 4.9.1 and the grammar into ./work on first run.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
WORK="$HERE/work"
COMMIT="e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82"
GRAMMAR_URL="https://raw.githubusercontent.com/TeamDman/SuperFactoryManager/$COMMIT/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/antlr/sfml/SFML.g4"
ANTLR_URL="https://repo1.maven.org/maven2/org/antlr/antlr4/4.9.1/antlr4-4.9.1-complete.jar"

mkdir -p "$WORK"
JAR="$WORK/antlr4-4.9.1-complete.jar"
[ -f "$JAR" ] || curl -sSfL -o "$JAR" "$ANTLR_URL"
[ -f "$WORK/SFML.g4" ] || curl -sSfL -o "$WORK/SFML.g4" "$GRAMMAR_URL"

SEP=":"
CP_OUT="$WORK/out"
CP_JAR="$JAR"
case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*)
        # Windows java needs Windows-style paths inside a ';'-separated classpath
        SEP=";"
        CP_OUT="$(cygpath -w "$CP_OUT")"
        CP_JAR="$(cygpath -w "$CP_JAR")"
        ;;
esac

if [ ! -d "$WORK/out" ]; then
    (cd "$WORK" && java -jar "$JAR" -o gen/ca/teamdman/langs -Xexact-output-dir -visitor SFML.g4)
    javac -nowarn -encoding UTF-8 -cp "$JAR" -d "$WORK/out" "$WORK"/gen/ca/teamdman/langs/*.java "$HERE/Check.java"
fi

if [ "${1:-}" = "--tree" ]; then
    java -cp "${CP_OUT}${SEP}${CP_JAR}" Check --tree "$2"
else
    java -cp "${CP_OUT}${SEP}${CP_JAR}" Check "$ROOT/src"
fi
