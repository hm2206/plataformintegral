import React from 'react';
import VerifySignerGroup from './notifiable/verifySignerGroup';

const Content = ({ type, notification }) => {

    switch (type) {
        case "Auth/TeamController.store":
            return <VerifySignerGroup notification={notification}/>
        default:
            return <div className="card-body">No se encontró una acción</div>;
    }
}

const ContentDynamicNotify = ({ notification }) => {
    
    // render
    return <Content type={notification?.method?.name} notification={notification}/>;
}

export default ContentDynamicNotify;