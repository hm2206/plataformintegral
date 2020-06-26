import React, { Component } from 'react';


export default class LoaderPage extends Component
{

    render() {
        return <div style={{ position: 'fixed', top: '0px', left: '0px', width: "100%", height: "100%", fontFamily: "arial" }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width:"100%", height: "100%" }}>
                <img src="/img/loading_page.png" alt="soporte"/>
            </div>
        </div>
    }

}