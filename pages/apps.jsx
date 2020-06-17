import React , { Component } from 'react';
import { Feed } from 'semantic-ui-react';
import { apps } from '../env.json';
import Link from 'next/link'
import { GUEST } from '../services/auth';

export default class Apps extends Component {

    static getInitialProps = async (ctx) => {
        await GUEST(ctx);
        let { query, pathname } = ctx;
        return { query, pathname }
    }

    render() {
        return (
            <div className="col-md-12 pt-3" style={{ background: "rgba(0,0,0,.05)", minHeight: '100vh' }}>
                <Link  href="/login">
                    <a><i className="fas fa-arrow-left"></i> Volver al Login</a>
                </Link>
                <h3 className="text-center"><i className="fas fa-box"></i> Lista de Apps</h3>
                <div className="card-body pt-5">
                    <div className="row mt-5 pl-5 pr-5 justify-content-center">
                        <div className="col-md-7">
                            <div className="row justify-content-center">
                                {apps && apps.map(a => 
                                    <a className="col-md-6" href={a.url} target="_blank">
                                        <Feed className="card-body">
                                            <Feed.Event>
                                                <Feed.Label image={a.image} />
                                                <Feed.Content>
                                                    <Feed.Date content={a.type} />
                                                    <Feed.Summary>
                                                        {a.name}
                                                    </Feed.Summary>
                                                </Feed.Content>
                                            </Feed.Event>
                                        </Feed>
                                    </a>    
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}