import React from 'react';

const ItemCard = ({ icon = "", title = "", type, onClick = null, active = false, disabled = false }) => {

    const handleClick = (e, type) => typeof onClick == 'function' ? onClick(e, type) : null;

    return (
        <div className={`card cursor-pointer ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`} 
            onClick={(e) => handleClick(e, type)}
        >
            <div className="card-body">
                <div className="text-center pt-4" style={{ fontSize: "24px" }}>
                    <i className={icon}></i>
                </div>
                <h5 className="text-center">{title}</h5>
            </div>
        </div>
    )
}

export default ItemCard;