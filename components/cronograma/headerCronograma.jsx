import React from 'react';
import Show from '../show';

const HeaderCronograma = ({ cronograma = {} }) => {

    // render
    return (
        <span>
            Cronograma: 
            <span className={`ml-1 badge badge-${cronograma.remanente ? 'danger' : 'primary'}`}>
                Planilla {cronograma.remanente ? 'Remanente' : ''} 
                : {cronograma.planilla && cronograma.planilla.nombre || ""}
            </span>
            <i className="fas fa-arrow-right ml-2 mr-1"></i>
            <span className="ml-1 badge badge-dark">{cronograma.year || ""}</span>
            <span className="ml-1">/</span>
            <span className="ml-1 badge badge-dark">{cronograma.mes || ""}</span>
            <Show condicion={cronograma.adicional}>
                <i className="fas fa-arrow-right ml-2 mr-1"></i>
                <span className="badge badge-warning ml-1">
                    Adicional {cronograma.adicional}
                </span>
            </Show>
        </span>
    )
}

// exportar
export default HeaderCronograma;