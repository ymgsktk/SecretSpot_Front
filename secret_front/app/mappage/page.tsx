"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import './page.css';

interface Route{
  origin: { lat: number, lng: number };
  destination: { lat: number, lng: number };
  directions: google.maps.DirectionsResult | null;
}

interface Location {
  lat: number;
  lng: number;
  name?:String;
}


const MapPage: React.FC = () => {
  const searchParams = useSearchParams();
  const[routes,setRoutes] = useState<Route[]>([]);//複数の経路を保持する
  const [waypoints, setWaypoints] = useState<Location[]>([]);// 経由地の配列
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);//ユーザが現在選択中のスポット
  const [data, setData] = useState<Location[]>([]);
  let [directions, setDirections] = useState<any>(null);
  const [departurePoint, setDeparturePoint] = useState<Location | null>(null); // 出発地

  const current = localStorage.getItem('currentplace');//現在地
  const currentPlace = current ? JSON.parse(current) : { lat: 35.681236, lng: 139.767125 };//現在地情報をJSON形式に変える

  useEffect(() => {
    const storedDeparturePoint = localStorage.getItem('currentplace');
    if (storedDeparturePoint) {
        setDeparturePoint(JSON.parse(storedDeparturePoint));
    } else {
        setDeparturePoint(currentPlace); // 初期地点を設定
        localStorage.setItem('currentplace', JSON.stringify(currentPlace)); // 初期地点を保存
    }
}, []);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_APIKEY || '',
  });

  useEffect(() => {
    const storedData = localStorage.getItem('searchData');//バックエンドからもろてきた情報
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
    scaledSize: isLoaded ? new window.google.maps.Size(35, 35) : undefined,
  };

  const selectedIconSize = isLoaded ? new window.google.maps.Size(35, 35) : undefined;

  const handleMarkerClick = (item: any, index: number) => {
    if (isLoaded && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentPlace,
          destination: { lat: item.lat, lng: item.lng },
          waypoints: waypoints.map(waypoint => ({
            location: new google.maps.LatLng(waypoint.lat, waypoint.lng),
            stopover: true,
        })),
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

  const handleRouteSelection = async (selectedLocation: Location) => {
    if(!departurePoint)return;

    const directionsService = new google.maps.DirectionsService();


    directionsService.route(
      {
        origin: { lat: departurePoint.lat, lng: departurePoint.lng },
        destination: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        waypoints: waypoints.map(waypoint => ({
                location: new google.maps.LatLng(waypoint.lat, waypoint.lng),
                stopover: true,
            })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log(waypoints)
          setRoutes(prevRoutes => [...prevRoutes, {
            origin: departurePoint,
            destination: selectedLocation,
            waypoints: waypoints.map(waypoint => ({
              location: new google.maps.LatLng(waypoint.lat, waypoint.lng),
              stopover: true,
          })),
            directions: result,
        }]);
        fetchNextLocations(selectedLocation)
        setWaypoints(prevWaypoints => [...prevWaypoints, selectedLocation]); // 選択した地点を経由地に追加
    } else {
        console.error(`Error fetching directions: ${status}`);
    }
  }
);
};

  

  const fetchNextLocations = (selectedLocation:Location) => {
    const newLocations = [
      { name: 'お台場', lat: 35.6275, lng: 139.774 },
      { name: '横浜ランドマークタワー', lat: 35.454, lng: 139.631 },
    ];
    setData(newLocations);
    console.log(setData)
  };

  return (
    <div className='page-container'>
      <div className='item-list'>
        <h2>アイテム一覧</h2>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className={`item-container ${selectedIndex === index ? 'selected' : ''}`} onClick={() => handleMarkerClick(item, index)}>
              <p>アイテム {index + 1}: {item.name}</p>
              <button className='choose-button' onClick={() => handleRouteSelection(item)} disabled={selectedIndex !== index}>選択</button>
              <button className='detail-button' disabled={selectedIndex !== index}>詳細</button>
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
              <Marker position={{ lat:departurePoint.lat, lng: departurePoint.lng }} icon={currentLocationIcon} />
            )}
            {/* その他のマーカー */}
            {data.map((item, index) => (
             // selectedIndex !== index && ( // 選択されたマーカー以外を表示
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
             // )
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
