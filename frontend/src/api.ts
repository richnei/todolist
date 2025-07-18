// src/api.ts
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";

export interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
  owner: number;
}

interface TaskListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function listTasks(token: string) {
  return apiRequest<TaskListResponse>("/tasks/", {}, token);
}

export function createTask(
  token: string,
  data: { title: string; description?: string }
) {
  return apiRequest<Task>("/tasks/", {
    method: "POST",
    body: JSON.stringify({ ...data, is_completed: false }),
  }, token);
}

export async function login(username: string, password: string) {
  const res = await fetch("http://127.0.0.1:8000/api/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });
  if (!res.ok) throw new Error("Credenciais inválidas");
  return res.json() as Promise<{ access: string; refresh: string }>;
}

