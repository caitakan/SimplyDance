import React from 'react';
import style from './style.css';
import { RouteComponentProps } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import { useTodoActions } from 'app/actions';
// import { RootState } from 'app/reducers';
// import { TodoModel } from 'app/models';
// import * as posenet from '@tensorflow-models/posenet';

// const FILTER_VALUES = (Object.keys(TodoModel.Filter) as (keyof typeof TodoModel.Filter)[]).map(
//   (key) => TodoModel.Filter[key]
// );

// const FILTER_FUNCTIONS: Record<TodoModel.Filter, (todo: TodoModel) => boolean> = {
//   [TodoModel.Filter.SHOW_ALL]: () => true,
//   [TodoModel.Filter.SHOW_ACTIVE]: (todo) => !todo.completed,
//   [TodoModel.Filter.SHOW_COMPLETED]: (todo) => todo.completed
// };

export namespace App {
  export interface Props extends RouteComponentProps<{ [key: string]: string }> {}
}

export const App = ({ history, match }: App.Props) => {
  // const dispatch = useDispatch();
  // const todoActions = useTodoActions(dispatch);
  // const { todos, filter } = useSelector((state: RootState) => {
  //   const filter = match.params && Object.keys(match.params).length !== 0 ? match.params['filter'] : undefined;
  //   return {
  //     todos: state.todos,
  //     filter: FILTER_VALUES.find((value) => value === filter) ?? TodoModel.Filter.SHOW_ALL
  //   };
  // });
  // const test = posenet.load();

  // const handleClearCompleted = React.useCallback((): void => {
  //   test ? todoActions.clearCompleted() : todoActions.clearCompleted();
  // }, [todoActions]);

  // const handleFilterChange = React.useCallback(
  //   (filter: TodoModel.Filter): void => {
  //     history.push(`${filter}`);
  //   },
  //   [history]
  // );

  // const filteredTodos = React.useMemo(() => (filter ? todos.filter(FILTER_FUNCTIONS[filter]) : todos), [todos, filter]);
  // const activeCount = React.useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);
  // const completedCount = React.useMemo(() => todos.filter((todo) => todo.completed).length, [todos]);

  return <div className={style.normal}></div>;
};
