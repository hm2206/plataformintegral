import React, { useContext, useState, useEffect } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import CreateTramite from '../../../components/tramite/createTramite';
import Router from 'next/router';
import { backUrl } from '../../../services/utils';

const CreateTramiteInterno = () => {

    // volver atrás
    const handleBack = () => {
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname) });
    }

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    <BtnBack onClick={handleBack}/>
                    <span className="ml-2">Crear nueva bandeja</span>
                </div>
        
                <div className="card-body">
                    <CreateTramite verify={1}/>
                </div>
            </Body>
        </div>
    );
}

// server rendering
CreateTramiteInterno.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    // response
    return { query };
}

export default CreateTramiteInterno;