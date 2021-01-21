import React, { useState } from 'react';
import CardInfoTramite from './cardInfoTramite';

const RenderShow = ({ tracking = {} }) => {

    // obtener trámite
    const current_tramite = tracking.tramite || {};

    // estados
    const [current_qr, setCurrentQr] = useState("http://127.0.0.1:3333/find_file_local?path=/user/img/perfil_admin@unia.jpg&size=50x50");

    // render
    return (
        <div className="card mt-3">
            <div className="card-header">
                <span className="badge badge-dark">
                    {current_tramite.slug || ""}
                </span>
                <i className="fas fa-arrow-right ml-1 mr-1"></i>
                {current_tramite.asunto || ""}
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-10">
                        <CardInfoTramite
                            image={current_tramite.person && current_tramite.person.image_images && current_tramite.person.image_images.image_200x200 || ""}
                            remitente={current_tramite.person && current_tramite.person.fullname || ""}
                            email={current_tramite.person && current_tramite.person.email_contact || ""}
                            dependencia={current_tramite.dependencia_origen && current_tramite.dependencia_origen.nombre || ""}
                            status={tracking.first ? tracking.status : ''}
                            revisado={tracking.revisado}
                        />
                    </div>

                    <div className="col-md-2">
                        <img src={current_qr} alt="code_qr"
                            style={{ width: "100%", height: "100%", objectFit: 'contain' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// exportar
export default RenderShow;