/**
 * Create React App entry point. This and `public/index.html` files can not be
 * changed or moved.
 */
 import "react-app-polyfill/ie11";
 import "react-app-polyfill/stable";
 import React from "react";
 import ReactDOM from "react-dom";
 import axios from "axios";
 import * as _redux from "./redux";
 import store, { persistor } from "./redux/store";
 import App from "./app/App";
 import "./index.scss"; // Standard version
 // import "./sass/style.react.rtl.css"; // RTL version
 import "./_metronic/_assets/plugins/keenthemes-icons/font/ki.css";
 import "socicon/css/socicon.css";
 import "@fortawesome/fontawesome-free/css/all.min.css";
 import "./_metronic/_assets/plugins/flaticon/flaticon.css";
 import "./_metronic/_assets/plugins/flaticon2/flaticon.css";
 // Datepicker
 import "react-datepicker/dist/react-datepicker.css";
 import {
   MetronicLayoutProvider,
   MetronicSplashScreenProvider,
   MetronicSubheaderProvider,
 } from "./_metronic/layout";
 
 /**
  * Base URL of the website.
  *
  * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
  */
 // const { REACT_APP_API_URL } = process.env;
 
 /**
  * Inject metronic interceptors for axios.
  *
  * @see https://github.com/axios/axios#interceptors
  */
 _redux.setupAxios(axios, store);
 
 ReactDOM.render(
   <MetronicLayoutProvider>
     <MetronicSubheaderProvider>
       <MetronicSplashScreenProvider>
         <App store={store} persistor={persistor} />
       </MetronicSplashScreenProvider>
     </MetronicSubheaderProvider>
   </MetronicLayoutProvider>,
   document.getElementById("root")
 );
 