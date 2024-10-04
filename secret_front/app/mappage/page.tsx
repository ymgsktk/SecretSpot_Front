"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import './page.css';
import FetchServerInfo from '../API/front_api';

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
interface Time{
  hour:number;
  min:number;
}
interface SpotDetail {
  information_url:string;
  url: string;
  name: string;
  address: string;
  evaluate: number;
  lat:number;
  lng:number;
  price_level: any;
  explanation:string;
  //type:string;
  distanceTime: {
    hour: number;
    min: number;
  };
}
interface Spot{//latとlng変換用インタフェース
  information_url:string;
  url: string;
  name: string;
  address: string;
  evaluate: number;
  lat:string;
  lng:string;
  price_level: any;
  explanation: string;
  //type:string;
  distanceTime: {
    hour: number;
    min: number;
  };
}

interface SpotData {
  lat: number | string; 
  lng: number | string; 
}


const MapPage: React.FC = () => {
  const searchParams = useSearchParams();
  const[routes,setRoutes] = useState<Route[]>([]);//複数の経路を保持する
  const [waypoints, setWaypoints] = useState<Location[]>([]);// 経由地の配列
  const [waypoints_time,setWaypointsTime] = useState<Time[]>([]);// 経由地の到着時間配列
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);//ユーザが現在選択中のスポット
  //const [selectionHistory, setSelectionHistory] = useState<(number | null)[]>([]); // 選択履歴
  const [data, setData] = useState<SpotDetail[]>([]);//地点Xからの提案スポットを格納している
  const [alldata, setallData] = useState<SpotDetail[][]>([]);//今までのすべての提案スポットの情報を格納
  let [directions, setDirections] = useState<any>(null);
  const [departurePoint, setDeparturePoint] = useState<Location | null>(null); // 出発地
  const [selectedDetail, setSelectedDetail] = useState<SpotDetail | null>(null);
  const [choseDetail, setChoseDetail] = useState<SpotDetail | null>(null);
  const [choseplace, setChosePlace] = useState<SpotDetail | null>(null);
  const router = useRouter();
  const current = localStorage.getItem('currentplace');//現在地
  const currentPlace = current ? JSON.parse(current) : { lat: 35.681236, lng: 139.767125 };//現在地情報をJSON形式に変える
  const [showDetails, setShowDetails] = useState(true);
  const navigate = useNavigate();
  const [isChildClicked, setIsChildClicked] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState('tourist_attraction'); //spotかレストランか
  

  useEffect(() => {
    const storedDeparturePoint = localStorage.getItem('currentplace');
    if (storedDeparturePoint) {
        setDeparturePoint(JSON.parse(storedDeparturePoint));
    } else {
        setDeparturePoint(currentPlace); // 初期地点を設定
        localStorage.setItem('currentplace', JSON.stringify(currentPlace)); // 初期地点を保存
    }
}, []);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelection(e.target.value);  // 選択した値を更新
  };
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
    const storedData1 = localStorage.getItem('searchData') || ''; // バックエンドからもろてきた情報

   
    if (storedData1) {
      console.log("storedData",storedData1)
        try {
            const parsedData = JSON.parse(storedData1);
            console.log("aa",parsedData)

            
            if (parsedData) {
              const formattedData = parsedData.map((items:Spot) => ({
                ...items,
                lat: parseFloat(items.lat),  
                lng: parseFloat(items.lng)  
            }));
                setData(formattedData); 
                console.log(formattedData)
                setallData([formattedData]); 
            } else {
                console.error("No 'data' property in parsed data:", parsedData);
            }
        } catch (error) {
            console.error("Error parsing JSON data:", error);
        }
    }
}, []);

  const mapContainerStyle: React.CSSProperties = {
    width: '95%',
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

  const selectedIconSize = isLoaded ? new window.google.maps.Size(0, 0) : undefined;

  const handleMarkerClick = (item: any, index: number) => {
    if(item.lat == currentPlace.lat && item.lng == currentPlace.lng){
      setShowDetails(false);
    }else{
      setShowDetails(true);
    }
    setChoseDetail(item)
    setSelectedDetail({
      information_url:item.information_url,
      url: item.url,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      evaluate: item.evaluate, 
      price_level: item.price_level,
      explanation: item.explanation,
      //type:item.type,
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
      console.log("alldata",alldata)
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

  useEffect(() => {
      fetchNextLocations(); // choseDetailが更新された後に実行  
      const arrivalTime2 = localStorage.getItem("arrivalTime")||"" ;
      const [arrivalHour, arrivalMinute] = arrivalTime2.split(':').map(Number);
      const hours = parseInt(localStorage.getItem("dep_hours") || "0", 10);
      const adjustedArrivalTime = arrivalHour < hours ? arrivalHour + 24 : arrivalHour;
      const timeDifference = adjustedArrivalTime - hours;

      // 2時間以内かつアラートがまだ表示されていない場合
      if (timeDifference <= 2 && !alertShown) {
        alert("設定した帰宅時間まであと2時間になりました");
        setAlertShown(true);  // アラートを表示したことを記録
      }
  }, [choseplace]);

  const handleRouteSelection = async (selectedLocation: Location) => {
    if(!departurePoint)return;
    console.log("selectedDetail_111",selectedDetail)
    setChosePlace(selectedDetail)
    
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
    console.log("newwaypoints!",waypoints)
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
      currentPlace.information_url="",
      currentPlace.url ="",
      currentPlace.name ="",
      currentPlace.evaluate =0,
      currentPlace.adress ="",
      currentPlace.price_level =0,
      currentPlace.explanation= "",
      //type:item.type,
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
    currentPlace.information_url="",
    currentPlace.url ="",
    currentPlace.name ="",
    currentPlace.evaluate =0,
    currentPlace.adress ="",
    currentPlace.price_level =0,
    currentPlace.explanation= "",
    //type:item.type,
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
  console.log("choseDetail",choseDetail)
  const queryParams = new URLSearchParams({
      currentPlace: JSON.stringify(current),
      waypoints: JSON.stringify(waypoints),
      selectedDetail: JSON.stringify(choseDetail),
  }).toString();

  router.push(`/result?${queryParams}`);
};


  
/*const newLocations : SpotDetail[] = [//テストデータ
      { 
        url:"https://travel.rakuten.co.jp/mytrip/sites/mytrip/files/styles/main_image/public/migration_article_images/ranking/spot-odaiba-key.jpg?itok=XBRmwyWT",
        name: 'お台場', 
        lat: 35.6275, 
        lng: 139.774,
        address: "東京都新宿区西新宿２丁目８−１",
        evaluate: 5.0,
        priceLevels: 3000,
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
        priceLevels: 500,
        distanceTime: { 
          hour: 6,
          min : 5,
        } 
      },
    ];*/
    const fetchNextLocations = async () => {// バックエンドと通信してスポット情報を取得
      setLoading(true);
      console.log("chosePlace",choseplace)
      const storedDeparturePoint = selectedDetail ;//JSON.parse(localStorage.getItem('currentplace') || "");
      const deptime = choseplace?.distanceTime; 
      const dep_hours = deptime ? deptime.hour : 0; 
      const dep_minutes = deptime ? deptime.min : 0;
      const arrtime = localStorage.getItem('arrivalTime');
      const budget = localStorage.getItem('budget');
      const parsedBudget = budget !== null ? parseInt(budget) : 0;
      
      const [arr_hours, arr_minutes] = arrtime ? arrtime.split(':').map(Number): [0, 0]; 
      console.log("dep",dep_hours,dep_minutes)
     if(storedDeparturePoint){
      const APIdata = await FetchServerInfo(
          { lat: storedDeparturePoint.lat.toString(), lng: storedDeparturePoint.lng.toString() },
          choseDetail?.address || "",
          { hour: dep_hours+1, min: dep_minutes },
          { hour: arr_hours, min: arr_minutes },
          parsedBudget,
          selection,
      );
      
  
     console.log("mappage-APIdata",APIdata)
      if (APIdata.data) {
          const convertedData = APIdata.data.map((item: SpotData) => ({
              ...item,
              lat: parseFloat(item.lat as string),
              lng: parseFloat(item.lng as string),
          }));
  
          setData(convertedData); // データをセット
          localStorage.setItem("dep_hours",dep_hours.toString())
          console.log("converteddata", convertedData);
          setallData(prevItems => [...prevItems, [...convertedData]]);
        } else {
          console.error("storedDeparturePoint is null or undefined");
        }
          //console.log("alldata", [...prevItems, ...convertedData]);
      }
      setLoading(false);
  };
    

  return (
    <div className='page-container'>
      <div className='item-list'>
        <h2 className='header1'>候補地一覧：</h2>
        <div className='spot-or-restaurant'>
          <label>
          <input
            type="radio"
            value="restaurant"
            checked={selection === 'restaurant'}
            onChange={handleSelectionChange}
          />
          レストラン
          </label>
          <label>
            <input
              type="radio"
              value="tourist_attraction"
              checked={selection === 'tourist_attraction'}
              onChange={handleSelectionChange}
            />
            観光スポット
          </label>
        </div>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className={`item-container ${selectedIndex === index ? 'selected' : ''}`} onClick={() => handleMarkerClick(item, index)}>
                <div className='left-button'>
                  <div className='left-button-top'>
                    <p className='proposed-site'>候補地 {index + 1}: </p>
                    <p className="distance-time">{item.distanceTime.hour}:{String(item.distanceTime.min).padStart(2, '0')}</p>
                  </div>
                <p className='spot-name'>{item.name}</p>
                </div>
                <div className='right-button'>
              <button className='choose-button' onClick={() =>  handleAddRouteSelection(item)}disabled={selectedIndex !== index}>選択</button>
              </div>
            </div>       
          ))
        ) : (
          <p>データがありません。</p>
        )}
        <div className='button-list'>
          <button className='back-to-depbox' onClick={() =>handlebacktodep()}>初期化</button>
          <button className='back-to-depbox' onClick={() =>handlebacktohome()}>帰宅経路</button>
          <button className='back-to-depbox' onClick={() =>handlebacktoroute()}>１つ戻る</button>
          <button className='back-to-depbox' onClick={handlefinroute}>経路終了</button>
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
              <p>
              URL: <a href={selectedDetail.information_url} target="_blank" rel="noopener noreferrer">{selectedDetail.information_url}</a>
              </p>
              <p>住所: {selectedDetail.address}</p>
              <div>
                評価: <StarRating rating={selectedDetail.evaluate} />
              </div>

              <p>価格: {typeof selectedDetail.price_level === 'number' ? `¥${selectedDetail.price_level*1000}~` : selectedDetail.price_level}</p>

              <p>
                到着時間: {selectedDetail.distanceTime.hour}時{selectedDetail.distanceTime.min}分
              </p>
              <p>概要: {selectedDetail.explanation}</p>
            </div>
          ) : (
            <p>スポット詳細情報</p>
          )}
        </div>
      )}
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

export default MapPage;
