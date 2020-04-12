import React, { Component, Fragment } from 'react';
import Head from 'next/head'
import { app } from '../env.json';


export default class Error extends Component
{

    static getInitialProps = ({ res, err }) => {
        const statusCode = res ? res.statusCode : err ? err.statusCode : 404
        return { statusCode }
    }

    render() {
        return (
            <Fragment>
                <Head>
                    <title>{app.name} | Error: Página no encontrada!</title>
                </Head>

                <div className="col-md-12">
                    <div className="empty-state">
                        <div className="empty-state-container">
                            <div className="state-figure">
                                <img className="img-fluid" src="/img/not-found.svg" alt="" style={{ maxWidth: "320px" }}/>
                            </div>
                            <h3 className="state-header"> Page Not found! </h3>
                            <p className="state-description lead text-muted"> Sorry, we've misplaced that URL or it's pointing to something that doesn't exist. </p>
                            <div className="state-action">
                                <a href="/" className="btn btn-lg btn-light"><i className="fa fa-angle-right"></i> Ir al inicio</a>
                            </div>
                        </div>
                    </div>
                </div>   
            </Fragment>
        )
    }

}