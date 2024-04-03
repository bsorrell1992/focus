import api from './api';
import { TZDate } from '@toast-ui/calendar';
import { addDate, addMinutes, addHours, subtractDate } from '../pages/calendar/utils';
const today = new TZDate();
// Action types
export const types = {
  FETCH_REQUESTED: 'calendar_api/FETCH_REQUESTED',
  FETCH_SUCCESS: 'calendar_api/FETCH_SUCCESS',
  FETCH_ERROR: 'calendar_api/FETCH_ERROR',
  UPDATE_SCHEDULE: 'UPDATE_SCHEDULE',
  UPDATE_EVENT: 'UPDATE_EVENT',
  ADD_NEW_EVENT: 'ADD_NEW_EVENT',
};

function changeTimezone(date) {
  const ianatz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // suppose the date is 12:00 UTC
  var invdate = new Date(
    date.toLocaleString('en-US', {
      timeZone: ianatz,
    })
  );

  // then invdate will be 07:00 in Toronto
  // and the diff is 5 hours
  var diff = date.getTime() - invdate.getTime();

  // so 12:00 in Toronto is 17:00 UTC
  return new Date(date.getTime() - diff); // needs to substract
}

// Action creators
export const calendarCreators = {
  fetchCalendarEvents: () => {
    return async (dispatch) => {
      dispatch({ type: types.FETCH_REQUESTED });
      try {
        const res = await api.get('/api/calendar/get-events/');
        dispatch({ type: types.FETCH_SUCCESS, data: res.data.result });
      } catch (error) {
        dispatch({ type: types.FETCH_ERROR, error });
      }
    };
  },
  updateCalendarEvent: (data) => {
    return (dispatch) => {
      dispatch({ type: types.UPDATE_EVENT, data: data });
    };
  },
  addCalendarEvent: (data) => {
    return (dispatch) => {
      dispatch({ type: types.ADD_NEW_EVENT, data: data });
    };
  },
};

const initialEvents = [
  {
    id: '1',
    calendarId: '0',
    title: 'TOAST UI Calendar Study',
    category: 'time',
    start: today,
    end: addHours(today, 3),
    type: 'todo',
  },
  {
    id: '2',
    calendarId: '0',
    title: 'Practice',
    category: 'milestone',
    start: addDate(today, 1),
    end: addDate(today, 1),
    type: 'todo',
    isReadOnly: true,
  },
  {
    id: '3',
    calendarId: '0',
    title: 'FE Workshop',
    category: 'allday',
    start: subtractDate(today, 2),
    end: subtractDate(today, 1),
    type: 'todo',
    isReadOnly: true,
  },
  {
    id: '4',
    calendarId: '0',
    title: 'Report',
    category: 'time',
    start: today,
    end: addHours(today, 1),
    type: 'todo',
  },
];

export const calendarReducer = (state = { events: initialEvents, timezonedelta: null }, action) => {
  console.log('calendarReducer', action.type, 'action.data', action.data);

  switch (action.type) {
    case types.FETCH_SUCCESS:
      if (!action.data) {
        return state;
      }

      let timezonedelta = null;

      let events = new Array();

      for (let i = 0; i < action.data.length; i++) {
        try {
          if (!action.data[i]['start']['dateTime']) {
            continue;
          }
          let start_time = new Date(action.data[i]['start']['dateTime']);
          let start = new TZDate();
          start.setTime(start_time.valueOf());

          let end_time = new Date(action.data[i]['end']['dateTime']);
          let end_tz = new TZDate();
          end_tz.setTime(end_time.valueOf());

          events.push({
            id: action.data[i]['id'],
            calendarId: '0',
            title: action.data[i]['summary'],
            category: 'time',
            start: start,
            end: end_tz,
            isReadOnly: false,
            type: 'scheduled',
          });

          timezonedelta = action.data[i].start.dateTime.substring(
            action.data[i].start.dateTime.length - 6
          );
        } catch (error) {
          console.log('error is', error);
        }
      }
      events = events.filter((event) => event.start.d.d != {});
      console.log('events', events);

      return { ...state, events: events, timezonedelta: timezonedelta };

    case types.UPDATE_SCHEDULE:
      let newevents = [
        ...state.events.filter((event) => event.type == 'scheduled'),
        ...action.data.map((event) => {
          let start_time = changeTimezone(
            new Date(
              event['starttime'].substring(0, event['starttime'].length - 5) + state.timezonedelta
            )
          );
          var start = new TZDate();
          start.setTime(start_time.valueOf());

          let end_time = new Date(
            event['endtime'].substring(0, event['endtime'].length - 5) + state.timezonedelta
          );
          let end_tz = new TZDate();
          end_tz.setTime(end_time.valueOf());

          return {
            ...event,
            calendarId: '1',
            category: 'time',
            start: start,
            end: end_tz,
            type: 'todo',
          };
        }),
      ];

      console.log('newevents', newevents);

      return { ...state, events: newevents };

    case types.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map((event) =>
          event.id == action.data.id ? { ...event, ...action.data.changes } : event
        ),
      };
    case types.ADD_NEW_EVENT:
      const newEvent = { ...action.data, type: 'scheduled' };
      return { ...state, events: [...state.events, newEvent] };

    default:
      return state;
  }
};
