import React, { useState } from 'react';
import { useContext } from 'react';
import { TramiteContext } from '../../contexts/tramite/TramiteContext';
import { tramiteTypes } from '../../contexts/tramite/TramiteReducer';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import { AuthContext } from '../../contexts/AuthContext';
import { useMemo } from 'react';
import TrackingProvider from '../../providers/tramite/TrackingProvider';
import Swal from 'sweetalert2';

// providers
const trackingProvider = new TrackingProvider();

const EditDescriptionTracking = () => {

    // auth
    const { auth } = useContext(AuthContext);

    // tramite
    const { current_tracking, dispatch } = useContext(TramiteContext);
    const { tramite } = current_tracking;

    // memo
    const isEdit = useMemo(() => {
        return current_tracking.current && current_tracking.user_verify_id == auth.id;
    }, [current_tracking]);

    // estados
    const [description, setDescription] = useState(current_tracking.description || "");
    const [current_loading, setCurrentLoading] = useState(false);

    // actualizar datos
    const handleUpdate = async () => {
        setCurrentLoading(true);
        await trackingProvider.update(current_tracking.id, { description })
        .then(res => {
            let { message } = res.data; 
            Swal.fire({ icon: 'success', text: message });
            dispatch({ type: tramiteTypes.CHANGE_TRACKING, payload: { ...current_tracking, description } });
        }).catch(err => Swal.fire({ icon: "error", text: err.message }));
        setCurrentLoading(false);
    }

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-info-circle"></i> Proveído interno
            </div>
            <div className="card-body">
                <div className="form-group">
                    <textarea name="description"
                        className="form-control"
                        value={description}
                        onChange={({ target }) => setDescription(target.value)}
                        rows="7"
                        disabled={!isEdit || current_loading || !tramite?.state}
                    />
                </div>

                <Show condicion={isEdit}>
                    <div className="form-group text-right">
                        <Button color="primary"
                            loading={current_loading}
                            onClick={handleUpdate}
                            disabled={current_loading || !tramite?.state}
                        >
                            <i className="fas fa-save"></i> Guardar datos
                        </Button>
                    </div>
                </Show>
            </div>
        </div>
    )
}

export default EditDescriptionTracking;