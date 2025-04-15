import { Button, CalendarCell, CalendarGrid, DateInput, DateRangePicker, DateSegment, Dialog, Group, Heading, Popover, RangeCalendar } from 'react-aria-components';
import "../../assets/Style/ReactAria/DateRangePicker.css";
import { DateRangePickerStateContext } from 'react-aria-components';
import React, { useContext } from 'react';

const DateRangePickerClearButton = () => {
    const state = useContext(DateRangePickerStateContext);
    return (
        <Button
            slot={null}
            className="clear-button"
            aria-label="Clear"
            onPress={() => state.setValue(null)}
        >
            ✕
        </Button>
    );
}

const CalendarRangePicker = ({...props}) => {
    return (
        <DateRangePicker isOpen>
            <Group className="date-range-input-group">
                <DateInput slot="start">
                    {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <span aria-hidden="true">–</span>
                <DateInput slot="end">
                    {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <DateRangePickerClearButton />
            </Group>
            {/* Render the calendar directly without a Popover/Dialog */}
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
    );
}

export default CalendarRangePicker;