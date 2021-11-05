import React from 'react'
import ItemCard from './itemCard'
import WorkConfig from './config/workConfig'
import BallotConfig from './config/ballotConfig'
import LicenseConfig from './config/licenseConfig'
import VacationConfig from './config/vacationConfig'
import InfoConfig from './config/infoConfig'
import OnomasticoConfig from './config/onomasticoConfig'
import ScheduleConfig from './config/scheduleConfig'

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
            config: <VacationConfig {...props}/>
        },
        { 
            type: "lic",
            title: "Licencias/Permisos", 
            icon: "fas fa-id-badge",
            config: <LicenseConfig {...props}/>
        },
        { 
            type: "pap",
            title: "Papeletas", 
            icon: "fas fa-file-alt",
            config: <BallotConfig {...props}/>
        },
        { 
            type: "tra",
            title: "Trabajadores Activos", 
            icon: "fas fa-praying-hands",
            config: <WorkConfig {...props}/>
        },
        {
            type: "info",
            title: "Fecha de Cese",
            icon: "fas fa-calendar",
            config: <InfoConfig {...props}/>
        },
        {
            type: "onomastico",
            title: "Onomástico",
            icon: "fas fa-birthday-cake",
            config: <OnomasticoConfig {...props}/>
        },
        {
            type: "schedules",
            title: "Asistencia",
            icon: "fas fa-clipboard-list",
            config: <ScheduleConfig {...props}/>
        }
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