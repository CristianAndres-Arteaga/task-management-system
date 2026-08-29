import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import type { Task, TaskStatus, CreateTaskData, UpdateTaskData } from "../../types/task";
import { KanbanColumn } from "./KanbanColumn";

const STATUSES: TaskStatus[] = ["pendiente", "en progreso", "completada"];

interface KanbanBoardProps {
  tasks: Task[];
  onCreate: (data: CreateTaskData) => Promise<void>;
  onUpdate: (taskId: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function KanbanBoard({ tasks, onCreate, onUpdate, onDelete }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.taskId === taskId);

    if (task && task.status !== newStatus) {
      onUpdate(task.taskId, { title: task.title, description: task.description, status: newStatus });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-wrap gap-6 justify-center">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onCreate={status === "pendiente" ? onCreate : undefined}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}