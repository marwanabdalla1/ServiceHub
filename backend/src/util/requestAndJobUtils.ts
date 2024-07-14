import { isPast, isFuture, parseISO, compareAsc, compareDesc } from 'date-fns';

// helper function to sort
export function sortBookingItemsDirect(itemWithTimeslots: any[]) {
    const now = new Date();
    return itemWithTimeslots.sort((a, b) => {
        const dateA = a.timeslot?.start || a.appointmentStartTime;
        const dateB = b.timeslot?.start || b.appointmentStartTime;

        // const aHasNullFields = !a.provider || !a.requestedBy || !a.receiver;
        // const bHasNullFields = !b.provider || !b.requestedBy || !b.receiver;

        // // Prioritize items with null fields to sort them to the end
        // if (aHasNullFields && bHasNullFields) return 0; // Both have null, order doesn’t change
        // if (aHasNullFields) return 1; // a has null, sort a to the end
        // if (bHasNullFields) return -1; // b has null, sort b to the end
        //
        //
        // // Sort logic to put invalid or special cases at the end or start
        // if (!dateA && !dateB) return 0;
        // if (!dateA) return 1; // or -1 to put at start
        // if (!dateB) return -1; // or 1 to put at start

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


// Helper function to sort booking items
export function sortBookingItems(itemWithTimeslots: any[]) {
    // Separate items with and without null fields
    const itemsWithNullFields = [];
    const validItems = [];

    // Divide items into two lists
    for (const item of itemWithTimeslots) {
        // Check if the provider is null
        const hasValidProvider = item.provider != null;

        // Check if at least one of requestedBy or receiver is non-null
        const hasValidRequestedOrReceiver = item.requestedBy != null || item.receiver != null;

        // Push to the appropriate list based on validity of the fields
        if (hasValidProvider && hasValidRequestedOrReceiver) {
            validItems.push(item);
        } else {
            itemsWithNullFields.push(item);
        }
    }

    console.log("invalid items", itemsWithNullFields.length)

    // Sort valid items by time
    const sortedValidItems = sortBookingItemsDirect(validItems);
    const sortedNullItems = sortBookingItemsDirect(itemsWithNullFields);


    // Append items with null fields to the end of the sorted list
    return sortedValidItems.concat(sortedNullItems);
}
