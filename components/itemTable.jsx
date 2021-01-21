import React from 'react';
import ItemFileCircle from './itemFileCircle';
import moment from 'moment';

const ItemTable = ({ current = true, slug, title, files = [], remitente, lugar, fecha, status, statusClassName, onClickItem = null, onClickFile = null }) => {

    const handleClick = (onClick, ...args) => {
        if (typeof onClick == 'function') onClick(...args)
    }

    // render
    return (
        <tr className={`table-select table-item ${current ? '' : 'disabled'}`}>
            <th width="10%" onClick={(e) => handleClick(onClickItem, e)}>
                <span className="badge badge-dark font-13">
                    {slug || ""}
                </span>
            </th>
            <td>
                <div className="text-ellipsis cursor-pointer" onClick={(e) => handleClick(onClickItem, e)}>
                    <b>{title || ""}</b>
                </div>
                <div className="row">
                    {files.map((f, indexF) => 
                        <div className="col-xs">
                            <ItemFileCircle
                                key={`item-tramite-${indexF}`}
                                id={f.id}
                                url={f.url}
                                is_observation={f.observation ? true : false}
                                name={f.name}
                                extname={f.extname}
                                onClick={(e) => handleClick(onClickFile, e, f)}
                            />
                        </div>
                    )}
                </div>
            </td>
            <th width="20%" onClick={(e) => handleClick(onClickItem, e)} className="lowercase">
                <span className="capitalize">{remitente || ""}</span>
            </th>
            <th width="20%" onClick={(e) => handleClick(onClickItem, e)} className="lowercase">
                <span className="capitalize">
                    {lugar || ""}
                </span>
            </th>
            <th width="15%" onClick={(e) => handleClick(onClickItem, e)}>
                {fecha ? moment(fecha).format('DD/MM/YYYY hh:ss a') : ''}
            </th>
            <th width="5%" onClick={(e) => handleClick(onClickItem, e)}>
                <span className={`uppercase badge ${statusClassName}`}>{status}</span>
            </th>
        </tr>
    );
}

// exportar
export default ItemTable;