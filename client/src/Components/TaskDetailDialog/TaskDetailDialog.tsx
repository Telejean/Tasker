import { Box, Flex, Text, Badge, Dialog, TextField, TextArea, Select, Button } from "@radix-ui/themes";
import { CalendarDatePicker } from "../DatePicker/CalendarDatePicker";
import { useEffect, useState } from "react";
import {  DateValue, parseDate, parseDateTime } from "@internationalized/date";
import { Task, User } from "@my-types/types";
import { taskService } from "../../Services/task.service";

type TaskWithDateValue = Omit<Task, "deadline"> & { deadline: DateValue };


const TaskDetailDialog = ({ task, open, onOpenChange, onTaskUpdate}: {
  task: Task;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onTaskUpdate: (task: Task) => void;
}) => {

  const [editedTask, setEditedTask] = useState<TaskWithDateValue>({
    ...task,
    deadline: parseDate(task.deadline.toISOString().slice(0, 10)),
  });

  useEffect(() => {
    setEditedTask({
      ...task,
      deadline: parseDate(task.deadline.toISOString().slice(0, 10)),
    });
  }, [open, task]);

  const handleDateChange = (date: DateValue) => {
    setEditedTask((prev) => ({
      ...prev,
      deadline: date,
    }));
  };
  const handleStatusChange = (value: string) => {
    setEditedTask((prev) => ({
      ...prev,
      status: value,
    }));
  };


  const handlePriorityChange = (value: string) => {
    setEditedTask((prev) => ({
      ...prev,
      priority: value,
    }));
  };

  const handleSave = () => {
    onTaskUpdate({...editedTask, deadline: taskService.dateValueToString(editedTask.deadline)});
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: "500px" }}>
        <Dialog.Title>Task Details</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          View and edit task information
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Task Name
            </Text>
            <TextField.Root
              value={editedTask.name}
              onChange={(e) =>
                setEditedTask((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Description
            </Text>
            <TextArea
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Status
            </Text>
            <Select.Root
              value={editedTask.status}
              onValueChange={handleStatusChange}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="NOT_STARTED">Not Started</Select.Item>
                <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
                <Select.Item value="COMPLETED">Completed</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Priority
            </Text>
            <Select.Root
              value={editedTask.priority}
              onValueChange={handlePriorityChange}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="HIGH">High</Select.Item>
                <Select.Item value="MEDIUM">Medium</Select.Item>
                <Select.Item value="LOW">Low</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Deadline
            </Text>
            <CalendarDatePicker
              defaultValue={editedTask.deadline}
              onChange={handleDateChange}
            />
          </label>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Project
            </Text>
            <TextField.Root value={editedTask.project?.name || ""} readOnly />
          </label>

          {editedTask.assignedUsers && (
            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                Collaborators
              </Text>
              <Flex gap="1" wrap="wrap">
                {editedTask.assignedUsers.map((user: User, index: number) => (
                  <Badge key={user.id || index} variant="soft">
                    {user.name} {user.surname}
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSave}>Save Changes</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default TaskDetailDialog;