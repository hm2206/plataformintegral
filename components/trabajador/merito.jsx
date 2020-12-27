import React, { useState, useContext } from 'react';

const Merito = ({ work }) => {

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5>Listado de Méritos/Desméritos</h5>
            <hr/>
        </div>
        <div className="col-md-6">
            <div className="card">
                <div className="card-header">
                    Planilla: Normal
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-10"></div>
                        <div className="col-md-2 text-right">
                            <div className="btn-group">
                                <button className="btn btn-sm btn-primary">
                                    <i className="fas fa-edit"></i>
                                </button>

                                <button className="btn btn-sm btn-red">
                                    <i className="fas fa-file-pdf"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

// export 
export default Merito;