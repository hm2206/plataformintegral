import React from 'react';
import AppIconCube from '../components/appIconCube';


const NotFoundData = () => {

    // render
    return (
        <div className="w-100 h-100">
            <div className="row justify-content-center mt-5">
                <div className="col-6 mt-5">
                    <div className="empty-state-container-">
                        <div className="card">
                            <div className="card-header bg-light text-left">
                                <i className="fa fa-fw fa-circle text-red"></i> 
                                <i className="fa fa-fw fa-circle text-yellow"></i> 
                                <i className="fa fa-fw fa-circle text-teal"></i>
                            </div>
                            <div className="card-body">
                                {/* <h1 className="state-header display-1 font-weight-bold text-center">
                                    <span>4</span> 
                                    <i className="far fa-frown text-red"></i> 
                                    <span>4</span>
                                </h1> */}

                                <div className="text-center mt-4 mb-4">
                                    <AppIconCube/>
                                </div>
                                
                                <h2 className="text-center"> El regístro no está disponible </h2>
                                
                                <p className="state-description lead text-center">
                                    Es posible que el enlace esté roto o que se haya eliminado el regístro. <br/>
                                    Verifica que el enlace que quieres abrir es correcto.
                                </p>
                                
                                <div className="state-action text-center mt-5">
                                    <a href="" className="btn btn-lg btn-outline-primary">
                                        <i className="fas fa-sync mr-1"></i> Refrescar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFoundData;