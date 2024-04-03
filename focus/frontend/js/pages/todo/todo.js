import { todoCreators } from '../../store/todo_api';
import Button from 'react-bootstrap/Button';
import React, { useState, useEffect, createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const TodoView = () => {
  const dispatch = useDispatch();
  const todoAPI = useSelector((state) => state.todoAPI);
  const [newTodoValue, updateNewTodoValue] = useState('');

  const handleAddTodo = () => {
    if (newTodoValue == '') return;
    const action = todoCreators.addTodo({ title: newTodoValue });
    updateNewTodoValue('');
    dispatch(action);
  };

  const handleDeleteTodo = (todoID) => {
    const action = todoCreators.deleteTodo(todoID);
    dispatch(action);
  };

  return (
    <div>
      {/* <h1> Todos:</h1> */}
      {todoAPI.todos.map((item, index) => (
        <div key={item.id}>
          {/* <Button onClick = {()=>handleDeleteTodo(item.id)} > Add todo to schedule </Button> */}
          <li > {item.title} </li>
          <Button onClick={() => handleDeleteTodo(item.id)}> Delete </Button>
        </div>
      ))}
      <input value={newTodoValue} onChange={(e) => updateNewTodoValue(e.target.value)}></input>
      <Button onClick={handleAddTodo}> Add TODO </Button>
    </div>
  );
};

export default TodoView;
