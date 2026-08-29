import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task, UpdateTaskData } from "../../types/task";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface KanbanCardProps {
  task: Task;
  onUpdate: (taskId: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function KanbanCard({ task, onUpdate, onDelete }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.taskId,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onUpdate(task.taskId, { title, description, status: task.status });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
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
      <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-2 shadow-sm">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        {error && <p className="text-error text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleSave} isLoading={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface border border-border rounded-xl p-3 shadow-sm flex flex-col gap-2"
    >
      <div className="flex items-start gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-text-secondary select-none mt-0.5"
          aria-label="Arrastrar tarea"
        >
          ⠿
        </span>
        <div className="flex-1">
          <p className="font-semibold text-text-primary">{task.title}</p>
          {task.description && <p className="text-sm text-text-secondary mt-1">{task.description}</p>}
        </div>
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          Editar
        </Button>
        <Button variant="danger" onClick={() => setShowConfirm(true)} isLoading={saving}>
          {saving ? "Borrando..." : "Eliminar"}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Borrar tarea"
        message={`¿Seguro que querés borrar la tarea "${task.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}