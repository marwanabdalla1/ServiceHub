// util functino for converting/formatting dates

export const formatDateTime = (date: any) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleString('en-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit', // hour in 2-digit format
        minute: '2-digit', // minute in 2-digit format
        hour12: false // use AM/PM
    });
};