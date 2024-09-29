"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import './page.css';

const MapPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const current = localStorage.getItem('currentplace'); // 文字列として取得

  // currentをJSONとして解析
  const currentPlace = current ? JSON.parse(current) : { lat: 35.681236, lng: 139.767125 }; // デフォルトは東京駅

  const [data, setData] = useState<any[]>([]); // 空の配列で初期化
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_APIKEY||'', // ここにAPIキーを設定
  });

  useEffect(() => {
    // localStorageからデータを取得
    const storedData = localStorage.getItem('searchData');
    if (storedData) {
      setData(JSON.parse(storedData)); // 配列として設定
    }
  }, []);

  // Google Mapのスタイルとオプション
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };

  const center = {
    lat: currentPlace.lat ,
    lng: currentPlace.lng, 
  };

  const currentLocationIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // 現在地のマーカーアイコン
    scaledSize: new window.google.maps.Size(40, 40), // アイコンサイズ
  };

  const otherLocationIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // その他のマーカーアイコン
    scaledSize: new window.google.maps.Size(50, 50), // アイコンサイズ
  };
  const selectedIconSize = new window.google.maps.Size(60, 60);

  return (
    <div className='page-container'>
      <div className='item-list'>
        <h2>アイテム一覧</h2>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index}  className={`item-container ${selectedIndex === index ? 'selected' : ''}`}>
              <p>アイテム {index + 1}: {item.name}</p>
              <button className='choose-button'>選択</button>
              <button className='detail-button'>詳細</button>
            </div>
          ))
        ) : (
          <p>データがありません。</p>
        )}
      </div>

      <div className='map-wrapper'>
        <h1>Map Page</h1>
        <p>緯度: {currentPlace.lat}</p>
        <p>経度: {currentPlace.lng}</p>

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
          >
           
            <Marker position={{ lat: currentPlace.lat, lng: currentPlace.lng }} icon={currentLocationIcon}/>

            {data.map((item, index) => (
              <Marker
                key={index}
                position={{ lat: item.lat, lng: item.lng }}
                title={item.name}
                icon={{
                  ...otherLocationIcon,
                  scaledSize: selectedIndex === index ? selectedIconSize : otherLocationIcon.scaledSize 
                }}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </GoogleMap>
        ) : (
          <p>Loading Map...</p>
        )}
      </div>
    </div>
  );
};

export default MapPage;
