import api from './api';

// Action types
const types = {

  LOGIN:"LOGIN",
  LOGOUT: "LOGOUT"

};


// Action creators
export const loginCreators = {
  login: () => {
    return async (dispatch) => {
      try {
        const res = await api.get('/api/login/login/');
        dispatch({ type: types.LOGIN, data: res.data.result });
      } catch (error) {

      }
    };
  },
  logout: () => {
    return async (dispatch) => {
      try {
        const res = await api.get('/api/login/logout/');
        dispatch({ type: types.LOGOUT, data: res.data.result });
      } catch (error) {

      }
    };
  }

};

export const loginReducer = (state={loggedIn: false}, action) => {
  if (action.type === types.LOGIN) {
    console.log("loging in", action.data)

    return {
        ...state,
        loggedIn:true
    }
  }else if (action.type === types.LOGOUT){
    console.log("loging out", action.data)
     return {
        ...state,
        loggedIn:false
    }
  }
  return state;
};
