import { TimeGroup } from '../types';

export type GroupedSessions<T> = {
    [key in TimeGroup]?: T[];
};

export function getTimeGroup(date: string): TimeGroup {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes <= 5) {
        return TimeGroup.LAST_5_MIN;
    } else if (diffInMinutes <= 15) {
        return TimeGroup.LAST_15_MIN;
    } else if (diffInMinutes <= 60) {
        return TimeGroup.LAST_HOUR;
    } else if (diffInMinutes <= 60 * 3) {
        return TimeGroup.LAST_3_HOURS;
    } else if (diffInMinutes <= 60 * 24) {
        return TimeGroup.LAST_24_HOURS;
    } else if (diffInMinutes <= 60 * 24 * 7) {
        return TimeGroup.LAST_WEEK;
    } else if (diffInMinutes <= 60 * 24 * 30) {
        return TimeGroup.LAST_MONTH;
    } else {
        return TimeGroup.OLDER;
    }
}

export function getRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    return past.toLocaleDateString();
}
