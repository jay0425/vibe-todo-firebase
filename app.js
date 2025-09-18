import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  update,
  onValue,
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBpHsDFu0smL10teiPwfGylCTMQ46T4qpY',
  authDomain: 'todo-backend-26aed.firebaseapp.com',
  projectId: 'todo-backend-26aed',
  storageBucket: 'todo-backend-26aed.firebasestorage.app',
  messagingSenderId: '399523240057',
  appId: '1:399523240057:web:ec7ca67e7fd92d263d1ca8',
  measurementId: 'G-Z42CECZWXD',
  databaseURL: 'https://todo-backend-26aed-default-rtdb.firebaseio.com/',
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

(() => {
  /** @type {HTMLFormElement} */
  const form = document.getElementById('todo-form');
  /** @type {HTMLInputElement} */
  const input = document.getElementById('todo-input');
  /** @type {HTMLUListElement} */
  const list = document.getElementById('todo-list');

  /** @typedef {{ id:string, text:string, completed:boolean, createdAt:number, updatedAt:number }} Todo */
  /** @type {Record<string, Todo>} */
  let todos = {};

  function render() {
    list.innerHTML = '';
    for (const [id, todo] of Object.entries(todos)) {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-item__checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(id, checkbox.checked));

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-item__text' + (todo.completed ? ' completed' : '');
      textSpan.textContent = todo.text;
      textSpan.addEventListener('dblclick', () => beginEdit(li, id, todo));

      const actions = document.createElement('div');
      actions.className = 'todo-item__actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn';
      editBtn.textContent = '수정';
      editBtn.addEventListener('click', () => beginEdit(li, id, todo));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn--danger';
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => deleteTodo(id));

      actions.append(editBtn, delBtn);
      li.append(checkbox, textSpan, actions);
      list.appendChild(li);
    }
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    const todo = {
      text: trimmed,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    const todoRef = push(ref(db, 'todos'));
    set(todoRef, todo);
  }

  function deleteTodo(id) {
    remove(ref(db, 'todos/' + id));
  }

  function toggleTodo(id, completed) {
    update(ref(db, 'todos/' + id), {
      completed,
      updatedAt: Date.now(),
    });
  }

  function beginEdit(li, id, todo) {
    const current = li.querySelector('.todo-item__text');
    if (!current) return;
    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.className = 'todo-edit';
    inputEdit.value = todo.text;
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
        deleteTodo(id);
        return;
      }
      update(ref(db, 'todos/' + id), {
        text: next,
        updatedAt: Date.now(),
      });
    };

    inputEdit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    inputEdit.addEventListener('blur', () => finish(true));
  }

  // Firebase Realtime Database에서 값 읽기
  onValue(ref(db, 'todos'), (snapshot) => {
    todos = snapshot.val() || {};
    render();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
  });
})();
