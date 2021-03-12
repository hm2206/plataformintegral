import React from 'react';
import AppIconCube from './appIconCube';


const NotInternet = () => {
    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh', width: "100%", zIndex: "6000", fontFamily: 'ProximaNova, sans-serif', position: 'fixed', top: '0px', left: '0px' }} className="text-center">
            <div style={{ display: 'flex', width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', alignContent: 'center', flexDirection: 'column' }}>
                
                <AppIconCube/>
                
                <h1 style={{ fontWeight: '400', fontSize: '2.3rem', width: "100%" }} className="mt-2">Sin conexión a Internet</h1>
                
                <div style={{ maxWidth: '700px', marginBottom: '20px', marginTop: '20px', color: '#545454', fontSize: '1.7em', fontFamily: 'ProximaNova, sans-serif', lineHeight: '1.3125' }}>
                    Porfavor verifique que esté conectado a internet.
                    <img src="/img/loading_page.png" alt="CCFFigueroa"/>
                </div>
            </div>
        </div>
    )
}

export default NotInternet;