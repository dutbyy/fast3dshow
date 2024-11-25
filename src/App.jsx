// App.js
import React from 'react';
import RawThree from './compoments/RawThree'
import WebSocketComponent from './compoments/websock';
// import Earth from './Earth'

function App() {
  return (
    <div>
      <RawThree /> 
      <WebSocketComponent></WebSocketComponent>
    </div>
  );
}

export default App;
