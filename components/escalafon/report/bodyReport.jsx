import React, { useMemo } from 'react';
import Visualizador from '../../visualizador';
import Show from '../../show'

const NotFoundReport = () => (
    <div className="text-center text-muted">
        <i className="fas fa-info-circle"></i> Selecionar un tipo de Reporte 
        <br />  
        para mostrar la configuración personalizada
    </div>
)

const BodyReport = ({ reportType = {}, setFile = null, file = {}, setBlock = null }) => {

    const ComponentConfig = useMemo(() => {
        if (!reportType.config) return null;
        return reportType?.config;
    }, [reportType]);

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <i className="fas fa-cog"></i> Configurar Reporte
                </div>
                <div className="card-body">
                    {ComponentConfig || <NotFoundReport/>}
                </div>
            </div>
            {/* visualizador */}
            <Show condicion={file?.name}>
                <Visualizador
                    name={file?.name}
                    extname={file?.extname}
                    url={file?.url}
                    is_observation={false}
                    is_print
                    onClose={() => {
                        setFile({});
                        setBlock(false);
                    }}
                />
            </Show>
        </>
    )
}

export default BodyReport;