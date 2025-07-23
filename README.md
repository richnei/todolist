# To‑Do Manager

Aplicação full‑stack de gerenciamento de tarefas (**To‑Do List**) construída com **Django + Django REST Framework** no back‑end e **React (Vite + TypeScript)** no front‑end.

> **Status:** Todos os requisitos **obrigatórios** concluídos + Docker + Testes unitários básicos.  
> **Foco:** Código limpo, simples (KISS), evitado duplicações (DRY) e organizado para facilitar extensão (SOLID).

---

## 📋 Requisitos do Teste e Cobertura

| Requisito | Situação | Observações |
|-----------|----------|-------------|
| CRUD de Tarefas | ✅ | Endpoints REST + operações no front (criar, listar, editar, deletar, toggle) |
| Cadastro e Login | ✅ | Registro custom `/api/register/` + JWT (`/api/token/`) |
| Marcar tarefa concluída / não concluída | ✅ | Campo `is_completed` + ação toggle (PATCH) |
| Filtragem de tarefas | ✅ | Query param `?is_completed=true/false` + botões no front |
| Paginação | ✅ | DRF PageNumberPagination (10 itens) + controle de páginas no front |
| Front em React | ✅ | Vite + TS + estado local simples |
| Back com Django REST Framework | ✅ | ViewSet + serializers + filtros |
| Dockerização (opcional) | ✅ | `Dockerfile` backend (Gunicorn) + frontend (Nginx) + `docker-compose.yml` |
| Testes com pytest (opcional) | ✅ | Testes de auth, CRUD, filtro, paginação |
---

## 🏗 Arquitetura Resumida

```
/backend
  core/           # Configurações Django
  tasks/
    models.py
    serializers.py
    views.py
    views_auth.py
    urls (router em core.urls)
    tests/ (pytest)
  requirements.txt
  Dockerfile

/frontend
  src/
    api.ts       # Camada de acesso à API
    App.tsx      # Componente principal
  Dockerfile
  nginx.conf
  .env.production (VITE_API_BASE=/api)

docker-compose.yml
```

### Decisões:
- **ViewSet + Router**: reduz verbosidade para CRUD (KISS).
- **Ownership**: Cada `Task` tem campo `owner` (ForeignKey -> User) e queryset filtrado por usuário autenticado (segurança por isolamento).
- **Permissões globais**: `IsAuthenticated` (API toda exige login; endpoints públicos específicos sobrescrevem).
- **Filtro simples**: `?is_completed=` usando `django-filter`.
- **Paginação nativa**: `PageNumberPagination` com `PAGE_SIZE=10`.
- **Front minimalista**: Sem Redux/Context — estado simples local para escopo do teste.
- **Docker**: Dois containers (separação de responsabilidades): backend (Gunicorn) / frontend (Nginx + build estático).
- **Testes**: Garantem endpoints principais; evitado over-testing para manter foco.

---

## 🗄 Modelo Principal

```python
class Task(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🔐 Autenticação

- **Registro**: `POST /api/register/` → cria usuário + retorna `access` e `refresh`.
- **Login**: `POST /api/token/` (JWT SimpleJWT) – form data (`username`, `password`).
- **Refresh**: `POST /api/token/refresh/` (não automatizado no front, pode ser adicionado).
- **Uso no front**: `Authorization: Bearer <access>`.

---

## 🌐 Endpoints Principais

| Método | URL | Descrição | Autenticação |
|--------|-----|-----------|--------------|
| POST | `/api/register/` | Criar usuário e obter tokens | ❌ |
| POST | `/api/token/` | Obter par de tokens JWT | ❌ |
| POST | `/api/token/refresh/` | Renovar access token | ❌ |
| GET | `/api/tasks/` | Listar tarefas (paginado, filtrável) | ✅ |
| POST | `/api/tasks/` | Criar tarefa | ✅ |
| GET | `/api/tasks/{id}/` | Detalhar tarefa | ✅ |
| PATCH | `/api/tasks/{id}/` | Atualizar parcial (inclui toggle) | ✅ |
| PUT | `/api/tasks/{id}/` | Atualização total | ✅ |
| DELETE | `/api/tasks/{id}/` | Remover | ✅ |

### Filtros / Query Params
| Param | Tipo | Exemplo | Efeito |
|-------|------|---------|--------|
| `is_completed` | bool | `?is_completed=true` | Filtra concluídas |
| `page` | int | `?page=2` | Paginação página 2 |

---

## 🧪 Testes

Executar (no diretório `backend/` com venv ativo):

```bash
pytest
```

Cobrem:
- Registro retorna token.
- Login.
- Criação de tarefas autenticado.
- Paginação (count / page size).
- Filtro de concluídas.
- Toggle (PATCH).
- Delete (restrito ao dono).

---

## ▶ Execução (Ambiente Local Sem Docker)

### 1. Clonar e entrar
```bash
git clone <repo_url>
cd todo_lits
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # opcional
python manage.py runserver
```
API: `http://127.0.0.1:8000/api/`

