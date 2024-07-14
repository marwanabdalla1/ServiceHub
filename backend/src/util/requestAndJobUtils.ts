import { isPast, isFuture, parseISO, compareAsc, compareDesc } from 'date-fns';

// helper function to sort
export function sortBookingItems(itemWithTimeslots: any[]) {
    const now = new Date();
    return itemWithTimeslots.sort((a, b) => {
        const dateA = a.timeslot?.start || a.appointmentStartTime;
        const dateB = b.timeslot?.start || b.appointmentStartTime;

        // Sort logic to put invalid or special cases at the end or start
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // or -1 to put at start
        if (!dateB) return -1; // or 1 to put at start

        // Future dates sorted descending from nearest to farthest
        if (isFuture(dateA) && isFuture(dateB)) {
            return compareAsc(dateA, dateB);
        }
        // Past dates sorted ascending from the most recent to the oldest
        if (isPast(dateA) && isPast(dateB)) {
            return compareDesc(dateA, dateB);
        }

        // Future dates should come before past dates
        if (isFuture(dateA) && isPast(dateB)) {
            return -1;
        }
        if (isPast(dateA) && isFuture(dateB)) {
            return 1;
        }

        return 0;
    });
}