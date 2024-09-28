"use client";
import { useSearchParams } from 'next/navigation';
import React from 'react';

const MapPage: React.FC = () => {
  // クエリパラメータを取得
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  return (
    <div>
      <h1>Map Page</h1>
      <p>緯度: {lat}</p>
      <p>経度: {lng}</p>
    </div>
  );
};

export default MapPage;
