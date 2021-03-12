import React, { useContext } from 'react';
import { AppContext } from '../contexts';

const AppIconCube = ({ className = null }) => {
    
    const { app } = useContext(AppContext); 

    // render
    return (
        <img src={app.icon_images && app.icon_images.icon_200x200 || app.icon} 
            alt="icon-app" 
            className={className}
            style={{  
                width: "75px", 
                height: "75px",
                borderRadius: "0.7em", 
                border: "4px solid rgb(255, 255, 255)", 
                boxShadow: "rgba(0, 0, 0, 0.15) 10px 10px",
                objectFit: "contain", 
                background: "rgb(52, 108, 176)", 
                padding: "0.35em"
            }}
        />
    )
}

export default AppIconCube;