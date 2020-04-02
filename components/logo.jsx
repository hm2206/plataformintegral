import React, { Component } from 'react';
import { app } from '../env.json'; 

export default class Logo extends Component
{

    render() {
        return (
            <h3>
                <img src={app.logo} alt={app.descripcion} style={{ width: "30px", marginRight: "0.3em", borderRadius: '0.2em' }}/>
                {app.name}
            </h3>
        );
    }

}