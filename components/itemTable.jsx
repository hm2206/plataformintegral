import React, { Fragment } from 'react';
import ItemFileCircle from './itemFileCircle';
import moment from 'moment';
import Show from './show';


const datos = {
    VERDE: 'badge badge-success',
    AMARILLO: 'badge badge-warning',
    ROJO: 'badge badge-danger'
};


const templateButton = {
    key: "",
    title: "",
    icon: "",
    className: ""
}


const ItemTable = ({ current = true, 
    slug, 
    title, 
    files = [], 
    document_type,
    document_number, 
    lugar, 
    fecha, 
    day,
    semaforo,
    status, 
    statusClassName, 
    onClickItem = null, 
    onClickFile = null,
    noRead = true,
    buttons = [templateButton],
    onButton = null,
}) => {

    const handleClick = (onClick, ...args) => {
        if (typeof onClick == 'function') onClick(...args)
    }

    // obtener color del semaforo
    const getSemaforo = () => datos[semaforo] || {};

    // render
    return (
        <Fragment>
            <tr className={`table-select table-item ${current ? '' : 'disabled'}`} style={{ background: noRead ? 'rgba(0, 255, 0, 0.05)' : 'transparent' }}>
                <th width="10%" onClick={(e) => handleClick(onClickItem, e)} rowSpan={files && files.length ? '2' : '1'}>
                    <span className="badge badge-dark font-13">
                        {slug || ""}
                    </span>
                </th>
                <td width="45px" style={{ wordWrap: "break-word" }}>
                    <div className="cursor-pointer" style={{ minWidth: "250", maxWidth: "350px", wordWrap: "break-word" }}  onClick={(e) => handleClick(onClickItem, e)}>
                        <b>{title || ""}</b>
                    </div>
                </td>
                <th width="15%" onClick={(e) => handleClick(onClickItem, e)}>
                    <span className="capitalize">{document_type || ""}</span>
                </th>
                <th width="15%" onClick={(e) => handleClick(onClickItem, e)}>
                    <span className="capitalize">{document_number || ""}</span>
                </th>
                <th width="20%" onClick={(e) => handleClick(onClickItem, e)}>
                    <span className="capitalize">
                        {lugar || ""}
                    </span>
                </th>
                <th width="15%" className="font-10" onClick={(e) => handleClick(onClickItem, e)}>
                    {fecha ? moment(fecha).format('DD/MM/YYYY hh:ss a') : ''}
                </th>
                <td width="5%" className="text-center" onClick={(e) => handleClick(onClickItem, e)}>
                    <span className={`uppercase badge ${statusClassName}`}>{status}</span>
                </td>
                <td width="5%" className="text-center" onClick={(e) => handleClick(onClickItem, e)}>
                    <span className={`uppercase badge ${getSemaforo()}`}>{day}</span>
                </td>
                <td className="text-center">
                    <div className="btn-group text-center">
                        {buttons.map((b, indexB) => 
                            <button className={`btn btn-sm btn-light ${b.className || ""}`}
                                key={`list-btn-${indexB}`}
                                title={b.title || ""}
                                onClick={(e) => typeof onButton == 'function' ? onButton(e, indexB, b) : null}
                            >
                                <i className={b.icon}></i>
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {/* mostrar archivos */}
            <Show condicion={files && files.length}>
                <tr className={`${current ? '' : 'disabled'}`} style={{ background: noRead ? 'rgba(0, 255, 0, 0.05)' : 'transparent' }}>
                    <td colSpan="8" style={{ border: '0px' }}>
                        <div className="row">
                            {files.map((f, indexF) => 
                                <div className="col-xs" key={`item-tramite-${indexF}`}>
                                    <ItemFileCircle
                                        id={f.id}
                                        url={f.url}
                                        is_observation={f.observation}
                                        name={f.name}
                                        extname={f.extname}
                                        onClick={(e) => handleClick(onClickFile, e, f)}
                                    />
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            </Show>
        </Fragment>
    );
}

// exportar
export default ItemTable;