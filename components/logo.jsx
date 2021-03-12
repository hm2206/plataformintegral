import React, { useContext } from 'react';
import { AppContext } from '../contexts';

const Logo = () => {

    // app context
    const { app, env } = useContext(AppContext);

    // render
    return (
        <h3>
            <img src={app.icon && app.icon_images && app.icon_images.icon_50x50} alt={app.name} style={{ width: "30px", marginRight: "0.3em", borderRadius: '0.2em' }}/>
            {app.name || env.app.name || ""}
        </h3>
    );
}

export default Logo;