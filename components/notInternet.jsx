import React from 'react';


export default ({ my_app }) => {
    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh', width: "100%", zIndex: "6000", fontFamily: 'ProximaNova, sans-serif', position: 'fixed', top: '0px', left: '0px' }} className="text-center">
            <div style={{ display: 'flex', width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', alignContent: 'center', flexDirection: 'column' }}>
                
                <img 
                    style={{ 
                        width: "75px", height: "75px",
                        borderRadius: "0.7em",
                        border: "4px solid #fff",
                        boxShadow: "10px 10px rgba(0, 0, 0, .15)",
                        objectFit: "contain",
                        background: "#346cb0",
                        padding: "0.35em"
                    }}
                    src={my_app.icon && my_app.icon_images && my_app.icon_images.icon_200x200 || '/img/base.png'} 
                    alt="logo"
                />
                
                <h1 style={{ fontWeight: '400', fontSize: '2.3rem', width: "100%" }}>Sin conexión a Internet</h1>
                
                <div style={{ maxWidth: '700px', marginBottom: '20px', marginTop: '20px', color: '#545454', fontSize: '1.7em', fontFamily: 'ProximaNova, sans-serif', lineHeight: '1.3125' }}>
                    Porfavor verifique que esté conectado a internet.
                    <img src="/img/loading_page.png" alt="CCFFigueroa"/>
                </div>
            </div>
        </div>
    )
}