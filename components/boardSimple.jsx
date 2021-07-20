import React from 'react';
import { Fragment } from 'react';
import Show from './show';

const optionDefault = {
    key: 'example',
    title: 'Example',
    icon: 'fas fa-file-alt',
    className: ''
}

const BoardSimple = ({ 
    children = null, onClick = null,
    title = "Cabezera", prefix = "C", 
    image = "", bg = "pink", 
    info = ['Información'], addUser = false ,
    expand = false, config = false,
    options = [optionDefault], onOption = null,
    classNameInfo = null,
}) => {

    // render
    return (
        <Fragment>
            <header className="page-navs shadow-sm pr-3">
                {/* <!-- .btn-account --> */}
                <a href="" className="btn-account"
                    onClick={(e) => {
                        e.preventDefault();
                        if (typeof  onClick == 'function') onClick(e)
                    }}
                >
                    <div className="has-badge">
                        <span className={`tile bg-${bg} text-white`}>{prefix || ""}</span> 
                        <span className={image ? 'user-avatar user-avatar-xs' : ''}>
                            <Show condicion={image}>
                                <img src={image} alt="imagen"/>
                            </Show>
                        </span>
                    </div>
                    <div className="account-summary">
                        <h1 className="card-title">{title || ""}</h1>
                        <h6 className={`card-subtitle text-muted ${classNameInfo}`}>{info.join(' . ')}</h6>
                    </div>
                </a> 
                {/* <!-- right actions --> */}
                <div className="ml-auto">
                    {/* <!-- invite members --> */}
                    <Show condicion={addUser}>
                        <div className="dropdown d-inline-block">
                            <button type="button" 
                                className="btn btn-light btn-icon" 
                                title="Invite members" 
                                data-toggle="dropdown" 
                                data-display="static" 
                                aria-haspopup="true" 
                                aria-expanded="false"
                            >
                                <i className="fas fa-user-plus"></i>
                            </button>
                            <div className="dropdown-menu dropdown-menu-right dropdown-menu-rich stop-propagation">
                                <div className="dropdown-arrow"></div>
                                <div className="dropdown-header"> Add miembros </div>
                                <div className="form-group px-3 py-2 m-0">
                                    <input type="text" 
                                        className="form-control" 
                                        placeholder="e.g. @bent10" 
                                        data-toggle="tribute" 
                                        data-remote="assets/data/tribute.json" 
                                        data-menu-container="#people-list" 
                                        data-item-template="true" 
                                        data-autofocus="true" 
                                        data-tribute="true"
                                    /> 
                                    <small className="form-text text-muted">Search people by username or email address to invite them.</small>
                                </div>
                                <div id="people-list" className="tribute-inline stop-propagation"></div>
                                <a href="#" className="dropdown-footer">
                                    Invite member by link <i className="far fa-clone"></i>
                                </a>
                            </div>
                        </div>
                    </Show>

                    {/* options */}
                    <Show condicion={options.length}>
                        {options.map((o, indexO) => 
                            <button type="button"
                                key={`listar-option-${indexO}`}
                                className={`btn btn-light btn-icon font-13 ${o.className || ''}`} 
                                title={o.title || ""}
                                onClick={(e) => typeof onOption == 'function' ? onOption(e, indexO, o) : null}
                            >
                                <i className={o.icon || ""}></i>
                            </button>    
                        )}
                    </Show>
                    
                    <Show condicion={expand}>
                        <button type="button" 
                            className="btn btn-light btn-icon font-13" 
                            data-toggle="page-expander" 
                            title="Expand board"
                        >
                            <i className="oi oi-fullscreen-enter fa-rotate-90 fa-fw"></i>
                        </button> 
                    </Show>
                    
                    <Show condicion={config}>
                        <button type="button" 
                            className={`btn btn-light btn-icon font-13`} 
                            data-toggle="modal" 
                            data-target="#modalBoardConfig" 
                            title="Show menu"
                        >
                            <i className="fa fa-cog fa-fw"></i>
                        </button>
                    </Show>
                </div>
                {/* modal de configuración */}
                {/* <ModalBoardConfig/> */}
            </header>
            <div style={{ minHeight: '100vh', maxHeight: 'auto' }}>
                {children || null}
            </div>
        </Fragment>
    )
}

// exportar
export default BoardSimple;