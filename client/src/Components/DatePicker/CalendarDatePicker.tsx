import React from 'react'
import { Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DateSegment, DateValue, Dialog, Group, Heading, I18nProvider, Label } from 'react-aria-components';
import "../../Assets/Style/ReactAria/DatePicker.css"
import { Popover, Button } from '@radix-ui/themes';

export const CalendarDatePicker = ({ onChange, defaultValue, ...props }: { onChange?: any, defaultValue?: DateValue }) => {


    return (
        <I18nProvider locale="en-RO-u-ca-gregory">
            <DatePicker onChange={onChange} defaultValue={defaultValue} {...props}>
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
        </I18nProvider>
    )
}
