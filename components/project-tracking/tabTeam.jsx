import React, { Fragment } from 'react';
import { Button } from 'semantic-ui-react';

const TabTeam = () => {

    return (
    <Fragment>
        <div className="table-responsive">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center">Apellidos y Nombres</th>
                        <th className="text-center">N° Documento</th>
                        <th className="text-center">Rol</th>
                        <th className="text-center">Profesión</th>
                        <th width="5%">
                            <Button fluid basic color="green">
                                <i className="fas fa-plus"></i>
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="5" className="text-center">No hay registros disponibles</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Fragment>)
}

export default TabTeam;