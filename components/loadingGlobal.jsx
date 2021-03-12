import React from 'react';
import AppIconCube from './appIconCube';

const LoadingGlobal = ({ display, id }) => {

    // render
    return (
        <div style={{
            width: "100%", 
            height: "100%", 
            background: 'rgba(255, 255, 255, 0.8)', 
            position: 'fixed', 
            top: '0px', 
            left: '0px',
            zIndex: '5000',
            display: display ? display : 'block'
        }}  id={id ? id : 'id-loading-brand'}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AppIconCube className="loading-brand"/>
            </div>
        </div>
    )
}

export default LoadingGlobal;