import React from 'react'
import { Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DateSegment, Dialog, Group, Heading, Label } from 'react-aria-components';
import "../../Assets/Style/ReactAria/DatePicker.css"
import { Popover, Button } from '@radix-ui/themes';

export const CalendarDatePicker = ({onChange}) => {


    return (
        <DatePicker onChange={onChange}>
            <Popover.Root>
                <DateInput>
                    {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <Popover.Trigger>
                    <Button variant="soft">
                    ▼
                    </Button>
                </Popover.Trigger>

                <Popover.Content>
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
                </Popover.Content>
            </Popover.Root>

        </DatePicker>
    )
}
