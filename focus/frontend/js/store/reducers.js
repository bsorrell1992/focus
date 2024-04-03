import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import { calendarReducer as calendarAPI } from './calendar_api';
import { todoReducer as todoAPI } from './todo_api';
import { loginReducer as loginAPI } from './login_api';



export const createRootReducer = (history) => {
  return combineReducers({
    router: connectRouter(history),
    calendarAPI,
    todoAPI,
    loginAPI

  });
};
