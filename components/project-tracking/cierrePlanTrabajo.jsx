import React, { useState, useContext, useEffect } from 'react';

const CierrePlanTrabajo = () => {

    // render
    return (
        <div className="table-responsive">
            <ol type="I">
                <li>Datos Generales del Proyecto de Investigación
                    <ul style={{ textDecoration: 'none' }}>
                        <li>1.1. Área y línea de investigación.</li>
                        <li>1.2. Resolución de aprobación del proyecto.</li>
                        <li>1.3. Duración del proyecto.</li>
                        <li>1.4. Costo del proyecto.</li>
                        <li>1.5. Datos del investigador responsable.</li>
                        <li>1.6. Datos de la(s) institución (es) cooperante(s).</li>
                    </ul>
                </li>
                <li>Equipo técnico que ha participado</li>
                <li>Escuelas involucradas y beneficiadas</li>
                <li>Objectivos de Proyecto.</li>
                <li>Resultados alcanzados</li>
                <li>Exposición de motivos de cierre por fuerza mayor o por mala gestión</li>
                <li>Informe financiero del proyecto</li>
                <li>Adquisición de bienes duraderos, ubicación actual y destino final de uso.</li>
                <li>Lecciones aprendidas y recomendaciones</li>
                <li>Anexos</li>
            </ol>
        </div>
    )
}

// exportar
export default CierrePlanTrabajo;