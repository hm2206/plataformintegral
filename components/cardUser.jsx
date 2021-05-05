import React from 'react';
import Show from './show';

const CardUser = ({ image, online, name, username }) => {

    // render
    return (
        <div className="card mb-2">
            {/* <!-- .card-body --> */}
            <div className="card-body">
                {/* <!-- grid row --> */}
                <div className="row align-items-center">
                    {/* <!-- grid column --> */}
                    <div className="col-auto">
                        <a href="#" className="user-avatar user-avatar-lg">
                            <img src={`${image}`}/> 
                            <Show condicion={typeof online == 'boolean'}>
                                <span className={`avatar-badge ${online ? 'online' : 'offline'}`}></span>
                            </Show>
                        </a>
                    </div>
                    {/* <!-- grid column --> */}
                    <div className="col">
                        <h3 className="card-title capitalize text-ellipsis">
                            <a href="#">{name}</a>
                        </h3>
                        <h6 className="card-subtitle text-muted"> {username} </h6>
                    </div>
                    {/* <!-- /grid column --> */}
                    <div className="col-auto">
                        {/* <button type="button" className="btn btn-icon btn-secondary mr-1">
                            <i className="far fa-comment-alt"></i>
                        </button>
                        <div className="dropdown d-inline-block">
                            <button className="btn btn-icon btn-secondary">
                                <i className="fa fa-fw fa-ellipsis-h"></i>
                            </button>
                            <div className="dropdown-menu dropdown-menu-right">
                                <div className="dropdown-arrow"></div>
                                <button type="button" className="dropdown-item">Invite to a team</button> 
                                <button type="button" className="dropdown-item">Copy member ID</button>
                                <div className="dropdown-divider"></div>
                                <button type="button" className="dropdown-item">Remove</button>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardUser;