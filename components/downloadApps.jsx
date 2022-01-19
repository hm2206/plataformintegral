import React, { Component } from 'react'
import Modal from './modal';
import{ Feed } from 'semantic-ui-react';

const apps = [];

export default class DownloadApps extends Component
{

    state = {
        loader: false,
        people: {
            data: []
        },
        query_search: ""
        
    }

    render() {

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-box"></i> Lista de Apps</span>}
            >
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
            </Modal>
        );
    }

}