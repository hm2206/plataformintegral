import React from 'react';
import AppIconCube from './appIconCube';


const NotCurrent = () => {

    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'ProximaNova, sans-serif' }} className="text-center">
            <div style={{ display: 'flex', width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', alignContent: 'center', flexDirection: 'column' }}>
                    
                <AppIconCube/>
                    
                <h1 style={{ fontWeight: '400', fontSize: '2.3rem', width: "100%" }}>Abriste la app en una nueva pestaña</h1>
                
                <div style={{ maxWidth: '700px', marginBottom: '20px', marginTop: '20px', color: '#545454', fontSize: '1.7em', fontFamily: 'ProximaNova, sans-serif', lineHeight: '1.3125' }}>
                    Para que tengas una mejor experiencia, solo puedes tener una única pestaña.
                    Cierra esta pestaña y ve a tu sesión activa en otra
                    pestaña o refresca esta pestaña para convertirla en la principal.
                </div>

                <span 
                    style={{ 
                        marginTop: "20px",
                        border: "2.5px solid #545454", 
                        background: 'transparent', 
                        padding: '0.5em 1.7em', 
                        borderRadius: '1.5em' ,
                        fontWeight: '600',
                        color: '#545454',
                        letterSpacing: "0.02em",
                        cursor: "pointer"
                    }}
                    onClick={(e) => history.go(location.href)}
                >
                    HACER ESTÁ MI PESTAÑA ACTIVA
                </span>
            </div>
        </div>
    )
}

export default NotCurrent;