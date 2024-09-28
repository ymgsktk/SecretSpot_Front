"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const MapPage: React.FC = () => {
  const searchParams = useSearchParams();
  const current = localStorage.getItem('currentplace'); // 文字列として取得

  // currentをJSONとして解析
  const currentPlace = current ? JSON.parse(current) : { lat: null, lng: null };

  const [data, setData] = useState<any[]>([]); // 空の配列で初期化

  useEffect(() => {
    // localStorageからデータを取得
    const storedData = localStorage.getItem('searchData');
    if (storedData) {
      setData(JSON.parse(storedData)); // 配列として設定
    }
  }, []);

  return (
    <div>
      <h1>Map Page</h1>
      {/* currentPlaceから緯度と経度を表示 */}
      <p>緯度: {currentPlace.lat}</p>
      <p>経度: {currentPlace.lng}</p>

      {/* dataをマッピングして出力 */}
      <h2>ローカルストレージのデータ:</h2>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index}>
            <p>アイテム {index + 1}:</p>
            <p>名前: {item.name}</p>
            <p>住所: {item.address}</p>
            <p>評価: {item.evaluate}</p>
            <p>緯度: {item.lat}</p>
            <p>経度: {item.lng}</p>
            <p>費用: {item.pricelevels}</p>
            <p>到着時間: {item.distanceTime}</p>
          </div>
        ))
      ) : (
        <p>データがありません。</p>
      )}
    </div>
  );
};

export default MapPage;
