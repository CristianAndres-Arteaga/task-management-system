import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus, CreateTaskData, UpdateTaskData } from "../../types/task";
import { KanbanCard } from "./KanbanCard";
import { TaskForm } from "../TaskForm";

const COLUMN_TITLES: Record<TaskStatus, string> = {
  pendiente: "Pendiente",
  "en progreso": "En progreso",
  completada: "Completada",
};

const COLUMN_ACCENTS: Record<TaskStatus, string> = {
  pendiente: "border-t-status-pending",
  "en progreso": "border-t-status-progress",
  completada: "border-t-status-done",
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onCreate?: (data: CreateTaskData) => Promise<void>;
  onUpdate: (taskId: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function KanbanColumn({
  status,
  tasks,
  onCreate,
  onUpdate,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [isAdding, setIsAdding] = useState(false);

  const baseClasses = "flex-1 min-w-[260px] max-w-md";
  const bgClass = "bg-background";
  const accentClass = COLUMN_ACCENTS[status];
  const roundedPadding = "rounded-xl p-3";
  const flexLayout = "flex flex-col gap-3";
  const minHeight = "min-h-[320px]";
  const transition = "transition-colors";
  const hoverClass = isOver ? "ring-2 ring-primary" : "";

  const columnClassName = [
    baseClasses,
    bgClass,
    "border-t-4",
    accentClass,
    roundedPadding,
    flexLayout,
    minHeight,
    transition,
    hoverClass,
  ].join(" ");

  const addButtonClassName = [
    "text-sm font-medium text-primary hover:text-primary-hover",
    "text-left px-1 rounded",
    "focus:outline-none focus:ring-2 focus:ring-primary/50",
  ].join(" ");

  return (
    <div ref={setNodeRef} className={columnClassName}>
      <h2 className="font-semibold text-text-primary flex items-center justify-between">
        {COLUMN_TITLES[status]}
        <span className="text-xs font-normal text-text-secondary bg-surface border border-border rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </h2>

      {onCreate &&
        (isAdding ? (
          <TaskForm onCreate={onCreate} onCancel={() => setIsAdding(false)} />
        ) : (
          <button onClick={() => setIsAdding(true)} className={addButtonClassName}>
            + Nueva tarea
          </button>
        ))}

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <KanbanCard key={task.taskId} task={task} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}