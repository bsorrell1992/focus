import api from './api';
import {types as calendarActionTypes} from "./calendar_api"
export const computeSchedule = ()=> {

    return async (dispatch, getState) => {
        let events = getState().calendarAPI.events;
        let todos = getState().todoAPI.todos;
        const newSchedule = await api.get('/api/schedule/compute-schedule/', {
            params: {
                events: events,
                todos: todos
            }
        });
        console.log("new schedule from computeSchedule", newSchedule.data.result);
        dispatch({ type: calendarActionTypes.UPDATE_SCHEDULE, data: newSchedule.data.result});
    }
}

