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

// --- Registro de usuário ---

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
}

export interface RegisterResponse {
  user: { id: number; username: string; email: string };
  access: string;
  refresh: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch("http://127.0.0.1:8000/api/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
    }
    throw new Error(detail || "Falha ao registrar");
  }

  return res.json();
}

export async function updateTaskCompletion(
  token: string,
  id: number,
  is_completed: boolean
) {
  const res = await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_completed }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Falha ao atualizar tarefa: " + txt);
  }
  return res.json() as Promise<import("./api").Task>;
}
