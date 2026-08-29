import { useState } from "react";
import type { CreateTaskData } from "../types/task";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";

interface TaskFormProps {
  onCreate: (data: CreateTaskData) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({ onCreate, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreate({ title, description });
      setTitle("");
      setDescription("");
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mb-6 bg-surface border border-border rounded-xl p-6 shadow-sm"
    >
      <Input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      {error && <p className="text-error text-sm">{error}</p>}
      <Button type="submit" isLoading={loading}>
        {loading ? "Creando..." : "Crear tarea"}
      </Button>
      {onCancel && (
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      )}
    </form>
  );
}