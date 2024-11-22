// App.js
import React from 'react';
import RawThree from './compoments/RawThree'
import WebSocketComponent from './compoments/websock';
// import Earth from './Earth'

function App() {
  return (
    <div>
      {/* <Earth />  */}
      <RawThree /> 
      <WebSocketComponent></WebSocketComponent>
    </div>
  );
}

export default App;
