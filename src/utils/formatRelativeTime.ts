export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.max(
        0,
        Math.floor((now.getTime() - date.getTime()) / 1000)
    );

    if (diffInSeconds < 60) {
        return 'Updated just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
        return `Updated ${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `Updated ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 1) {
        return 'Updated yesterday';
    }

    return `Updated ${diffInDays} days ago`;
}
