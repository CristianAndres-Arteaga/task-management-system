import type { Task, UpdateTaskData } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onUpdate: (taskId: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskList({ tasks, onUpdate, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-gray-500">No tenés tareas todavía.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.taskId} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}