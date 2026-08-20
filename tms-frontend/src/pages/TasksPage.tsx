import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as tasksApi from "../api/tasks";
import type { Task, CreateTaskData, UpdateTaskData } from "../types/task";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis tareas</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button onClick={logout} className="border rounded px-3 py-1">
            Cerrar sesión
          </button>
        </div>
      </div>

      <TaskForm onCreate={handleCreate} />

      {loading && <p>Cargando tareas...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    </div>
  );                                                                                                                                                                                  }