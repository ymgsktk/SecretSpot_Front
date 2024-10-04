"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import './page.css'
import {sendMessageToLine} from '../LINEAPI/lineapi'
interface Waypoint {
    lat: number;
    lng: number;
    name: string;
  }
interface SpotDetail {
  information_url:string;
  url: string;
  name: string;
  address: string;
  evaluate: number;
  lat:number;
  lng:number;
  price_level: number;
  explanation:string;
  distanceTime: {
    hour: number;
    min: number;
  };
}
const Result: React.FC = () => {
    const searchParams = useSearchParams();   
    //console.log("searchParams",searchParams)
    // クエリパラメータを取得
    const currentPlace2 = searchParams.get('currentPlace');  
    const selectedDetail2 = searchParams.get('selectedDetail');
    const waypoints2= searchParams.get('waypoints');
    console.log("waypoints2",waypoints2)
    
   // const currentPlace = currentPlace2 ? JSON.parse(currentPlace2) : { lat: 35.681236, lng: 139.767125 };
   const current = localStorage.getItem('currentplace');//現在地
    const currentPlace = current ? JSON.parse(current) : { lat: 35.681236, lng: 139.767125 };//現在地情報をJSON形式に変える
    const selectedDetail = selectedDetail2 ? JSON.parse(selectedDetail2) : null;
    const [select, setSelected] = useState<SpotDetail | null>(null);
  
    
    const waypoints: SpotDetail[] = waypoints2 ? JSON.parse(waypoints2) : [];
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    let [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [departurePoint, setDeparturePoint] = useState<Location | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [center, setCenter] = useState({
      lat: select ? select.lat :  currentPlace.lat,
      lng: select ? select.lng : currentPlace.lng,
    });
    
    const router = useRouter();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_APIKEY || '',
      });
      useEffect(() => {
        if (isLoaded) {
            calculateDirections();
        }
    }, [isLoaded]); 
    

      useEffect(() =>{
        const storedDeparturePoint = localStorage.getItem('currentplace');
        if (storedDeparturePoint) {
            setDeparturePoint(JSON.parse(storedDeparturePoint));
        } else {
            setDeparturePoint(currentPlace); // 初期地点を設定
            localStorage.setItem('currentplace', JSON.stringify(currentPlace)); // 初期地点を保存
        }
    }, []);

      const StarRating = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
        return (
          <div className="star-rating">
            {[...Array(fullStars)].map((_, index) => (
              <span key={index}>★</span>
            ))}
            {halfStar && <span>☆</span>}
            {[...Array(emptyStars)].map((_, index) => (
              <span key={index}>☆</span>
            ))}
          </div>
        );
      };

      const mapContainerStyle: React.CSSProperties = {
        width: '95%',
        height: '500px',
      };
     /*const center = {
        lat: currentPlace.lat,
        lng: currentPlace.lng,
      };*/
      const calculateDirections = () => {
        if (isInitialLoad) {
        if (isLoaded && window.google && currentPlace) {
            console.log("result_waypoints",selectedDetail,currentPlace)
            if(selectedDetail.lat != currentPlace.lat && selectedDetail.lng != currentPlace.lng){
                const array = waypoints.length-1
                waypoints.splice(array, 1);
            }
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: new google.maps.LatLng(currentPlace.lat, currentPlace.lng), 
                    destination: selectedDetail,
                    waypoints: waypoints.map(waypoint => ({
                        location: new google.maps.LatLng(waypoint.lat, waypoint.lng),
                        stopover: true,
                    })),
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        console.log("Directions received:", result);
                        setDirections(result);
                    } else {
                        alert(`Error: ${status}-${result}`);
                    }
                }
            );
        } else {
            console.error("Google Maps API is not loaded or currentPlace is undefined.");
        }
        setIsInitialLoad(false);
    }
    }
    
      const handleshare = () =>{
        sendMessageToLine(waypoints);
      }


      const handlebacktodep = () =>{
        const confirmBack = window.confirm('選択を解除してもよろしいですか？');
        if (confirmBack) {     
            setSelectedIndex(null); 
            router.push("/"); 
        }
    }
    const handleMarkerClick = (item:any, index:number) =>{
      setCenter({lat: item.lat,lng: item.lng})
      console.log("center",center)
      if(item.lat == currentPlace.lat && item.lng == currentPlace.lng){
        setShowDetails(false);
      }else{
        setShowDetails(true);
      }
      setSelected({
        information_url:item.information_url,
        url: item.url,
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        address: item.address,
        evaluate: item.evaluate, 
        price_level: item.price_level,
        explanation:item.explanation,
        distanceTime: {
          hour: item.distanceTime.hour,
          min: item.distanceTime.min,
        }
      });
        setSelectedIndex(index);
        console.log("selectedIndex",selectedIndex)
    }


    return (
    <div className='page-container'>
      <div className='item-list'>
        <h2 className='title3'>スポット一覧</h2>
        {waypoints.length > 0 ? (
          waypoints.map((item, index) => (
            <div key={index} className={`item-container ${selectedIndex === index ? 'selected' : ''}`} onClick={() => handleMarkerClick(item, index)}>
              <div className='spot-box'>
                <div className='spot-box-top'>
                  <p className='proposed-site'>{String.fromCharCode(66 + index)}: </p>
                  <p className="distance-time">{item.distanceTime.hour}:{String(item.distanceTime.min).padStart(2, '0')}</p>
                </div>
                <div className='spot-box-bottom'>
                  <p className='spot-name'>{item.name}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>データがありません。</p>
        )}
        <div className='button1'>
          <button className='back-to-depbox' onClick={() =>handlebacktodep()}>最初に戻る</button>
          <button className='back-to-home' onClick={() =>handleshare()}>共有</button>
        </div>
      </div>

      <div className='map-wrapper'>
        <div className='header2'>
            <h1 className='title1'>経路完成</h1>
        </div>
        <div className='maps2'>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
          >
           
              {waypoints.map((item, index) => (
              <Marker position={{ lat:departurePoint.lat, lng: departurePoint.lng }} onClick={() => handleMarkerClick(item, index)}/>
            ))}
           
            

            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <p>Loading Map...</p>
        )}
        </div>
        {showDetails && (
      <div className="details-container">
          {select ? (
            <div className="detail-content">
              <img src={select.url} alt={select.name} className="spot-image" />
              <h2>{select.name}</h2>
              <p>
              URL: <a href={select.information_url} target="_blank" rel="noopener noreferrer">{select.information_url}</a>
              </p>
              <p>住所: {select.address}</p>
              <div>
                評価: <StarRating rating={select.evaluate} />
              </div>

              <p>価格: {typeof select.price_level === 'number' ? `¥${select.price_level}` : `${select.price_level*1000}~`}</p>

              <p>
                距離時間: {select.distanceTime.hour}時{select.distanceTime.min}分
              </p>
              <p>概要: {select.explanation}</p>
            </div>
          ) : (
            <p>スポット詳細情報</p>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Result;
