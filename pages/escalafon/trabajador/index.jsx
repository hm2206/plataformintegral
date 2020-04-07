import React, { Component, Fragment } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';

export default class Index extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        return { pathname: ctx.pathname, query: ctx.query }
    }

    render() {
        return (
            <Fragment>

                <h4>Lista de Trabajadores</h4>

                <BtnFloat
                    onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Fragment>
        )
    }

}