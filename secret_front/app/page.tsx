"use client"; // クライアントコンポーネントとして設定

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Link from 'next/link'; // Next.jsのLinkを使用
import './page.css';

// マップのサイズを指定
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '600px',
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
  const [address, setAddress] = useState<string>('');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  const handleAddressSubmit = async () => {
    if (address) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results) {
          const{ lat, lng } = results[0].geometry.location;
          setMarkerPosition({ lat: lat(), lng: lng() }); 
          const newplace = {
            lat: lat(),
            lng: lng()
          }
          localStorage.setItem('currentplace', JSON.stringify(newplace));
        } else {
          alert('住所が見つかりませんでした。');
        }
      });
    }
  };

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
    googleMapsApiKey: process.env.NEXT_PUBLIC_APIKEY||'', // ここにAPIキーを入力
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
  /*
  const handleShowMap = () => {
    setShowMap(true);
  };*/

  const handleSearchClick = () => {
    //バックエンド側に今まで到達したことのある住所と、出発地点の情報を渡す。
    const mockData = [{
      url : "https://www.img-ikyu.com/contents/dg/yahoo_contents/kanko/area/tokyo_tokyoeki.jpg?auto=compress,format&lossless=0&fit=crop&w=500&h=500",
      name: "東京駅",
      address: "東京都千代田区丸の内１丁目",
      evaluate: 3.6,
      lat: 35.6812362,
      lng: 139.7649361,
      pricelevels: 2000,
      distanceTime: { 
        hour: 14,
        min : 35,
      }
    },{
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUCdsXIJJH4V4DLKPU2mIpfT10NOrXo9l83g&s",
      name: "東京都庁",
      address: "東京都新宿区西新宿２丁目８−１",
      evaluate: 4.5,
      lat: 35.6894569,
      lng: 139.6917295,
      pricelevels: 1000,
      distanceTime: { 
        hour: 15,
        min : 12,
      }
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
          <p>出発地点を入力:</p>
          <div>
            <input
              className='adress-input'
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="住所を入力してください"
            />
            <button onClick={handleAddressSubmit}>住所検索</button>
          </div>
          {/*<button onClick={handleShowMap} className="show-map-button">地図を表示</button>*/}
        </div>
        <div className='inputquery'>
          <Link href={`/mappage?lat=${markerPosition.lat}&lng=${markerPosition.lng}`}>
            <button className="searchbutton" onClick={handleSearchClick}>スポット検索</button>
          </Link>
        </div>
      </div>
      <div className='right'>
        <div className="right-panel">
          <h1 className="title">穴場スポット</h1>
        </div>
        <div className="map">
          {isLoaded && ( 
            <div className={`map-container ${showMap ? 'show' : ''}`}>
              <GoogleMap
                mapContainerStyle={containerStyle} 
                center={center} 
                zoom={10} 
                onClick={onMapClick}
              >
                <Marker position={markerPosition} />
              </GoogleMap>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
