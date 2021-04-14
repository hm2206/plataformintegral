import React, { useContext } from 'react';
import Show from './show';

const defaultItem = {
    id: "id",
    title: 'Example',
    info: 'details',
    description: '12/21/2018 – 12:42 PM',
    check: false,
    classNameTitle: null,
    _delete: true,
};

const CardReflow = ({ 
    title = 'Title', info = 'Info', 
    start = 0, over = 0, prefix = '',
    items = [defaultItem],
    onDelete = null, onRefresh = null
}) => {


    // render
    return (
        <div className="card card-reflow">
            <div className="card-body">
                <h4 className="card-title"> {title || ''} </h4>
                <div className="progress progress-sm rounded-0 mb-1">
                    <Show condicion={over}>
                        <div className="progress-bar bg-success" style={{ width: `${(start * 100) / over}%` }}></div>
                    </Show>
                </div>
                <p className="text-muted text-weight-bolder small"> {prefix}{start} de {prefix}{over} </p>
            </div>

            <div className="card-body border-top">
                <h4 className="card-title"> 
                    {info || ''} 
                    <span className="close cursor-pointer" onClick={(e) => typeof onRefresh == 'function' ? onRefresh(e) : null}>
                        <i className="fas fa-sync"></i>
                    </span>
                </h4>
                {/* <!-- .timeline --> */}
                <ul className="timeline timeline-dashed-line">
                    <Show condicion={items.length}
                        predeterminado={
                            <div className="text-muted text-center font-12">
                                No hay registros
                            </div>
                        }
                    >
                        {items.map((i, indexI) => 
                            <li className="timeline-item" key={`list-card-reflow-${indexI}`}>
                                {/* <!-- .timeline-figure --> */}
                                <div className="timeline-figure">
                                    <span className={`tile tile-circle tile-xs ${i.check ? 'bg-success' : ''}`}>
                                        <Show condicion={i.check}>
                                            <i className="fa fa-check"></i>
                                        </Show>
                                    </span>
                                </div>
                                {/* <!-- .timeline-body --> */}
                                <div className="timeline-body">
                                    <h6 className="timeline-heading"> 
                                        <span className={i.classNameTitle || ""}>{i.title}</span> <a href="#" className="text-muted"><small>{i.info}</small></a>
                                    </h6>
                                    <span className="timeline-date">{i.description}</span>
                                </div>
                                <Show condicion={typeof onDelete == 'function' && i._delete}>
                                    <button className="close"
                                        onClick={(e) => typeof onDelete == 'function' ? onDelete(indexI, i) : null}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </Show>
                            </li>
                        )}
                    </Show>    
                </ul>
            </div>
        </div>
    )
}

// exportar
export default CardReflow;