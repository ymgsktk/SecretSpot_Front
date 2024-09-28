import React from 'react';
import './title.css';

const Title　= () => {
  return (
    <div className="container">
      <div className="left-panel">
        <input type="text" placeholder="Input 1" />
        <input type="text" placeholder="Input 2" />
        <input type="text" placeholder="Input 3" />
        <input type="text" placeholder="Input 4" />
      </div>
      <div className="right-panel">
        <h1 className="title">Title</h1>
      </div>
    </div>
  );
};

export default Title;
