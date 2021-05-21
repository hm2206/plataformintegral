import React from 'react';
import moment from 'moment';
moment.locale('es');

const typeStatus = {
    ENTRY: {
        text: "Entrada",
        className: "badge badge-primary"
    },
    EXIT: {
        text: "Salida",
        className: "badge badge-danger"
    }
}

const ItemAssistance = ({ assistance = {} }) => {

    const current_status = typeStatus[assistance.status] || {};

    // render
    return (
        <tr>
            <td>{assistance.id}</td>
            <td className="capitalize">{assistance?.person?.fullname}</td>
            <td className="text-center">
                <span className="badge badge-dark"> 
                    <i className="fas fa-clock mr-1"></i>
                    {assistance.record_time}
                </span>
            </td>
            <td className="text-center">
                <span className={current_status.className}>
                    {current_status.text}
                </span>
            </td>
        </tr>
    )
}

export default ItemAssistance;