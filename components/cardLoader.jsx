import React from 'react';
import { Loader } from 'semantic-ui-react';

const CardLoader = () => {

    // render
    return (
        <div
            style={{ 
                position: 'absolute', 
                top: '0px', 
                left: '0px', 
                zIndex: "20",
                width: "100%",
                height: "100%"
            }}
        >
            <div className="loader-app" style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: 'rgba(255, 255, 255, 0.5)' }}>
                <Loader active inline='centered' inverted/>
            </div>
        </div>
    )
}


export default CardLoader;