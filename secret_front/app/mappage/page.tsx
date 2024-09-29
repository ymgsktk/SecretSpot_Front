"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import './page.css';

const MapPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const current = localStorage.getItem('currentplace');

  const currentPlace = current ? JSON.parse(current) : { lat: 35.681236, lng: 139.767125 };

  const [data, setData] = useState<any[]>([]);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_APIKEY || '',
  });

  let [directions, setDirections] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('searchData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const mapContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '500px',
  };

  const center = {
    lat: currentPlace.lat,
    lng: currentPlace.lng,
  };

  const currentLocationIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : undefined,
  };

  const otherLocationIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: isLoaded ? new window.google.maps.Size(50, 50) : undefined,
  };

  const selectedIconSize = isLoaded ? new window.google.maps.Size(60, 60) : undefined;

  const handleMarkerClick = (item: any, index: number) => {
    if (isLoaded && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentPlace,
          destination: { lat: item.lat, lng: item.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            alert(`Error: ${status}-${result}`);
          }
        }
      );
      setSelectedIndex(index); // 選択されたマーカーのインデックスを更新
    } else {
      console.error("Google Maps API is not loaded yet.");
    }
  };

  return (
    <div className='page-container'>
      <div className='item-list'>
        <h2>アイテム一覧</h2>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className={`item-container ${selectedIndex === index ? 'selected' : ''}`}>
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
            {/* 現在地のマーカー */}
            {!directions &&(
              <Marker position={{ lat: currentPlace.lat, lng: currentPlace.lng }} icon={currentLocationIcon} />
            )}
            {/* その他のマーカー */}
            {data.map((item, index) => (
              selectedIndex !== index && ( // 選択されたマーカー以外を表示
                <Marker
                  key={index}
                  position={{ lat: item.lat, lng: item.lng }}
                  title={item.name}
                  icon={{
                    ...otherLocationIcon,
                    scaledSize: selectedIndex === index ? selectedIconSize : otherLocationIcon.scaledSize 
                  }}
                  onClick={() => handleMarkerClick(item, index)} // インデックスを渡す
                />
              )
            ))}

            {/* 経路を描画 */}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <p>Loading Map...</p>
        )}
      </div>
    </div>
  );
};

export default MapPage;
