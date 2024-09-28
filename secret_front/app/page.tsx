"use client"; // クライアントコンポーネントであることを宣言

import React, { useState } from 'react';
import Link from 'next/link'; // next/link を使用
import './page.css';

const Home: React.FC = () => {
  const [inputs, setInputs] = useState({
    input1: '',
    input2: '',
    input3: '',
    input4: ''
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  };

  // ページ遷移をリンクで処理する
  const mockData = {
    lat: 35.6762,  // 緯度
    lng: 139.6503  // 経度
  };

  return (
    <div className="container">
      <div className="query">
        <div className='inputquery'>
          <p>予算：</p>
          <input
            type="text"
            name="input1"
            placeholder=""
            value={inputs.input1}
            onChange={handleInputChange}
          />
        </div>
        <div className='inputquery'>
          <p>出発時間：</p>
          <input
            type="time"
            name="input2"
            placeholder=""
            value={inputs.input2}
            onChange={handleInputChange}
          />
        </div>
        <div className='inputquery'>
          <p>帰宅時間：</p>
          <input
            type="time"
            name="input3"
            placeholder=""
            value={inputs.input3}
            onChange={handleInputChange}
          />
        </div>
        <div className='inputquery'>
          <p>出発地点：</p>
          <input
            type="text"
            name="input4"
            placeholder=""
            value={inputs.input4}
            onChange={handleInputChange}
          />
        </div>
        <Link href={`/mappage?lat=${mockData.lat}&lng=${mockData.lng}`}>
          <button className="searchbutton">検索</button>
        </Link>
      </div>
      <div className="right-panel">
        <h1 className="title">穴場スポット</h1>
      </div>
    </div>
  );
};

export default Home;
