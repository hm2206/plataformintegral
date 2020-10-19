import React, { Component } from 'react';

export default class LoadingGlobal extends Component
{

    render() {

        let { display, id, app } = this.props;

        return (
            <div style={{
                width: "100%", 
                height: "100%", 
                background: 'rgba(255, 255, 255, 0.8)', 
                position: 'fixed', 
                top: '0px', 
                left: '0px',
                zIndex: '5000',
                display: display ? display : 'block'
            }}  id={id ? id : 'id-loading-brand'}>
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={app && app.icon && app.icon_images && app.icon_images.icon_200x200 || '/img/loading_page.png'} 
                        alt="loader" className="loading-brand"
                        style={{ width: "150px", height: "150px", objectFit: 'contain' }}
                    />
                </div>
            </div>
        )
    }

}