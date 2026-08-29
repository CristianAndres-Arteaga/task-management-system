import { useEffect, useState } from "react";
import { useAuth } from '../hooks/useAuth';
import * as tasksApi from "../api/tasks";
import type { Task, CreateTaskData, UpdateTaskData } from "../types/task";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { Button } from "../components/ui/Button";

export function TasksPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tasksApi
      .listTasks()
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar tareas"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: CreateTaskData) => {
    const newTask = await tasksApi.createTask(data);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdate = async (taskId: string, data: UpdateTaskData) => {
    const updated = await tasksApi.updateTask(taskId, data);
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
  };

  const handleDelete = async (taskId: string) => {
    await tasksApi.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  };

  return (
    <div>
      <header className="bg-surface border-b border-border">
        <div className="px-6 md:px-10 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-primary">Mis tareas</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{user?.email}</span>
            <Button variant="secondary" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-6">
        {loading && <p className="text-text-secondary">Cargando tareas...</p>}
        {error && <p className="text-error">{error}</p>}
        {!loading && !error && (
          <KanbanBoard tasks={tasks} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}