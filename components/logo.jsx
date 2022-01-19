import React, { useContext } from 'react';
import { AppContext } from '../contexts';

const Logo = () => {

    // app context
    const { app } = useContext(AppContext);

    // render
    return (
        <h3>
            <img src={app?.icon_images?.icon_50x50} alt={app?.name} style={{ width: "30px", marginRight: "0.3em", borderRadius: '0.2em' }}/>
            {app.name || "Integración"}
        </h3>
    );
}

export default Logo;