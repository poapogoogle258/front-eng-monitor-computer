import React from 'react';
import ReactDOM from 'react-dom';


import App from './pages/home'
import History from './pages/history'

import { BrowserRouter, Route,Routes } from "react-router-dom";


import 'semantic-ui-css/semantic.min.css'


ReactDOM.render(
    <BrowserRouter forceRefresh={true}>
        <Routes>
          <Route path='/' element={<App/>} />
          <Route path='/history/:date' element={<History/>} />
        </Routes>
    </BrowserRouter>
  ,
  document.getElementById('root')
);

