import { Button, Dialog, Flex, TextField } from '@radix-ui/themes'
import React from 'react'
import { Text } from 'react-aria-components'
import { LuCirclePlus } from 'react-icons/lu'
import { CalendarDatePicker } from '../DatePicker/CalendarDatePicker'

export const TasksAdd = () => {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size='3'>
                    <LuCirclePlus size="1.5em" strokeWidth={3} />
                    Add task
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Add task</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Add a new task
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Name
                        </Text>
                        <TextField.Root
                            placeholder="Task name"
                        />
                    </label>

                    <label>
                        <CalendarDatePicker />
                    </label>

                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button>Save</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
}
