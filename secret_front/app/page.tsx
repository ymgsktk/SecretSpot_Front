"use client"; // クライアントコンポーネントとして設定

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Link from 'next/link'; // Next.jsのLinkを使用
import './page.css';

// マップのサイズを指定
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
};

// マップの初期中心位置
const center: google.maps.LatLngLiteral = {
  lat: 35.6762, // 緯度（東京）
  lng: 139.6503, // 経度（東京）
};

const Home: React.FC = () => {
  const [inputs, setInputs] = useState({
    input1: '',
    input2: '',
    input3: '',
  });

  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(center); // マーカーの位置の型を指定
  const [showMap, setShowMap] = useState(false); // 地図の表示状態を管理
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null); // クリックしたマーカーの位置を保存


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  // Google Maps APIのロード
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAeUfMMhg1ZvHsHXo7RHrvbzKji9-c-LYk', // ここにAPIキーを入力
  });

  // マップクリック時にマーカーの位置を更新する
  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPosition(newPosition);
      localStorage.setItem('currentplace', JSON.stringify(newPosition));
    }
  }, []);

  // ボタンをクリックして地図を表示する関数
  const handleShowMap = () => {
    setShowMap(true);
  };

  const handleSearchClick = () => {
    const mockData = [{
      name: "東京駅",
      address: "東京都千代田区丸の内１丁目",
      evaluate: 3.6,
      lat: 35.6812362,
      lng: 139.7649361,
      pricelevels: 2000,
      distanceTime: 14
    },{
      name: "東京都庁",
      address: "東京都新宿区西新宿２丁目８−１",
      evaluate: 4.5,
      lat: 35.6894569,
      lng: 139.6917295,
      pricelevels: 1000,
      distanceTime: 14
    }];

    // localStorageにデータを保存する
    localStorage.setItem('searchData', JSON.stringify(mockData));
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
          <p>出発地点を選択:</p>
          <button onClick={handleShowMap} className="show-map-button">地図を表示</button>
        </div>
        <div className='inputquery'>
        <Link href={`/mappage?lat=${markerPosition.lat}&lng=${markerPosition.lng}`}>
          <button className="searchbutton" onClick={handleSearchClick}>検索</button>
        </Link>
      </div>
      </div>
      <div className='right'>
        <div className="right-panel">
          <h1 className="title">穴場スポット</h1>
        </div>
        <div className="inputquery">
          {showMap && isLoaded && ( // showMapがtrueの時だけ地図を表示
            <div className={`map-container ${showMap ? 'show' : ''}`}> {/* アニメーション用のクラスを追加 */}
              <GoogleMap
                mapContainerStyle={containerStyle} // マップコンテナのスタイルを指定
                center={center} // マップの中心位置
                zoom={10} // ズームレベル
                onClick={onMapClick} // マップクリック時に緯度経度を取得
              >
                <Marker position={markerPosition} /> {/* クリックした位置にマーカーを表示 */}
              </GoogleMap>
            </div>
          )}
        </div>
      </div>
      {selectedPosition && (
        <div className="selected-position">
          <p>選択された位置:</p>
          <p>緯度: {selectedPosition.lat}</p>
          <p>経度: {selectedPosition.lng}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
