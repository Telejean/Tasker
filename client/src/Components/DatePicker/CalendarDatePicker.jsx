import React from 'react'
import { Button, Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DateSegment, Dialog, Group, Heading, Label, Popover } from 'react-aria-components';
import "../../Assets/Style/ReactAria/DatePicker.css"

export const CalendarDatePicker = () => {
    return (

        <DatePicker>
            <Label>Date</Label>
            <Group>
                <DateInput>
                    {(segment) => <DateSegment segment={segment} />}
                </DateInput>
            </Group>
                    <Calendar>
                        <header>
                            <Button slot="previous">◀</Button>
                            <Heading />
                            <Button slot="next">▶</Button>
                        </header>
                        <CalendarGrid>
                            {(date) => <CalendarCell date={date} />}
                        </CalendarGrid>
                    </Calendar>
        </DatePicker>
    )
}
