import React, { Component } from 'react';
import { app } from '../env.json'; 

export default class Logo extends Component
{

    render() {

        let { my_app } = this.props;

        return (
            <h3>
                <img src={my_app && my_app.icon} alt={my_app.name} style={{ width: "30px", marginRight: "0.3em", borderRadius: '0.2em' }}/>
                {app.name}
            </h3>
        );
    }

}