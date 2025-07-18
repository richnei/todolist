import { useState, useEffect } from "react";
import { listTasks, createTask, login } from "./api";
import type { Task } from "./api";

interface StatusMessage {
  type: "error" | "info";
  text: string;
}

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("access") || null);
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refresh") || null);

  // Login form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null);

  // Create Task
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const tokens = await login(username, password);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);
      setUsername("");
      setPassword("");
      setStatusMsg({ type: "info", text: "Login realizado." });
    } catch (err: any) {
      setLoginError(err.message || "Falha ao autenticar");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadTasks() {
    if (!accessToken) return;
    setTasksLoading(true);
    try {
      const data = await listTasks(accessToken);
      setTasks(data.results);
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e.message });
    } finally {
      setTasksLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    if (!title.trim()) return;
    try {
      const newTask = await createTask(accessToken, { title, description });
      setTasks(prev => [newTask, ...prev]);
      setTitle("");
      setDescription("");
      setStatusMsg({ type: "info", text: "Tarefa criada." });
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e.message });
    }
  }

  function handleLogout() {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setTasks([]);
  }

  useEffect(() => {
    if (accessToken) loadTasks();
  }, [accessToken]);

  // --- Login Screen ---
  if (!accessToken) {
    return (
      <div className="login-wrapper">
        <div className="login-card fade-in">
          <div className="brand">
            <div className="brand-dot" />
            <div>
              <h1 style={{ fontSize: 24, margin: 0 }}>To‑Do Manager</h1>
              <div className="muted" style={{ marginTop: 2 }}>Teste Técnico • Login</div>
            </div>
          </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="field-group">
                <label>Usuário</label>
                <input
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ex: teste_01"
                  required
                />
              </div>

              <div className="field-group">
                <label>Senha</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="error-box fade-in">
                  <span style={{ fontWeight: 600 }}>Erro:</span> {loginError}
                </div>
              )}

              <div className="actions-row">
                <button
                  type="submit"
                  className="primary"
                  disabled={loginLoading}
                  style={{ minWidth: 120, justifyContent: "center" }}
                >
                  {loginLoading ? <div className="spinner" /> : "Entrar"}
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setLoginError(null);
                  }}
                >
                  Limpar
                </button>
              </div>
            </form>

            <p className="muted" style={{ marginTop: 28 }}>
              Use o usuário criado via <code>createsuperuser</code>.  
              (Depois você pode implementar registro.)
            </p>
        </div>
      </div>
    );
  }

  // --- App (logado) ---
  return (
    <div style={{ maxWidth: 880, margin: "42px auto", padding: "0 24px" }} className="fade-in">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="brand-dot" />
          <h1 style={{ fontSize: 26, margin: 0 }}>To‑Do Manager</h1>
        </div>
        <button onClick={handleLogout} className="outline">
          Sair
        </button>
      </header>

      {statusMsg && (
        <div
          className="fade-in"
          style={{
            background:
              statusMsg.type === "error"
                ? "linear-gradient(135deg,#ff5f6d,#eb3349)"
                : "linear-gradient(135deg,#2b5876,#4e4376)",
            padding: "10px 16px",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <strong>{statusMsg.type === "error" ? "Erro" : "Info"}:</strong> {statusMsg.text}
        </div>
      )}

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Nova Tarefa</h2>
        <form
          onSubmit={handleCreate}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            background: "var(--card)",
            padding: "18px 18px 20px",
            borderRadius: 18,
            border: "1px solid var(--border)",
          }}
        >
          <input
            required
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: "1 1 220px",
              background: "var(--bg-alt)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "12px 14px",
              borderRadius: 12,
              outline: "none",
            }}
          />
          <input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              flex: "2 1 320px",
              background: "var(--bg-alt)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "12px 14px",
              borderRadius: 12,
              outline: "none",
            }}
          />
          <button type="submit" className="primary" style={{ padding: "12px 24px" }}>
            Adicionar
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>
          Tarefas {tasksLoading && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>(carregando...)</span>}
        </h2>

        {tasks.length === 0 && !tasksLoading && (
          <p className="muted">Nenhuma tarefa criada ainda.</p>
        )}

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          }}
        >
          {tasks.map(t => (
            <div
              key={t.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "16px 18px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ fontSize: 15, lineHeight: 1.3 }}>{t.title}</strong>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: t.is_completed ? "#7dd97d" : "#ffdf6a",
                    fontWeight: 600,
                  }}
                >
                  {t.is_completed ? "Feita" : "Pendente"}
                </span>
              </div>
              {t.description && (
                <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.4 }}>
                  {t.description}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#6f7a86", marginTop: "auto" }}>
                Criada: {new Date(t.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
