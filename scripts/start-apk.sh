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
        package_name='com.anonymous.shoppinglist.dev'
        ;;
    prod)
        package_name='com.anonymous.shoppinglist'
        ;;
    *)
        usage
        ;;
esac

if [ "$dry_run" = true ]; then
    printf 'Environment: %s\n' "$environment"
    printf 'Package: %s\n' "$package_name"
    printf 'Device: %s\n' "${ANDROID_SERIAL:-auto-select on real start}"
    printf '%s\n' 'Dry run: adb shell monkey was not executed.'
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

adb -s "$device" shell pm path "$package_name" >/dev/null 2>&1 ||
    die "Package '$package_name' is not installed on '$device'. Run pnpm install:apk:$environment first."

adb -s "$device" shell monkey \
    -p "$package_name" \
    -c android.intent.category.LAUNCHER \
    1
