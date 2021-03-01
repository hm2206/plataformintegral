import React, { Component } from 'react';
import Router from 'next/router';


const LoaderPage = ({ message }) => {

    // recargar página
    const reloadPage = () => {
        let { push } = Router;
        push(location.href);
    }

    // render
    return (
        <div class="empty-state">
            {/* <!-- .empty-state-container --> */}
            <div class="empty-state-container">
                {/* <!-- .card --> */}
                <div class="card border border-primary">
                    {/* <!-- .card-body --> */}
                    <div class="card-body">
                        <div class="state-figure">
                            <img class="img-fluid w-75" src="/img/mantenimiento.png" alt=""/>
                        </div>
                        <h3 class="state-header"> Estamos trabajando en algunas actualizaciones </h3>
                        <p class="state-description"> {message} </p>
                        <div className="text-center">
                            <button className="btn btn-primary"
                                onClick={reloadPage}
                            >
                                Volver a cargar 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoaderPage;