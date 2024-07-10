// helper function to sort
export function sortBookingItems(itemWithTimeslots: any[]) {
    const now = new Date();
    return itemWithTimeslots.sort((a, b) => {
        const dateA = a.timeslot ? new Date(a.timeslot.date) : null;
        const dateB = b.timeslot ? new Date(b.timeslot.date) : null;

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        const futureA = dateA > now;
        const futureB = dateB > now;

        if (futureA && futureB) return dateA.getTime() - dateB.getTime(); // Both are in the future, closest first
        if (!futureA && !futureB) return dateB.getTime() - dateA.getTime(); // Both are in the past, closest first

        return futureA ? -1 : 1; // Future dates should come before past dates
    });
}