(() => {
  const API_URL = 'http://localhost:5001/todos'; // ✅ 백엔드 주소

  /** @type {HTMLFormElement} */
  const form = document.getElementById('todo-form');
  /** @type {HTMLInputElement} */
  const input = document.getElementById('todo-input');
  /** @type {HTMLUListElement} */
  const list = document.getElementById('todo-list');

  /** @typedef {{ _id:string, title:string, description?:string, isCompleted:boolean, createdAt:string }} Todo */
  /** @type {Todo[]} */
  let todos = [];

  // ✅ 할 일 불러오기 (Read)
  async function loadTodos() {
    try {
      const res = await fetch(API_URL);
      todos = await res.json();
      render();
    } catch (e) {
      console.error('할 일 불러오기 실패 ❌', e);
    }
  }

  // ✅ 할 일 추가 (Create)
  async function addTodo(text) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text }),
      });
      const newTodo = await res.json();
      todos.unshift(newTodo);
      render();
    } catch (e) {
      console.error('할 일 추가 실패 ❌', e);
    }
  }

  // ✅ 할 일 완료 토글 (Update)
  async function toggleTodo(id, completed) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: completed }),
      });
      const updated = await res.json();
      todos = todos.map((t) => (t._id === id ? updated : t));
      render();
    } catch (e) {
      console.error('할 일 수정 실패 ❌', e);
    }
  }

  // ✅ 할 일 삭제 (Delete)
  async function deleteTodo(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      todos = todos.filter((t) => t._id !== id);
      render();
    } catch (e) {
      console.error('할 일 삭제 실패 ❌', e);
    }
  }

  // ✅ 할 일 수정 (제목 변경)
  async function updateTodoText(id, text) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text }),
      });
      const updated = await res.json();
      todos = todos.map((t) => (t._id === id ? updated : t));
      render();
    } catch (e) {
      console.error('할 일 수정 실패 ❌', e);
    }
  }

  // ✅ 렌더링
  function render() {
    list.innerHTML = '';
    for (const todo of todos) {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = todo._id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-item__checkbox';
      checkbox.checked = todo.isCompleted;
      checkbox.addEventListener('change', () => toggleTodo(todo._id, checkbox.checked));

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-item__text' + (todo.isCompleted ? ' completed' : '');
      textSpan.textContent = todo.title;

      textSpan.addEventListener('dblclick', () => beginEdit(li, todo));

      const actions = document.createElement('div');
      actions.className = 'todo-item__actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn';
      editBtn.textContent = '수정';
      editBtn.addEventListener('click', () => beginEdit(li, todo));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn--danger';
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => deleteTodo(todo._id));

      actions.append(editBtn, delBtn);
      li.append(checkbox, textSpan, actions);
      list.appendChild(li);
    }
  }

  // ✅ 수정 모드
  function beginEdit(li, todo) {
    const current = li.querySelector('.todo-item__text');
    if (!current) return;
    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.className = 'todo-edit';
    inputEdit.value = todo.title;
    li.replaceChild(inputEdit, current);
    inputEdit.focus();
    inputEdit.selectionStart = inputEdit.value.length;

    const finish = (commit) => {
      if (!commit) {
        render();
        return;
      }
      const next = inputEdit.value.trim();
      if (!next) {
        deleteTodo(todo._id);
        return;
      }
      updateTodoText(todo._id, next);
    };

    inputEdit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    inputEdit.addEventListener('blur', () => finish(true));
  }

  // ✅ 폼 이벤트
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text);
    input.value = '';
  });

  // 초기화
  loadTodos();
})();
