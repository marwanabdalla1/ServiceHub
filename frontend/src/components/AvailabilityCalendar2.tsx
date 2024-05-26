import * as React from 'react';
import Paper from '@mui/material/Paper';
import { ViewState, EditingState, IntegratedEditing, AppointmentModel } from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    DayView,
    Appointments,
    AppointmentForm,
    AppointmentTooltip,
    ConfirmationDialog,
} from '@devexpress/dx-react-scheduler-material-ui';

interface Appointment extends AppointmentModel {
    id?: number;
    startDate: string;
    endDate: string;
    title: string;
    type: string;
}

const appointments: Appointment[] = [{
    id: 0,
    startDate: '2018-10-31T10:00',
    endDate: '2018-10-31T11:15',
    title: 'Meeting',
    type: 'private',
}, {
    id: 1,
    startDate: '2018-10-31T07:30',
    endDate: '2018-10-31T09:00',
    title: 'Go to a gym',
    type: 'work',
}];

interface State {
    data: Appointment[];
    currentDate: string;
}

interface ChangeSet {
    added?: Partial<Appointment>;
    changed?: { [key: number]: Partial<Appointment> };
    deleted?: string | number | undefined;
}

export default class Demo extends React.PureComponent<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            data: appointments,
            currentDate: '2018-06-27',
        };

        this.commitChanges = this.commitChanges.bind(this);
    }

    commitChanges({ added, changed, deleted }: ChangeSet): void {
        this.setState((state) => {
            let { data } = state;
            if (added) {
                const startingAddedId = data.length > 0 ? data[data.length - 1].id! + 1 : 0;
                data = [...data, { id: startingAddedId, ...added } as Appointment];
            }
            if (changed) {
                data = data.map(appointment => (
                    appointment.id !== undefined && changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } as Appointment : appointment));
            }
            if (deleted !== undefined) {
                data = data.filter(appointment => appointment.id !== deleted);
            }
            return { data };
        });
    }

    render() {
        const { currentDate, data } = this.state;

        return (
            <Paper>
                <Scheduler
                    data={data}
                    height={660}
                >
                    <ViewState
                        currentDate={currentDate}
                    />
                    <EditingState
                        onCommitChanges={this.commitChanges}
                    />
                    <IntegratedEditing />
                    <DayView
                        startDayHour={9}
                        endDayHour={19}
                    />
                    <ConfirmationDialog />
                    <Appointments />
                    <AppointmentTooltip
                        showOpenButton
                        showDeleteButton
                    />
                    <AppointmentForm />
                </Scheduler>
            </Paper>
        );
    }
}
