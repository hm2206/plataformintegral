import React, { Component } from 'react';
import { AUTH, AUTHENTICATE } from '../services/auth';


export default class Index extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        return { 
            auth_token: AUTH(ctx)
        }
    }

    render() {
        return (
            <div>   
                Index
            </div>
        )
    }

}