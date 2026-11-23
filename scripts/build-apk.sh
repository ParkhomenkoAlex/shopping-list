#!/bin/sh

set -eu

die() {
    printf 'Error: %s\n' "$*" >&2
    exit 1
}

usage() {
    printf 'Usage: %s <dev|prod> [--dry-run]\n' "$0" >&2
    exit 1
}

[ "$#" -ge 1 ] || usage

environment="$1"
shift

if [ "${1:-}" = '--' ]; then
    shift
fi

dry_run=false
if [ "${1:-}" = '--dry-run' ]; then
    dry_run=true
    shift
fi
[ "$#" -eq 0 ] || usage

case "$environment" in
    dev)
        default_build_number=200
        apk_prefix='SL-Dev'
        ;;
    prod)
        default_build_number=300
        apk_prefix='SL-Prod'
        ;;
    *)
        usage
        ;;
esac

project_root=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$project_root"

build_number="${APP_BUILD_NUMBER:-$default_build_number}"
export APP_BUILD_NUMBER="$build_number"

expo_config=$(expo config --type public --json) ||
    die 'Unable to resolve Expo config version.'

app_version=$(printf '%s' "$expo_config" | node -e '
const version = JSON.parse(require("fs").readFileSync(0, "utf8")).version;
if (!version) process.exit(1);
console.log(version);
') || die 'Unable to parse Expo app version.'

[ -n "$app_version" ] || die 'Expo app version is empty.'

apk_path="$project_root/${apk_prefix}-${build_number}-v${app_version}.apk"
export SENTRY_RELEASE="shopping-list@${app_version}"
export SENTRY_DIST="$build_number"
export SENTRY_ORG='alex-org-e0'
export SENTRY_PROJECT='shopping-list'

if [ "$dry_run" = true ]; then
    printf 'Environment: %s\n' "$environment"
    printf 'APK: %s\n' "$apk_path"
    printf 'SENTRY_RELEASE: %s\n' "$SENTRY_RELEASE"
    printf 'SENTRY_DIST: %s\n' "$SENTRY_DIST"
    if [ "${SENTRY_DISABLE_AUTO_UPLOAD:-false}" = true ]; then
        printf '%s\n' 'Sentry source-map upload: explicitly disabled.'
    else
        printf '%s\n' 'Sentry source-map upload: enabled; credentials are required for a real build.'
    fi
    exit 0
fi

if [ "${SENTRY_DISABLE_AUTO_UPLOAD:-false}" != true ]; then
    if [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
        command -v security >/dev/null 2>&1 ||
            die 'SENTRY_AUTH_TOKEN is not set and macOS Keychain command "security" is unavailable.'
        [ -n "${USER:-}" ] || die 'USER is required to read the Sentry Keychain item.'
        SENTRY_AUTH_TOKEN=$(security find-generic-password \
            -a "$USER" \
            -s 'shopping-list-sentry-auth-token' \
            -w) || die 'Sentry token is missing. Add Keychain service "shopping-list-sentry-auth-token" for the current user or set SENTRY_AUTH_TOKEN.'
    fi

    [ -n "$SENTRY_AUTH_TOKEN" ] || die 'SENTRY_AUTH_TOKEN is empty.'
    export SENTRY_AUTH_TOKEN
else
    printf '%s\n' 'Sentry source-map upload is explicitly disabled (SENTRY_DISABLE_AUTO_UPLOAD=true).' >&2
fi

case " ${GRADLE_OPTS:-} " in
    *' --info '*|*' --debug '*|*' -i '*|*' -d '*)
        die 'GRADLE_OPTS must not enable --info or --debug while Sentry credentials are present.'
        ;;
esac

export GRADLE_OPTS="${GRADLE_OPTS:-} -Dorg.gradle.logging.level=quiet -Dorg.gradle.daemon=false"

printf 'Building %s APK: %s\n' "$environment" "$(basename "$apk_path")"
printf 'Sentry release: %s (dist %s)\n' "$SENTRY_RELEASE" "$SENTRY_DIST"

expo prebuild --clean --platform android
(
    cd android
    ./gradlew assembleRelease
)

source_apk='android/app/build/outputs/apk/release/app-release.apk'
[ -f "$source_apk" ] || die "Expected APK was not produced: $source_apk"
cp "$source_apk" "$apk_path"

printf 'APK created: %s\n' "$apk_path"
