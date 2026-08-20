import { useState } from "react";
import type { Task, TaskStatus, UpdateTaskData } from "../types/task";

const STATUS_OPTIONS: TaskStatus[] = ["pendiente", "en progreso", "completada"];

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onUpdate(task.taskId, { title, description, status });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Seguro que querés borrar la tarea "${task.title}"?`)) {
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onDelete(task.taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <li className="border rounded p-3 flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="border rounded px-2 py-1"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="bg-blue-601">
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={() => setIsEditing(false)} disabled={saving} className="border rounded px-3 py-1">
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="border rounded p-3 flex justify-between items-start">
      <div>
        <p className="font-semibold">{task.title}</p>
        <p className="text-sm text-gray-600">{task.description}</p>
        <p className="text-xs text-gray-500">{task.status}</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="border rounded px-3 py-1">
          Editar
        </button>
        <button onClick={handleDelete} disabled={saving} className="border rounded px-3 py-1 text-red-600">
          {saving ? "Borrando..." : "Eliminar"}
        </button>
      </div>
    </li>
  );
}