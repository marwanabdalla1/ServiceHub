import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, parseISO, Locale, getDay} from 'date-fns';
import { Availability, DaysOfWeek } from "../models/Availability";

import { dateFnsLocalizer } from 'react-big-calendar';
import {enUS} from "@mui/material/locale";

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parseISO,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

function AvailabilityCalendar() {
    const [availability, setAvailability] = useState<Availability[]>([]);

    const parse = (input: string, formatString: string, locale?: Locale) => parseISO(input); // Simplified example

    // Handlers for click and drag to create availability
    const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
        const range = eachDayOfInterval({ start, end });
        // convert range to your Availability format and update state
        console.log(range); // Just for debugging
        // Assume all-day availability
        setAvailability([...availability, { dayOfWeek: start.getDay(), isFixed: true, timeslots: [{ start, end }] }]);
    };

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={availability.map(a => ({
                    start: a.timeslots[0].start,
                    end: a.timeslots[0].end,
                    title: 'Available'
                }))}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable
                onSelectSlot={handleSelect}
            />
            <button onClick={() => console.log(availability)}>Save Availability</button>
        </div>
    );
}

export default AvailabilityCalendar;
