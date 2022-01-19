import React, { Component, Fragment } from 'react';
import Head from 'next/head'
import Router from 'next/router';


export default class Error extends Component
{

    render() {
        return (
            <Fragment>
                <Head>
                    <title>Integración | No Autorizado</title>
                </Head>

                <div className="col-md-12">
                    <div className="empty-state">
                        <div className="empty-state-container">
                            <div className="state-figure">
                                <img className="img-fluid" src="/img/not-authorize.png" alt="" style={{ maxWidth: "320px" }}/>
                            </div>
                            <h3 className="state-header"> Usted no está autorizado </h3>
                            <p className="state-description lead text-muted"> usted no puede ingresar o realizar la siguiente acción </p>
                            <div className="state-action">
                                <a href="#" className="btn btn-lg btn-light" onClick={(e) => {
                                    e.preventDefault();
                                    Router.back();
                                }}><i className="fa fa-angle-left"></i> Volver</a>
                            </div>
                        </div>
                    </div>
                </div>   
            </Fragment>
        )
    }

}