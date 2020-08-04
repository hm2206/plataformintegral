import React, { Component } from 'react';
import { authentication } from '../services/apis';
import moment from 'moment'
import Show from '../components/show';
import {Skull } from '../components/Utils';


class CardToken  extends Component {


    state = {
        tokens: {
            data: [],
            page: 1,
            total: 0,
            lastPage: 1
        },
        loader: true
    }

    componentDidMount = () => {
        this.getTokens();
    }

    getTokens = async (page = 1, update = false) => {
        this.setState({ loader: true });
        let dom = document.getElementById('list-log');
        await authentication.get(`auth/tokens?page=${page}`)
        .then(res => {
            let { success, tokens, message } = res.data;
            if (!success) throw new Error(message);
            this.setState(state => {
                state.tokens.page = tokens.page || 1;
                state.tokens.lastPage = tokens.lastPage || 1;
                state.tokens.total = tokens.total || 0;
                state.tokens.data = [...state.tokens.data, ...tokens.data] || [];
                return { tokens: state.tokens }
            });
        }).catch(err => console.log(err.message));  
        this.setState({ loader: false });
        if (update) dom.scrollTo({ top: dom.scrollHeight });
    }

    render() {

        let { tokens, loader } = this.state;

        return (
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-clipboard-check"></i> Log de Sesiones ({tokens && tokens.total || 0})
                </div>

                <div className="card-body">
                    <div className="page-section">
                        {/* <!-- .section-block --> */}
                        <div className="section-block">
                            {/* <h2 className="section-title"> Today </h2> */}

                                <ul className="timeline" style={{ maxHeight: "750px", overflowY: "auto" }}
                                    id="list-log"
                                >
                                    {/* <!-- .timeline-item --> */}
                                    {tokens && tokens.data.map(t => 
                                        <li className="timeline-item" key={`log-token-${t.id}`}>
                                            {/* <!-- .timeline-figure --> */}
                                            <div className="timeline-figure">
                                                <span className="tile tile-circle tile-sm">
                                                    <i className={`fab fa-${t.device == 'Windows' ? 'windows' : ''}`}></i>
                                                    <i className={`fab fa-${t.device == 'Linux' ? 'linux' : ''}`}></i>
                                                    <i className={`fab fa-${t.device == 'Macintoch' ? 'apple' : ''}`}></i>
                                                    <i className={`fab fa-${t.device == 'Iphone' ? 'apple' : ''}`}></i>
                                                    <i className={`fab fa-${t.device == 'Android' ? 'android' : ''}`}></i>
                                                    <i className={`fas fa-${t.device == 'Unknow' ? 'question' : ''}`}></i>
                                                </span>
                                            </div>
                                            {/* <!-- .timeline-body --> */}
                                            <div className="timeline-body" style={{ borderBottom: '1px solid rgba(34,34,48,.1)' }}>
                                                {/* <!-- .media --> */}
                                                <div className="media">
                                                {/* <!-- .media-body --> */}
                                                    <div className="media-body">
                                                        <h6 className="timeline-heading">
                                                            <a href="#" className="text-link">{t.device}</a>
                                                        </h6>
                                                        <p className="mb-0">
                                                            <span className={`avatar-badge ${t.is_revoked ? 'offline' : 'online'}`} 
                                                                title={`${t.is_revoked == 1 ? 'offline' : 'online'}`}
                                                                style={{ bottom: '15px' }}
                                                            />
                                                            <a href="#">
                                                                Inició sessión desde la ip
                                                            </a> 
                                                            <b className="ml-3 badge badge-dark">{t.ip}</b> 
                                                        </p>
                                                        <p className="timeline-date d-sm-none">{moment(t.created_at, "YYYY/MM/DD HH:mm:ss").fromNow()}</p>
                                                    </div>
                                                    {/* <!-- .media-right --> */}
                                                    <div className="d-none d-sm-block">
                                                        <span className="timeline-date">{moment(t.created_at, "YYYY/MM/DD HH:mm:ss").fromNow()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>    
                                    )}
                                    <li style={{ listStyle: 'none' }}>
                                        <Show condicion={loader}>
                                            <Skull height="1em" radius="0.3em"/>
                                            <Skull height="3em" radius="0.3em"/>
                                            <Skull height="0.5em" radius="0.3em"/>
                                        </Show>
                                    </li>
                                </ul>

                        </div>
                        <div className="card-footer">
                            <div className="page-section">
                                <p className="text-center mt-3">
                                    <button type="button" 
                                        className="btn btn-light" 
                                        disabled={tokens && !tokens.lastPage > tokens.page || loader}
                                        onClick={(e) => this.getTokens(tokens.page + 1, true)}
                                    >
                                        <i className="fa fa-fw fa-angle-double-down"></i> Obtener más datos
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CardToken;