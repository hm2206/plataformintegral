import React, { Component } from 'react';
import { AUTHENTICATE } from '../../services/auth';


export default class HelpSlug extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    render() {
        return (
            <div>Help slug</div>
        )
    }

}