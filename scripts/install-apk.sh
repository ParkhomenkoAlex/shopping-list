#!/bin/sh

set -eu

die() {
    printf 'Error: %s\n' "$*" >&2
    exit 1
}

usage() {
    printf 'Usage: %s <dev|prod> [apk-path] [--dry-run]\n' "$0" >&2
    exit 1
}

[ "$#" -ge 1 ] || usage

environment="$1"
shift

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

apk_path=''
dry_run=false
for argument in "$@"; do
    case "$argument" in
        --)
            ;;
        --dry-run)
            dry_run=true
            ;;
        *)
            [ -z "$apk_path" ] || usage
            apk_path="$argument"
            ;;
    esac
done

project_root=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$project_root"

if [ -z "$apk_path" ]; then
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
fi

[ -f "$apk_path" ] || die "APK file not found: $apk_path"

case "$(basename "$apk_path")" in
    "$apk_prefix"-*-v*.apk)
        ;;
    *)
        die "Refusing to install an APK that does not match ${apk_prefix}-<build>-v<version>.apk."
        ;;
esac

if [ "$dry_run" = true ]; then
    printf 'Environment: %s\n' "$environment"
    printf 'APK: %s\n' "$apk_path"
    printf 'Device: %s\n' "${ANDROID_SERIAL:-auto-select on real install}"
    printf '%s\n' 'Dry run: adb install was not executed.'
    exit 0
fi

command -v adb >/dev/null 2>&1 ||
    die 'adb was not found. Install Android SDK Platform-Tools and add adb to PATH.'

if [ -n "${ANDROID_SERIAL:-}" ]; then
    device="$ANDROID_SERIAL"
    [ "$(adb -s "$device" get-state 2>/dev/null)" = device ] ||
        die "Android device '$device' is unavailable. Check: adb devices -l"
else
    devices=$(adb devices | awk 'NR > 1 && $2 == "device" { print $1 }')
    device_count=$(printf '%s\n' "$devices" | awk 'NF { count += 1 } END { print count + 0 }')

    [ "$device_count" -gt 0 ] ||
        die 'No authorized Android device found. Check: adb devices -l'
    [ "$device_count" -eq 1 ] ||
        die "Multiple Android devices are connected. Set ANDROID_SERIAL. Available: $devices"

    device="$devices"
fi

adb -s "$device" install -r "$apk_path"
printf 'Installed %s on %s.\n' "$(basename "$apk_path")" "$device"
