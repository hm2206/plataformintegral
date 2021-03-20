import React from 'react';
import moment from 'moment'
import Show from '../components/show';

const schemaNotify = [
    { key: "mark_as_read", text: "Marcar como leído" },
    { key: "mark_as_unread", text: "Marcar como no leído" }
];

const CardNotify = ({ username, title, date, description, icon, image, read = false, options = schemaNotify, onOption = null, actions = [] }) => {

    return (
        <div className={`list-group-item ${read ? '' : 'unread-important'}`}>
            {/* <!-- message figure --> */}
            <div className="list-group-item-figure">
                <span className="rating rating-sm mr-3">
                    
                </span>
                <Show condicion={image}>
                    <a href="#" className="user-avatar" style={{ objectFit: 'contain', width: "35px", height: "35px" }}>
                        <img src={image} alt="avatar"/>
                    </a> 
                </Show>

                <Show condicion={!image}>
                    <div className="notify-icon">
                        <i className={icon}></i>
                    </div>
                </Show>
            </div>
            {/* <!-- message body --> */}
            <div className="list-group-item-body pl-md-2">
                {/* <!-- grid row --> */}
                <div className="row">
                    {/* <!-- grid column --> */}
                    <div className="col-12 col-lg-3 d-none d-lg-block">
                        <h4 className="list-group-item-title text-truncate">
                            <a href="#">{username}</a>
                        </h4>
                        <p className="list-group-item-text"> {moment(date, "YYYY/MM/DD HH:mm:ss").fromNow()} </p>
                    </div>
                    {/* <!-- grid column --> */}
                    <div className="col-12 col-lg-9">
                        <h4 className="list-group-item-title text-truncate">
                            <a href="page-conversations.html">{title}</a>
                        </h4>
                        <p className="list-group-item-text text-truncate">{description}</p>
                        <div className="w-100 text-left">
                            <div className="btn-group mt-2 mb-2">
                                {actions.map((act, indexA) => 
                                    <a href={act.link} 
                                        key={`list-action-${indexA}-${act.key}`} 
                                        target="_blank" 
                                        className="btn btn-outline-dark"
                                    >
                                        {act.text}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* <!-- grid column --> */}
                    <div className="col-12 d-lg-none">
                         <p className="list-group-item-text">{moment(date, "YYYY/MM/DD HH:mm:ss").fromNow()}</p>
                    </div>
                </div>
            </div>
            {/* <!-- message actions --> */}
            <div className="list-group-item-figure">
                {/* <!-- .dropdown --> */}
                <div className="dropdown">
                    <button className="btn btn-sm btn-icon btn-secondary" data-toggle="dropdown" aria-expanded="false">
                        <i className="fa fa-ellipsis-h"></i>
                    </button> 
                    <div className="dropdown-menu dropdown-menu-right">
                        <div className="dropdown-arrow mr-n1"></div>
                        {options.map((opt, indexO) => 
                            <a href="#" className="dropdown-item" key={`list-notification-${indexO}-${opt.key}`}
                                onClick={(e) => typeof onOption == 'function' ? onOption(e, indexO, opt) : null}
                            >
                                {opt.text}
                            </a> 
                        )}
                    </div>
                </div>
            </div>                  
        </div>
    )
}

export default CardNotify;