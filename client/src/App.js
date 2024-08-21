import './App.css';
import React,{useEffect} from 'react';

function App() {
  useEffect(() => {
    document.title = "React Uploader"; // Set the title here
  }, []);
  return (
    <div className="App">
      <input type='file' />
    </div>
  );
}

export default App;
