import React from 'react';
import '../../assets/css/general.css'
import "./spinner1.css"
export default () => (
   <div className={'spinner-con'}>
       <div className="lds-roller">
           <div></div>
           <div></div>
           <div></div>
           <div></div>
           <div></div>
           <div></div>
           <div></div>
           <div></div>
       </div>
   </div>

);