export type TaskStatus = "pendiente" | "en progreso" | "completada";

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}   