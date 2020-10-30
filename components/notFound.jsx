import React from 'react';


export default ({ message }) => {
    return (
        <div style={{ fontFamily: 'ProximaNova, sans-serif', paddingTop: "5em" }} className="text-center">
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', alignContent: 'center', flexDirection: 'column' }}>

                <div>
                    <i className="far fa-file" style={{ fontSize: "7em", color: "#545454" }}></i>
                </div>
                <h3 style={{ fontWeight: '400', fontSize: '1.7em', width: "100%", color: "#545454" }}>No se encontró registros</h3>
    
            </div>
        </div>
    )
}