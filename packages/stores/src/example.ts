import { createStoreActionTypes } from './store-action-types';
import { createStore } from './store';
import { producer } from './producer';
import { createActionSources } from '@state-utils/actions';

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
