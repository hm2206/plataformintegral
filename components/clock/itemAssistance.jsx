import React from 'react';
import moment from 'moment';
moment.locale('es');

const typeStatus = {
    ENTRY: {
        text: "Entrada"
    },
    EXIT: {
        text: "Salida"
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
                    {moment(assistance.record_time).format('HH:mm:ss')}
                </span>
            </td>
            <td className="text-center">
                <span className="badge badge-primary">
                    {current_status.text}
                </span>
            </td>
        </tr>
    )
}

export default ItemAssistance;