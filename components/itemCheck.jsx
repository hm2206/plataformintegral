import React from 'react';
import Show from './show';

const ItemCheck = ({ disabled = false, title = '', info = '', image = '', checked = false, classNameTitle = '', onClick = null }) => {

    // render
    return (
        <span className={`media mb-2 text-ellipsis ${disabled ? 'disabled' : 'cursor-pointer'}`}
            onClick={(e) => !disabled && typeof onClick == 'function' ? onClick(e) : null}
        >
            <span className="mr-2">
                <Show condicion={checked}>
                    <i className="fas fa-check mr-2 text-primary"></i>
                </Show>
                <span className="user-avatar">
                    <img src={image || ''} alt="imagen"/>
                </span>
            </span> 
            <span className="media-body"><span className={classNameTitle}>{title || ''}</span><br/>
                <span className="text-muted">{info || ''}</span>
            </span>
        </span>
    )
} 

export default ItemCheck;