"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
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
interface SpotDetail {
  url: string;
  name: string;
  address: string;
  evaluate: number;
  lat:number;
  lng:number;
  pricelevels: number;
  distanceTime: {
    hour: number;
    min: number;
  };
}


const MapPage: React.FC = () => {
  const searchParams = useSearchParams();
  const[routes,setRoutes] = useState<Route[]>([]);//複数の経路を保持する
  const [waypoints, setWaypoints] = useState<Location[]>([]);// 経由地の配列
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);//ユーザが現在選択中のスポット
  //const [selectionHistory, setSelectionHistory] = useState<(number | null)[]>([]); // 選択履歴
  const [data, setData] = useState<SpotDetail[]>([]);//地点Xからの提案スポットを格納している
  const [alldata, setallData] = useState<SpotDetail[][]>([]);//今までのすべての提案スポットの情報を格納
  let [directions, setDirections] = useState<any>(null);
  const [departurePoint, setDeparturePoint] = useState<Location | null>(null); // 出発地
  const [selectedDetail, setSelectedDetail] = useState<SpotDetail | null>(null);
  const [choseDetail, setChoseDetail] = useState<SpotDetail | null>(null);
  const router = useRouter();
  const current = localStorage.getItem('currentplace');//現在地
  const currentPlace = current ? JSON.parse(current) : { lat: 35.681236, lng: 139.767125 };//現在地情報をJSON形式に変える
  const [showDetails, setShowDetails] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_APIKEY || '',
  });

  useEffect(() => {
    const storedData = localStorage.getItem('searchData'); // バックエンドからもろてきた情報
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      setallData([parsedData]); 
    }
  }, []);

  const mapContainerStyle: React.CSSProperties = {
    width: '95%',
    height: '600px',
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

  const selectedIconSize = isLoaded ? new window.google.maps.Size(0, 0) : undefined;

  const handleMarkerClick = (item: any, index: number) => {
    if(item.lat == currentPlace.lat && item.lng == currentPlace.lng){
      setShowDetails(false);
    }else{
      setShowDetails(true);
    }
    setSelectedDetail({
      url: item.url,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      evaluate: item.evaluate, 
      pricelevels: item.pricelevels,
      distanceTime: {
        hour: item.distanceTime.hour,
        min: item.distanceTime.min,
      }
    });
    if (isLoaded && window.google) {
      console.log("--------------")
      console.log("waypoints",waypoints)
      console.log("currentPlace",currentPlace)
      console.log("item",item)
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
      setSelectedIndex(index);
    } else {
      console.error("Google Maps API is not loaded yet.");
    }
  };

  const handleRouteSelection = async (selectedLocation: Location) => {
    if(!departurePoint)return;
    setChoseDetail(selectedDetail)
    fetchNextLocations(selectedLocation)
/*   
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
        
    } else {
        console.error(`Error fetching directions: ${status}`);
    }
   
  }
);*/

  };

const handlebacktodep = () =>{
    const confirmBack = window.confirm('選択を解除してもよろしいですか？');
    if (confirmBack) {     
        setSelectedIndex(null); 
        router.back(); 
    }
}

const handlebacktoroute = () => {
  if (waypoints.length > 0) {
    //ここから
    const lastWaypoint = waypoints[waypoints.length - 1]; 
    console.log("back")
    console.log("waypointsbefore",waypoints)
    const array = waypoints.length-1
    waypoints.splice(array, 2);
    console.log("newwaypoints",waypoints)
    setWaypoints(waypoints); 
    //ここまでで最新の経由値を削除
    //ここから
    const datas = alldata.length-1
    alldata.splice(datas,1)
    const lastdata = alldata[alldata.length -1];

    console.log("datas2",datas)
    console.log("lastdata",lastdata)
    setData(lastdata);
    //ここまでで最新の提案スポットリストを削除
    if (lastWaypoint !== undefined) { // data から必要な情報を取得
      handleMarkerClick(lastWaypoint,0); // 選択された地点を再描画
    } else {
      currentPlace.url ="",
      currentPlace.name ="",
      currentPlace.evaluate =0,
      currentPlace.adress ="",
      currentPlace.pricelevels =0,
      currentPlace.distanceTime = { hour: 0, min: 0},
      setShowDetails(false);
      handleMarkerClick(currentPlace,0);
    }
  } else {
    alert('これ以上戻れません');
  }
}

const handlebacktohome = () =>{
  if (currentPlace) {
    currentPlace.url ="",
    currentPlace.name ="",
    currentPlace.evaluate =0,
    currentPlace.adress ="",
    currentPlace.pricelevels =0,
    currentPlace.distanceTime = { hour: 0, min: 0},
    setShowDetails(false);
    setChoseDetail(currentPlace)
    handleMarkerClick(currentPlace,0)
  }else{
    alert("帰宅経路失敗")
  }
}


const handleAddRouteSelection = (selectedLocation: Location) => {
  //console.log("e")
  handleRouteSelection(selectedLocation); 
  setWaypoints(prevWaypoints => [...prevWaypoints, selectedLocation]); // 選択した地点を経由地に追加
}

const handlefinroute = () => {
  const queryParams = new URLSearchParams({
      currentPlace: JSON.stringify(current),
      waypoints: JSON.stringify(waypoints),
      selectedDetail: JSON.stringify(choseDetail),
  }).toString();

  router.push(`/result?${queryParams}`);
};


  

  const fetchNextLocations = (selectedLocation:Location) => {//バックエンドと通信する機能。返り値としてスポット情報をもらう
    const newLocations : SpotDetail[] = [//テストデータ
      { 
        url:"https://travel.rakuten.co.jp/mytrip/sites/mytrip/files/styles/main_image/public/migration_article_images/ranking/spot-odaiba-key.jpg?itok=XBRmwyWT",
        name: 'お台場', 
        lat: 35.6275, 
        lng: 139.774 ,
        address: "東京都新宿区西新宿２丁目８−１",
        evaluate: 5.0,
        pricelevels: 3000,
        distanceTime: { 
          hour: 17,
          min : 13,
        }
      },
      { 
        url:"https://hirameki.noge-printing.jp/wp-content/uploads/2018/06/pixta_38623408_M-min.jpg",
        name: '横浜ランドマークタワー',
        lat: 35.454, 
        lng: 139.631,
        address: "東京都新宿区西新宿２丁目８−１",
        evaluate: 2.4,
        pricelevels: 500,
        distanceTime: { 
          hour: 6,
          min : 5,
        } 
      },
    ];
    /*const storedDeparturePoint = JSON.parse(localStorage.getItem('currentplace') || "");
    const deptime = inputs.input2; 
    const arrtime = inputs.input3;
    const [dep_hours, dep_minutes] = deptime.split(':').map(Number); 
    const [arr_hours, arr_minutes] = arrtime.split(':').map(Number); 
    const APIdata = FetchServerInfo({lat: storedDeparturePoint.lat, lng: storedDeparturePoint.lng},address,{hour:dep_hours, min:dep_minutes},{hour:arr_hours, min:arr_minutes},parseInt(inputs.input1))
*/

    setData(newLocations);
    console.log("data",data)
    setallData(prevItems => [...prevItems, newLocations]);
    console.log("alldata",alldata)
  };

  return (
    <div className='page-container'>
      <div className='item-list'>
        <h2 className='header1'>スポットを探す：</h2>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className={`item-container ${selectedIndex === index ? 'selected' : ''}`} onClick={() => handleMarkerClick(item, index)}>
              <p>候補地 {index + 1}: {item.name}</p>
              <button className='choose-button' onClick={() => handleAddRouteSelection(item)} disabled={selectedIndex !== index}>選択</button>
              </div>
              
          ))
        ) : (
          <p>データがありません。</p>
        )}
        <div className='button1'>
          <button className='back-to-depbox' onClick={() =>handlebacktodep()}>初期化</button>
          <button className='back-to-home' onClick={() =>handlebacktohome()}>帰宅経路表示</button>
          <button className='back-to-depbox' onClick={() =>handlebacktoroute()}>１つ戻る</button>
          <button className='fin-route' onClick={handlefinroute}>経路終了</button>
        </div>
      </div>

      <div className='map-wrapper'>
        <div className='header'>
          <h1 className='title'>スポット選択</h1>
        </div>
        <div className='maps'>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            className="maps"
          >
            {!directions &&(
              <Marker position={{ lat:departurePoint.lat, lng: departurePoint.lng }} icon={currentLocationIcon} />
            )}
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
                  onClick={() => handleMarkerClick(item, index)} 
                />
             // )
            ))}
        

            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <p>Loading Map...</p>
        )}
        </div>
      {showDetails && (
      <div className="details-container">
          {selectedDetail ? (
            <div className="detail-content">
              <img src={selectedDetail.url} alt={selectedDetail.name} className="spot-image" />
              <h2>{selectedDetail.name}</h2>
              <p>住所: {selectedDetail.address}</p>
              <div>
                評価: <StarRating rating={selectedDetail.evaluate} />
              </div>

              <p>価格レベル: ¥{selectedDetail.pricelevels}</p>

              <p>
                距離時間: {selectedDetail.distanceTime.hour}時{selectedDetail.distanceTime.min}分
              </p>
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

export default MapPage;
