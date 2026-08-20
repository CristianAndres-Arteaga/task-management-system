import axios from "axios";
import { getAccessToken } from "./auth";
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus } from "../types/task";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function listTasks(status?: TaskStatus): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await apiClient.post<Task>("/tasks", data);
  return response.data;
}

export async function updateTask(
  taskId: string,
  data: UpdateTaskData
): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${taskId}`, data);
  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}