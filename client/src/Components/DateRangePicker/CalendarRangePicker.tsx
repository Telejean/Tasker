import { Button, CalendarCell, CalendarGrid, DateInput, DateRangePicker, DateSegment, Dialog, Group, Heading, I18nProvider, Popover, RangeCalendar } from 'react-aria-components';
import "../../assets/Style/ReactAria/DateRangePicker.css";
import { DateRangePickerStateContext } from 'react-aria-components';
import { useContext } from 'react';

const DateRangePickerClearButton = () => {
    const calendarState = useContext(DateRangePickerStateContext);
    return (
        <Button
            slot={null}
            className="clear-button"
            aria-label="Clear"
            onPress={() => {
                if(calendarState)
                    calendarState.setValue(null);
            }}
        >
            ✕
        </Button>
    );
}

const CalendarRangePicker = ({ ...props }) => {
    return (
        <I18nProvider locale="en-RO-u-ca-gregory">
            <DateRangePicker {...props}>
                <Group className="date-range-input-group">
                    <DateInput slot="start">
                        {(segment) => <DateSegment segment={segment} />}
                    </DateInput>
                    <span aria-hidden="true">-</span>
                    <DateInput slot="end">
                        {(segment) => <DateSegment segment={segment} />}
                    </DateInput>
                    <DateRangePickerClearButton />
                </Group>

                <RangeCalendar>
                    <header>
                        <Button slot="previous">◀</Button>
                        <Heading />
                        <Button slot="next">▶</Button>
                    </header>
                    <CalendarGrid>
                        {(date) => <CalendarCell date={date} />}
                    </CalendarGrid>
                </RangeCalendar>
            </DateRangePicker>
        </I18nProvider>
    );
}

export default CalendarRangePicker;