import React, { useState } from 'react';
import './title.css';

const Title = ({ onSearch }) => {
  const [inputs, setInputs] = useState({
    input1: '',
    input2: '',
    input3: '',
    input4: ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  };
//handleSearchClick関数はfetchInfoを呼び出してバックエンドからの情報をもらう。
  const handleSearchClick =  () => {
  };

  return (
    <div className="container">
      <div className="query">
        <div className='inputquery'>
          <p>予算：</p>
          <input type="text" name="input1" placeholder="" value={inputs.input1} onChange={handleInputChange} />
        </div>
        <div className='inputquery'>
          <p>出発時間：</p>
          <input type="time" name="input2" placeholder="" value={inputs.input2} onChange={handleInputChange}/>
        </div>
        <div className='inputquery'>
          <p>帰宅時間：</p>
          <input type="time" name="input3" placeholder="" value={inputs.input3} onChange={handleInputChange}/>
        </div>
        <div className='inputquery'>
          <p>出発地点：</p>
          <input type="text" name="input4" placeholder="" value={inputs.input4} onChange={handleInputChange}/>
        </div>
        <button className="searchbutton"onClick={handleSearchClick}>検索</button>
      </div>
      <div className="right-panel">
        <h1 className="title">穴場スポット</h1>
      </div>
    </div>
  );
};

export default Title;