### 3. Frontend
Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Front: `http://localhost:5173`

> Ajustar `VITE_API_BASE` em `.env` se backend em outra porta domínio.

---

## 🐳 Execução com Docker (Produção Simples)

### Pré‑requisito
Docker + Docker Compose.

### Subir
```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- (Se porta 8000 exposta) Backend: http://localhost:8000/api/

> Registro / Login executados via tela inicial do front.

### Parar
```bash
docker compose down
```

---

## 🔧 Variáveis de Ambiente Importantes

| Serviço | Variável | Propósito | Default |
|---------|----------|-----------|---------|
| Frontend | `VITE_API_BASE` | Base das chamadas AJAX | `/api` (via `.env.production`) |
| Backend | `DJANGO_SETTINGS_MODULE` | Módulo de settings | `core.settings` |
| Backend | (futuro) `SECRET_KEY` | Para produção deve ser externo | Hardcoded dev |

---

## 🧱 Decisões de Design (Resumo)

| Tema | Decisão | Racional |
|------|---------|----------|
| Framework | Django + DRF | Rapidez de CRUD + auth robusta |
| Auth | JWT (SimpleJWT) | Simples, testado e padrão de mercado |
| Modelagem | 1 tabela principal (Task) | Escopo mínimo do teste |
| Filtros | `django-filter` | Evita reescrever lógica manual |
| Front | Estado local + hooks | Escopo pequeno não exige global store |
| Estilo | Inline styles + classes leves | Velocidade no protótipo |
| Deploy contêiner | Dois containers | Separação de responsabilidades |
| Testes | Pytest + APIClient | Foco em endpoints críticos |

---

## 🧩 SOLID / DRY / KISS – Exemplos

| Princípio | Aplicação |
|-----------|-----------|
| SRP | `views_auth.py` separado da lógica de `TaskViewSet`. |
| DRY | Função utilitária de request no front (`apiRequest`). |
| KISS | Sem camadas extras (ex.: services complexos) para o escopo. |
| OCP | Serializer e ViewSet permitem futuras adições (ex.: categorias) sem reescrever. |
| LSP | Uso das classes DRF padrão sem quebrar contratos. |
| ISP | Não criadas interfaces artificiais desnecessárias. |
| DIP (limitado) | Dependências centrais (DRF, SimpleJWT) gerenciadas por configuração. |

---
## 🐞 Troubleshooting

| Problema | Causa comum | Solução |
|----------|-------------|---------|
| `Failed to fetch` no front em Docker | Front chamando `127.0.0.1:8000` dentro do container | Usar `VITE_API_BASE=/api` e rebuild |
| 403 no `/api/` root | Permissão global `IsAuthenticated` | Acessar `/api/token/` ou trocar para `IsAuthenticatedOrReadOnly` |
| 401 em `/api/tasks/` | Falta de header Authorization | Enviar `Bearer <access>` |
| `no such table` | Migrações não aplicadas | `python manage.py migrate` |
| Testes reclamam de DB | Esqueceu marcação pytest-django | Usar fixtures / `pytest` já configurado |

---


## 📄 Licença

Uso livre para avaliação do teste técnico.

---

**Obrigado pela avaliação, people!**  


