// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// App を Title に変更
import Title from './app/title';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* App の代わりに Title コンポーネントを使用 */}
    <Title />
  </React.StrictMode>
);

// Web Vitals の測定のために必要な処理
reportWebVitals();
