import { createStoreActionTypes } from './store-action-types';
import { createStore } from './store';
import { producer } from './producer';
import { createActionSources } from '@state-utils/actions';
import {
  createStoreSelector,
  createStoreStateSelector,
} from './store-selector';

const actionSources = createActionSources();

export interface TodosState {
  todos: string[];
}

const todosStoreActions = createStoreActionTypes<
  TodosState,
  {
    addTodo: { todo: string };
    removeTodo: { todo: string };
  }
>({ namespace: 'todos' });

const todosStore = createStore(actionSources, {
  state: { todos: [] },
  actions: todosStoreActions,
  transitions: {
    addTodo: producer((state, payload) => {
      state.todos.push(payload.todo);
    }),
    removeTodo: producer((state, payload) => {
      state.todos.filter((todo) => todo !== payload.todo);
    }),
  },
});

const selectTodos = createStoreStateSelector(todosStore);

export interface CountState {
  count: number;
}

const countStoreActions = createStoreActionTypes<
  CountState,
  {
    inc: void;
    dec: void;
  }
>({ namespace: 'other' });

const countStore = createStore(actionSources, {
  state: { count: 0 },
  actions: countStoreActions,
  transitions: {
    inc: producer((state) => {
      state.count++;
    }),
    dec: producer((state) => {
      state.count--;
    }),
  },
});

export interface TimeState {
  time: number;
}

const timeStoreActions = createStoreActionTypes<
  TimeState,
  {
    set: { time: number };
  }
>({ namespace: 'time' });

const timeStore = createStore(actionSources, {
  state: { time: 0 },
  actions: timeStoreActions,
  transitions: {
    set: producer((state, payload) => {
      state.time = payload.time;
    }),
  },
});

const selectTime = createStoreStateSelector(timeStore);

const selectCount = createStoreStateSelector(countStore);

const selectTodosAndCount = createStoreSelector(
  [selectTodos, selectCount],
  (ctx) => {
    const todos = selectTodos(ctx);
    const count = selectCount(ctx);
    return {
      todos,
      count,
    };
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectSuccess = createStoreSelector(
  [selectTodosAndCount, selectTime],
  (ctx) => {
    const todos = selectTodos(ctx);
    const count = selectCount(ctx);
    const success = selectTodosAndCount(ctx);
    const time = selectTime(ctx);
    return {
      todos,
      count,
      success,
      time,
    };
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectFailure = createStoreSelector([selectTodos], (ctx) => {
  const todos = selectTodos(ctx);
  // @ts-expect-error expect ctx not being assignable
  const count = selectCount(ctx);
  return {
    todos,
    count,
  };
});
