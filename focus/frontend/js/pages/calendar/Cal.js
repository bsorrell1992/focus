import React, { useState, useEffect, useCallback, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from '@toast-ui/react-calendar';
import { calendarCreators } from '../../store/calendar_api';
import { theme, initialCalendars , viewModeOptions} from './theme';

import '@toast-ui/calendar/dist/toastui-calendar.min.css'
import './cal.css';


function CalendarView({ view }) {

  const dispatch = useDispatch();
  const calendarAPI = useSelector((state) => state.calendarAPI);

  //Fetch User's Google Calendar Events
  useEffect(() => {
    const action = calendarCreators.fetchCalendarEvents();
    dispatch(action);
  }, [dispatch]);


  const calendarRef = useRef(null);
  const [selectedDateRangeText, setSelectedDateRangeText] = useState('');
  const [selectedView, setSelectedView] = useState(view);

  let initialEvents  = calendarAPI.events;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


  const getCalInstance = useCallback(() => calendarRef.current?.getInstance?.(), []);

  // useEffect(()=>{
  //   getCalInstance().createEvents(calendarAPI.events);
  //   console.log("creating events", calendarAPI.events);
  // }, [calendarAPI.events])

  const updateRenderRangeText = useCallback(() => {
    const calInstance = getCalInstance();
    if (!calInstance) {
      setSelectedDateRangeText('');
    }

    const viewName = calInstance.getViewName();
    const calDate = calInstance.getDate();
    const rangeStart = calInstance.getDateRangeStart();
    const rangeEnd = calInstance.getDateRangeEnd();

    let year = calDate.getFullYear();
    let month = calDate.getMonth() + 1;
    let date = calDate.getDate();
    let dateRangeText;

    switch (viewName) {
      case 'month': {
        dateRangeText = `${year}-${month}`;
        break;
      }
      case 'week': {
        year = rangeStart.getFullYear();
        month = rangeStart.getMonth() + 1;
        date = rangeStart.getDate();
        const endMonth = rangeEnd.getMonth() + 1;
        const endDate = rangeEnd.getDate();

        const start = `${year}-${month < 10 ? '0' : ''}${month}-${date < 10 ? '0' : ''}${date}`;
        const end = `${year}-${endMonth < 10 ? '0' : ''}${endMonth}-${
          endDate < 10 ? '0' : ''
        }${endDate}`;
        dateRangeText = `${start} ~ ${end}`;
        break;
      }
      default:
        dateRangeText = `${year}-${month}-${date}`;
    }

    setSelectedDateRangeText(dateRangeText);
  }, [getCalInstance]);

  useEffect(() => {
    setSelectedView(view);
  }, [view]);

  useEffect(() => {
    updateRenderRangeText();
  }, [selectedView, updateRenderRangeText]);

  const onAfterRenderEvent  = (res) => {
    console.group('onAfterRenderEvent');
    console.log('Event Info : ', res.title);
    console.groupEnd();
  };

  const onBeforeDeleteEvent = (res) => {
    console.group('onBeforeDeleteEvent');
    console.log('Event Info : ', res.title);
    console.groupEnd();

    const { id, calendarId } = res;

    getCalInstance().deleteEvent(id, calendarId);
  };

  const onChangeSelect = (ev) => {
    setSelectedView(ev.target.value);
  };

  const onClickDayName= (res) => {
    console.group('onClickDayName');
    console.log('Date : ', res.date);
    console.groupEnd();
  };

  const onClickNavi = (ev) => {
    if (ev.target.tagName === 'BUTTON') {
      const button = ev.target;
      const actionName = (button.getAttribute('data-action') ?? 'month').replace('move-', '');
      getCalInstance()[actionName]();
      updateRenderRangeText();
    }
  };

  const onClickEvent  = (res) => {
    console.group('onClickEvent');
    console.log('MouseEvent : ', res.nativeEvent);
    console.log('Event Info : ', res.event);
    console.groupEnd();
  };

  const onClickTimezonesCollapseBtn = (
    timezoneCollapsed
  ) => {
    console.group('onClickTimezonesCollapseBtn');
    console.log('Is Timezone Collapsed?: ', timezoneCollapsed);
    console.groupEnd();

    const newTheme = {
      'week.daygridLeft.width': '100px',
      'week.timegridLeft.width': '100px',
    };

    getCalInstance().setTheme(newTheme);
  };

  const onBeforeUpdateEvent  = (updateData) => {
    console.group('onBeforeUpdateEvent');
    console.log(updateData);
    console.groupEnd();

    const targetEvent = updateData.event;
    const changes = { ...updateData.changes };

    getCalInstance().updateEvent(targetEvent.id, targetEvent.calendarId, changes);

    const action = calendarCreators.updateCalendarEvent({id: targetEvent.id, changes: changes});
    dispatch(action);


  };

  const onBeforeCreateEvent  = (eventData) => {
    const event = {
      calendarId: eventData.calendarId || '',
      id: String(Math.random()),
      title: eventData.title,
      isAllday: eventData.isAllday,
      start: eventData.start,
      end: eventData.end,
      category: eventData.isAllday ? 'allday' : 'time',
      dueDateClass: '',
      location: eventData.location,
      state: eventData.state,
      isPrivate: eventData.isPrivate,
    };

    getCalInstance().createEvents([event]);
    const action = calendarCreators.addCalendarEvent(event);
    dispatch(action);
  };

  return (
    <div>
      <div>
        <span>
          <button
            type="button"
            className="btn btn-default btn-sm move-today"
            data-action="move-today"
            onClick={onClickNavi}
          >
            Today
          </button>
          <button
            type="button"
            className="btn btn-default btn-sm move-day"
            data-action="move-prev"
            onClick={onClickNavi}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn btn-default btn-sm move-day"
            data-action="move-next"
            onClick={onClickNavi}
          >
            Next
          </button>
        </span>
        <span className="render-range">{selectedDateRangeText}</span>
      </div>
      <Calendar
        height="900px"
        calendars={initialCalendars}
        events={initialEvents}
        template={{
          milestone(event) {
            return `<span style="color: #fff; background-color: ${event.backgroundColor};">${event.title}</span>`;
          },
          allday(event) {
            return `[All day] ${event.title}`;
          },
        }}
        theme={theme}
        timezone={{
          zones: [
            {
              timezoneName: timeZone,
            }
          ],
        }}
        useDetailPopup={false}
        useFormPopup={false}
        view={selectedView}
        week={{
          showTimezoneCollapseButton: false,
          timezonesCollapsed: true,
          eventView: true,
          taskView: false,
          milestoneView: false

        }}
        day={{
          showTimezoneCollapseButton: false,
          timezonesCollapsed: true,
          eventView: true,
          taskView: false,
          milestoneView: false

        }}
        month={{
          showTimezoneCollapseButton: false,
          timezonesCollapsed: true,
          eventView: true,
          taskView: false,
          milestoneView: false,
          startDayOfWeek: 1,
        }}
        ref={calendarRef}
        onAfterRenderEvent={onAfterRenderEvent}
        onBeforeDeleteEvent={onBeforeDeleteEvent}
        onClickDayname={onClickDayName}
        onClickEvent={onClickEvent}
        onClickTimezonesCollapseBtn={onClickTimezonesCollapseBtn}
        onBeforeUpdateEvent={onBeforeUpdateEvent}
        onBeforeCreateEvent={onBeforeCreateEvent}
      />
    </div>
  );
}

export default CalendarView;