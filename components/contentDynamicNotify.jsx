import React from 'react';
import VerifySignerGroup from './notifiable/verifySignerGroup';
import SignedAllPage from './notifiable/signedAllPage';

const Content = ({ type, notification, config }) => {

    switch (type) {
        case "Auth/TeamController.store":
            return <VerifySignerGroup notification={notification} config={config}/>
        case "Auth/SignerController.signer":
            return <SignedAllPage notification={notification} config={config}/>;
        default:
            return <div className="card-body">No se encontró una acción</div>;
    }
}

const ContentDynamicNotify = ({ notification }) => {
    
    // config
    let options = {
        headers: { NotificationId: notification.id }
    }

    // render
    return <Content type={notification?.method?.name} notification={notification} config={options}/>;
}

export default ContentDynamicNotify;