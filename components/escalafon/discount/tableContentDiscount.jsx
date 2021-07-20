import React, { useState } from 'react';
import Show from '../../show';

const TableContentDiscount = () => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    
    return (
        <div className="table-responsive">
            <table className="table-excel font-12">
                <thead>
                    <tr>
                        <th width="70%" className="text-center no-wrap">DONDE:</th>
                        <th width="30%" className="text-center no-wrap">N° TRAB</th>
                    </tr>
                </thead>
                <tbody>
                    <Show condicion={!current_loading && !datos.length}>
                        <tr>
                            <th colSpan="2" className="text-center font-13">No hay regístros disponibles</th>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>
    )
}

export default TableContentDiscount;