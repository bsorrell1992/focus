import api from './api';
import {computeSchedule} from "./schedule_api"

// Action types
const types = {
  FETCH_REQUESTED: 'todo_api/FETCH_REQUESTED',
  FETCH_SUCCESS: 'todo_api/FETCH_SUCCESS',
  FETCH_ERROR: 'todo_api/FETCH_ERROR',
  ADD_TODO: 'ADD_TODO',
  REMOVE_TODO: "REMOVE_TODO",
  ERROR:"ERROR",

};


// Action creators
export const todoCreators = {
  fetchTodos: () => {
    return async (dispatch) => {
      dispatch({ type: types.FETCH_REQUESTED });
      try {
        const res = await api.get('/api/todo/get-todos/');
        dispatch({ type: types.FETCH_SUCCESS, data: res.data.result });
      } catch (error) {
        dispatch({ type: types.FETCH_ERROR, error });
      }
    };
  },
  addTodo: (todo) => {
    return (dispatch) => {
    try {
        dispatch({ type: types.ADD_TODO, data: todo });
        dispatch(computeSchedule());
      } catch (error) {
        dispatch({ type: types.ERROR, error });
      }
    }
  },
  deleteTodo: (todoID) => {
    return (dispatch) => {
        try {
            dispatch({ type: types.REMOVE_TODO, data: todoID });
            dispatch(computeSchedule());
          } catch (error) {
            dispatch({ type: types.EERROR, error });
          }
        }
  }

};

const initialTodos = [
{
  id: '1',
  title: 'Study for midterm',
  duration: 2*60,
  due: new Date("2023-05-23 15:00:00"),
},
{
    id: '2',
    title: 'Read paper',
    duration: 3*60,
    due: new Date("2023-05-24 19:00:00"),
},
{
    id: '3',
    title: 'Exercise',
    duration: 20,
    due: new Date("2023-05-23 19:00:00"),
},
{
    id: '4',
    title: 'Watch movie',
    duration: 2*60,
    due: "null",
}]


export const todoReducer = (state = {"todos":initialTodos}, action) => {
  if (action.type === types.FETCH_SUCCESS) {

    if(!action.data){
      return state;
    }

    return {...state, "todos":[...state.todos]};
  }else if (action.type === types.ADD_TODO){
    console.log("adding todo", action.data)

    return {...state, "todos":[...state.todos, {id:Date.now(),...action.data, due:"null"}]};
  }
  
  else if (action.type === types.REMOVE_TODO){
    console.log("deleting todo", action.data)
    return {...state, "todos":state.todos.filter(todo => todo.id != action.data)};
  }
  return state;
};
