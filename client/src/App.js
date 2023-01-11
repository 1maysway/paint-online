import React from 'react';
import './styles/app.css'
import Canvas from "./components/Canvas";
import SettingBar from "./components/SettingBar";
import Toolbar from "./components/Toolbar";
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

const App = () => {
    return (
        <BrowserRouter>
            <div className='app'>
                <Routes>
                    <Route path='/:id' element={<><Toolbar/><SettingBar/><Canvas/></>} />
                    <Route path='/' element={<><Navigate to={`/f${(+new Date()).toString(16)}`} replace/><Toolbar/><SettingBar/><Canvas/></>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;