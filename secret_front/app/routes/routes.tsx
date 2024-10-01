import React from 'react';
import {
    BrowserRouter as
    Router,
    Routes,
    Route,
    RouterProvider,
    createBrowserRouter,
    createRoutesFromElements,
} from "react-router-dom";
import Home from '../page';
import Map from '../mappage/page';
import Result from '../result/page';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Router>
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/map" element={<Map />} />
                <Route path="/result" element={<Result />} />
                <Route path="*" element={<h1>Page not found</h1>} />
            </Routes>
        </Router>
    )
);

const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
