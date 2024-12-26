export enum TimeGroup {
    LAST_5_MIN = 'Just Now',
    LAST_15_MIN = 'Last 15 Minutes',
    LAST_HOUR = 'Last Hour',
    LAST_3_HOURS = 'Last 3 Hours',
    LAST_24_HOURS = 'Last 24 Hours',
    LAST_WEEK = 'Last Week',
    LAST_MONTH = 'Last Month',
    OLDER = 'Older',
}

export const TIME_THRESHOLDS = {
    FIVE_MINUTES: 5,
    FIFTEEN_MINUTES: 15,
    ONE_HOUR: 60,
    THREE_HOURS: 3,
    TWENTY_FOUR_HOURS: 24,
    ONE_WEEK: 7,
    ONE_MONTH: 30,
} as const;

export const TIME_GROUP_ORDER: { [key in TimeGroup]: number } = {
    [TimeGroup.LAST_5_MIN]: 0,
    [TimeGroup.LAST_15_MIN]: 1,
    [TimeGroup.LAST_HOUR]: 2,
    [TimeGroup.LAST_3_HOURS]: 3,
    [TimeGroup.LAST_24_HOURS]: 4,
    [TimeGroup.LAST_WEEK]: 5,
    [TimeGroup.LAST_MONTH]: 6,
    [TimeGroup.OLDER]: 7,
};

export type GroupedSessions<T> = {
    [key in TimeGroup]?: T[];
};

export function getTimeGroup(date: string): TimeGroup {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes <= TIME_THRESHOLDS.FIVE_MINUTES) {
        return TimeGroup.LAST_5_MIN;
    } else if (diffInMinutes <= TIME_THRESHOLDS.FIFTEEN_MINUTES) {
        return TimeGroup.LAST_15_MIN;
    } else if (diffInMinutes <= TIME_THRESHOLDS.ONE_HOUR) {
        return TimeGroup.LAST_HOUR;
    } else if (diffInHours <= TIME_THRESHOLDS.THREE_HOURS) {
        return TimeGroup.LAST_3_HOURS;
    } else if (diffInHours <= TIME_THRESHOLDS.TWENTY_FOUR_HOURS) {
        return TimeGroup.LAST_24_HOURS;
    } else if (diffInDays <= TIME_THRESHOLDS.ONE_WEEK) {
        return TimeGroup.LAST_WEEK;
    } else if (diffInDays <= TIME_THRESHOLDS.ONE_MONTH) {
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
