import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';

import CalendarView from './calendar/Cal';
import TodoView from './todo/todo';
import LoginView from './login/login'

const Home = () => {

  return (
    <>
      <div >
      <LoginView />
      <Row>
      <Col xs={12} sm={3} md={2} lg={2} >
      <TodoView />
      </Col>
      <Col xs={12} sm={9} md={10} lg={10} >
      <CalendarView view = "week"/>
      </Col>
      </Row>

      </div>
    </>
  );
};

export default Home;
