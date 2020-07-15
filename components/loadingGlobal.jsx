import React, { Component } from 'react';

export default class LoadingGlobal extends Component
{

    render() {

        let { display } = this.props;

        return (
            <div style={{
                width: "100%", 
                height: "100%", 
                background: 'rgba(255, 255, 255, 0.8)', 
                position: 'fixed', 
                top: '0px', 
                left: '0px',
                zIndex: '99999',
                display
            }} id="loading-brand">
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/img/loading_page.png" alt="loader" className="loading-brand"/>
                </div>
            </div>
        )
    }

}