import React, { useContext } from 'react';
import { SignatureContext } from '../../../contexts/SignatureContext';
import ProgressFile from '../../progressFile';

const FindGroup = () => {

    // signature
    const app_signature = useContext(SignatureContext);

    // render
    return (
        <div className="row">

            <div className="col-md-12">
                <hr/>
            </div>

            <div className="col-md-3 text-ellipsis">
                <div className="card card-body">
                    <a href="#" className="font-16 text-ellipsis"
                        title={app_signature.group && app_signature.group.title || ""}
                        onClick={(e) => {
                            e.preventDefault();
                            app_signature.setTab('LIST');
                        }}
                    >
                        <b>../</b> <i className="fas fa-folder-open"></i> 
                        <span className="font-12 ml-2">{app_signature.group && app_signature.group.title || ""}</span>
                    </a>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card card-body">
                    <a href="#" className="text-dark">
                        <i className="fas fa-cogs"></i> Configurar firma
                    </a>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card card-body">
                    <a href="#" className="text-dark">
                        <i className="fas fa-cogs"></i> Configurar firma
                    </a>
                </div>
            </div>

            <div className="col-md-3">
                
            </div>
        </div>
    );
}

// exportar
export default FindGroup;