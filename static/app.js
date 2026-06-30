const API = "/todos";
let todos = [];
let currentFilter = "all";
let editingId = null;

// Elements
const addForm = document.getElementById("add-form");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const modal = document.getElementById("modal");
const editTitle = document.getElementById("edit-title");
const editDesc = document.getElementById("edit-desc");

// Fetch all todos
async function fetchTodos() {
  const res = await fetch(API);
  todos = await res.json();
  render();
}

// Create
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { title: titleInput.value.trim(), description: descInput.value.trim() || null };
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  titleInput.value = "";
  descInput.value = "";
  fetchTodos();
});

// Toggle complete
async function toggleTodo(id, completed) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  fetchTodos();
}

// Delete
async function deleteTodo(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  fetchTodos();
}

// Open edit modal
function openEdit(todo) {
  editingId = todo.id;
  editTitle.value = todo.title;
  editDesc.value = todo.description || "";
  modal.classList.remove("hidden");
}

// Save edit
document.getElementById("save-edit").addEventListener("click", async () => {
  if (!editingId) return;
  await fetch(`${API}/${editingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: editTitle.value.trim(), description: editDesc.value.trim() || null }),
  });
  modal.classList.add("hidden");
  editingId = null;
  fetchTodos();
});

document.getElementById("cancel-edit").addEventListener("click", () => {
  modal.classList.add("hidden");
  editingId = null;
});

// Filters
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Render
function render() {
  const filtered = todos.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  emptyState.style.display = filtered.length === 0 ? "block" : "none";
  todoList.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " done" : ""}`;
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} />
      <div class="todo-text">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ""}
      </div>
      <div class="todo-actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
      </div>
    `;
    li.querySelector("input[type='checkbox']").addEventListener("change", (e) =>
      toggleTodo(todo.id, e.target.checked)
    );
    li.querySelector(".btn-edit").addEventListener("click", () => openEdit(todo));
    li.querySelector(".btn-delete").addEventListener("click", () => deleteTodo(todo.id));
    todoList.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

fetchTodos();
