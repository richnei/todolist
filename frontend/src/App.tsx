import { useState, useEffect } from "react";
import { listTasks, createTask, login, register, updateTaskCompletion } from "./api";
import type { Task } from "./api";


interface StatusMessage {
  type: "error" | "info";
  text: string;
}

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("access") || null);
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refresh") || null);

  // Modo de tela inicial: login ou register
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login/Register form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<StatusMessage | null>(null);

  // Criar tarefa
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
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
      setFormError(err.message || "Falha ao autenticar");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const resp = await register({ username, password, email: email || undefined });
      setAccessToken(resp.access);
      setRefreshToken(resp.refresh);
      localStorage.setItem("access", resp.access);
      localStorage.setItem("refresh", resp.refresh);
      setUsername("");
      setPassword("");
      setEmail("");
      setStatusMsg({ type: "info", text: "Conta criada e login efetuado." });
    } catch (err: any) {
      setFormError(err.message || "Falha ao registrar");
    } finally {
      setFormLoading(false);
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

  async function handleToggle(task: Task) {
    if (!accessToken) return;
    try {
      const updated = await updateTaskCompletion(accessToken, task.id, !task.is_completed);
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
      setStatusMsg({
        type: "info",
        text: updated.is_completed ? "Tarefa marcada como concluída." : "Tarefa reaberta."
      });
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
    setStatusMsg({ type: "info", text: "Sessão encerrada." });
  }

  useEffect(() => {
    if (accessToken) loadTasks();
  }, [accessToken]);

  // --------- Tela inicial (login / register) ----------
  if (!accessToken) {
    const isLogin = mode === "login";
    return (
      <div className="login-wrapper">
        <div className="login-card fade-in">
          <div className="brand">
            <div className="brand-dot" />
            <div>
              <h1 style={{ fontSize: 24, margin: 0 }}>To‑Do Manager</h1>
              <div className="muted" style={{ marginTop: 2 }}>
                Teste Técnico • {isLogin ? "Login" : "Cadastro"}
              </div>
            </div>
          </div>

          <form
            className="login-form"
            onSubmit={isLogin ? handleLogin : handleRegister}
            autoComplete="on"
          >
            <div className="field-group">
              <label>Usuário</label>
              <input
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ex: meu_usuario"
                required
              />
            </div>

            {!isLogin && (
              <div className="field-group">
                <label>E-mail (opcional)</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            )}

            <div className="field-group">
              <label>Senha</label>
              <input
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {formError && (
              <div className="error-box fade-in">
                <span style={{ fontWeight: 600 }}>Erro:</span> {formError}
              </div>
            )}

            <div className="actions-row" style={{ flexWrap: "wrap", gap: 12 }}>
              <button
                type="submit"
                className="primary"
                disabled={formLoading}
                style={{ minWidth: 140, justifyContent: "center" }}
              >
                {formLoading ? <div className="spinner" /> : (isLogin ? "Entrar" : "Registrar")}
              </button>

              <button
                type="button"
                className="outline"
                onClick={() => {
                  setFormError(null);
                  setPassword("");
                  setEmail("");
                  // alterna modo
                  setMode(isLogin ? "register" : "login");
                }}
                style={{ minWidth: 140, justifyContent: "center" }}
              >
                {isLogin ? "Criar conta" : "Já tenho conta"}
              </button>
            </div>
          </form>

          <p className="muted" style={{ marginTop: 28 }}>
            {isLogin
              ? "Não tem conta? Clique em 'Criar conta'."
              : "Já tem uma conta? Clique em 'Já tenho conta'."}
          </p>
        </div>
      </div>
    );
  }

  // --------- App logado ----------
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
                opacity: t.is_completed ? 0.8 : 1
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <strong
                  style={{
                    fontSize: 15,
                    lineHeight: 1.3,
                    textDecoration: t.is_completed ? "line-through" : "none",
                    color: t.is_completed ? "#9aa4b1" : "var(--text)"
                  }}
                >
                  {t.title}
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: ".5px",
                    color: t.is_completed ? "#7dd97d" : "#ffdf6a",
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}
                >
                  {t.is_completed ? "Feita" : "Pendente"}
                </span>
              </div>

              {t.description && (
                <div
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-dim)",
                    lineHeight: 1.4,
                    textDecoration: t.is_completed ? "line-through" : "none"
                  }}
                >
                  {t.description}
                </div>
              )}

              {/* Botões de ação */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => handleToggle(t)}
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--bg-alt)",
                    color: t.is_completed ? "#ffdf6a" : "#7dd97d",
                    fontSize: 12,
                    padding: "6px 10px",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  {t.is_completed ? "Reabrir" : "Concluir"}
                </button>
                {/* (Opcional futuro) Botões de editar / deletar podem ir aqui */}
              </div>

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
