import React, { Component } from 'react';


export default class Error extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    render() {
        return (
            <div>
                No se encontró el recurso
            </div>
        )
    }

}