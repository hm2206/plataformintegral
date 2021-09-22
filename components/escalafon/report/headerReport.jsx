import React from 'react'
import ItemCard from './itemCard'
import WorkConfig from './config/workConfig'

const HeaderReport = ({ block = false, activeType = "", onClick = null, setFile = null, setBlock = null }) => {

    let props = { 
        setFile,
        setBlock,
        block,
    }

    const data = [
        { 
            type: "vac",
            title: "Vacaciones", 
            icon: "fas fa-suitcase",
            config: null
        },
        { 
            type: "lic",
            title: "Licencias/Permisos", 
            icon: "fas fa-id-badge",
            config: <div></div>
        },
        { 
            type: "pap",
            title: "Papeletas", 
            icon: "fas fa-file-alt",
            config: <div></div>
        },
        { 
            type: "hon",
            title: "Honomástico", 
            icon: "fas fa-birthday-cake",
            config: <div></div>
        },
        { 
            type: "tra",
            title: "Trabajadores Activos", 
            icon: "fas fa-praying-hands",
            config: <WorkConfig {...props}/>
        },
        
    ]

    const handleClick = (e, data) => typeof onClick == 'function' ? onClick(e, data) : null;
    
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-file"></i> Tipos de Reportes
            </div>
            <div className="card-body">
                <div className="row">
                    {data.map((d, indexD) => 
                        <div className="col-md-3">
                            <ItemCard key={`item-report-${indexD}`}
                                active={d.type === activeType}
                                disabled={block}
                                title={d?.title}
                                icon={d?.icon}
                                onClick={(e) => !block ? handleClick(e, d) : null}
                            />
                        </div>    
                    )}
                </div>
            </div>
        </div>
    )
}

export default HeaderReport;