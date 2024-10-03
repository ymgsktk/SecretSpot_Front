"use client"; // クライアントコンポーネントとして設定

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Link from 'next/link'; // Next.jsのLinkを使用
import './page.css';
import FetchServerInfo from './API/front_api';

// マップのサイズを指定
const containerStyle: React.CSSProperties = {
  width: '95%',
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  /*const APIdata = [{
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
    }];*/
    const handleSearchClick = async () => {
      // バックエンド側に今まで到達したことのある住所と、出発地点の情報を渡す。
      setLoading(true);
      const storedDeparturePoint = JSON.parse(localStorage.getItem('currentplace') || "{}");
      const deptime = inputs.input2; 
      const arrtime = inputs.input3;
      
      // 出発時刻と到着時刻を分解
      const [dep_hours, dep_minutes] = deptime.split(':').map(Number); 
      const [arr_hours, arr_minutes] = arrtime.split(':').map(Number); 
      
      try {
          // FetchServerInfoをawaitで呼び出し
          const response = await FetchServerInfo(
              { lat: storedDeparturePoint.lat, lng: storedDeparturePoint.lng },
              address,
              { hour: dep_hours, min: dep_minutes },
              { hour: arr_hours, min: arr_minutes },
              parseInt(inputs.input1)
          );
          const APIdata = response.data;
          //window.location.reload();
  
          console.log("result0", APIdata);
  
          // localStorageにデータを保存する
          //localStorage.clear()
          localStorage.setItem('searchData', JSON.stringify(APIdata));
          localStorage.setItem('arrivalTime',arrtime);
          localStorage.setItem('budget',inputs.input1);
          router.push('/mappage');
      } catch (error) {
          console.error("Error fetching data from server:", error);
      } finally {
        setLoading(false); // ローディング終了
      }
  };

  return (
    <div className="container">
      <div className="query">
        <div className='inputquery1'>
          <p className='input-des'>予算：</p>
          <input
            type="number"
            name="input1"
            placeholder=""
            value={inputs.input1}
            onChange={handleInputChange}
          />
        </div>
        <div className='inputquery1'>
          <p className='input-des'>出発時間：</p>
          <input
            type="time"
            name="input2"
            placeholder=""
            value={inputs.input2}
            onChange={handleInputChange}
          />
        </div>
        <div className='inputquery1'>
          <p className='input-des'>帰宅時間：</p>
          <input
            type="time"
            name="input3"
            placeholder=""
            value={inputs.input3}
            onChange={handleInputChange}
          />
        </div>
        <div className='inputquery1'>
          <p className='input-des'>出発地点を入力:</p>
          <div className='address-input-area'>
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
        <div className='inputquery2'>
          {/*<Link href={`/mappage?lat=${markerPosition.lat}&lng=${markerPosition.lng}`}>*/}
            <button className="searchbutton" onClick={handleSearchClick}>スポット検索</button>
          {/*</Link>*/}
        </div>
      </div>
      <div className='right'>
        <div className="right-panel">
          <h1 className="title">穴場すぽっと</h1>
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
      {loading && (
        <div className={`loading-overlay ${loading ? 'active' : ''}`}>
          <div className="spinner"></div>
          <div className="loading-message">データを取得中です...</div>
        </div>
      )}
    </div>
    
  );
};

export default Home;
