import { createStoreActionTypes } from './store-action-types';
import { createStore } from './store';
import { producer } from './producer';
import { createActionSources } from '@state-utils/actions';
import {
  createStoreSelector,
  createStoreStateSelector,
  IntersectStoreSelectorStates,
  StoreSelectorContext,
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
    removeTodo: producer((state, payload) => {}),
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

const selectCount = createStoreStateSelector(countStore);

const exampleSelector = createStoreSelector(
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

type X = StoreSelectorContext<[typeof selectTodos, typeof selectCount]>;
const x: X = undefined as any;
x.runStateSelector(selectCount, []);
