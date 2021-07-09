import React, { useEffect, useState } from 'react';
import Modal from '../../modal';
import { Select, Checkbox, Button } from 'semantic-ui-react';
import TrackingProvider from '../../../providers/tramite/TramiteProvider';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show';

const trackingProvider = new TrackingProvider();

const PlaceholderItem = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(d => 
        <tr>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>    
    )
}

const ItemTracking = ({ tracking }) => {

    const [form, setForm] = useState({});
    const [edit, setEdit] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);

    useEffect(() => {
        if (!edit) setForm(Object.assign({}, tracking));
    }, [edit]);

    return (
        <tr>
            <td className="capitalize">{tracking?.dependencia?.nombre || ""}</td>
            <td className="capitalize">{tracking?.person?.fullname || ""}</td>
            <td className="text-center">
                <Checkbox toggle
                    name="visible"
                    checked={form?.visible ? true : false}
                    disabled={!edit || current_loading}
                />
            </td>
            <td className="text-center">
                {form?.current ? <span className="badge badge-primary">SI</span> : null}
            </td>
            <td>
                <Select name="modo"
                    placeholder="Seleccionar Modo"
                    options={[
                        { key: "DEPENDENCIA", value: "DEPENDENCIA", text: "Dependencia" },
                        { key: "YO", value: "YO", text: "Yo" }
                    ]}
                    disabled={!edit || current_loading}
                    value={form?.modo || ""}
                />
            </td>
            <td className="text-center">
                <Checkbox toggle
                    name="archived"
                    checked={form?.archived ? true : false}
                    disabled={!edit || current_loading}
                />
            </td>
            <td className="text-center">
                {tracking.status}
            </td>
            <td className="text-center">
                <Button size="mini">
                    <i className="fas fa-pencil-alt"></i>
                </Button>
            </td>
        </tr>
    )
}

const Tracking = ({ tramite, onClose = null }) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [datos, setDatos] = useState([]);
    const [is_error, setIsError] = useState(false);
    const [is_refresh, setIsRefresh] = useState(true);

    const getTracking = async () => {
        let add = page > 1 ? true : false;
        setCurrentLoading(true);
        await trackingProvider.trackings(tramite.id, { page })
        .then(res => {
            let { trackings } = res.data;
            setPage(trackings.page || 1);
            setLastPage(trackings.lastPage || 0);
            setDatos(add ? [...datos, ...trackings.data] : trackings.data);
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (page > 1) setIsRefresh(true)
    }, [page]);

    useEffect(() => {
        if (is_refresh) getTracking();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    return (
        <Modal show={true}
            md="11"
            isClose={onClose}
            titulo="Listado de Seguimiento"
            height="90vh"
        >
            <div className="card-body h-100">
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th width="50px">Código</th>
                                <th widht="600px">Asunto</th>
                                <th width="100px">Tipo</th>
                                <th width="100px">Documento</th>
                                <th width="350px">Origen</th>
                                <th width="350px">Propietario</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <span className="badge badge-dark">{tramite?.slug}</span>
                                </td>
                                <td>
                                    <div>{tramite?.asunto}</div>
                                </td>
                                <td>
                                    {tramite?.tramite_type?.description || ""}
                                </td>
                                <td>
                                    {tramite?.document_number}
                                </td>
                                <td>
                                    <span className="badge badge-warning">{tramite?.dependencia?.nombre || ""}</span>
                                </td>
                                <td className="capitalize">
                                    {tramite?.person?.fullname || ""}
                                </td>
                            </tr>    
                        </tbody>
                    </table>

                    <table className="table mt-5 table-bordered table-striped">
                        <thead>
                            <tr>
                                <th width="350px">Dependencia</th>
                                <th width="350px">Persona</th>
                                <th className="text-center">Visible</th>
                                <th className="text-center">Actual</th>
                                <th className="text-center" width="100px">Modo</th>
                                <th className="text-center">Archivado</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos?.map((d, indexD) => 
                                <ItemTracking tracking={d}
                                    key={`list-tracking-${indexD}`}
                                />
                            )}
                            {/* preloader */}
                            <Show condicion={current_loading}>
                                <PlaceholderItem/>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    )
}

export default Tracking;