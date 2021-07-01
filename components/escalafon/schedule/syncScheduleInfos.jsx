import React, { useState } from 'react';
import Modal from '../../modal';
import { Button } from 'semantic-ui-react';
import { SelectCargo, SelectTypeCategoria } from '../../select/cronograma';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
import Swal from 'sweetalert2';
import moment from 'moment';

const infoProvider = new InfoProvider();

const SyncScheduleInfos = ({ info = {}, date = null, onClose = null }) => {

    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [year, setYear] = useState(moment(new Date(date || null)).format('YYYY'));
    const [month, setMonth] = useState(moment(new Date(date || null)).format('MM'));

    const isForm = Object.values(form).length;

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    const handleSync = async () => {
        setCurrentLoading(true);
        let payload = {
            year,
            month
        };
        await infoProvider.asyncSchedules(info.id, payload)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'error', text: message });
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        setCurrentLoading(false);
    }   

    return (
        <Modal show={true}
            isClose={onClose}
            height="45vh"
            disabled={current_loading}
            titulo={<span><i className="fas fa-sync"></i> Sincronizar Horarios a los contratos</span>}
        >  
            <div className="card-body">
                <div className="row">
                    <div className="col-md-4">
                        <SelectCargo
                            name="cargo_id"
                            value={form?.cargo_id}
                            onChange={(e, obj) => handleInput(obj)}
                            disabled={current_loading}
                        />
                    </div>

                    <div className="col-md-5">
                        <SelectTypeCategoria
                            name="type_categoria_id"
                            value={form?.type_categoria_id}
                            onChange={(e, obj) => handleInput(obj)}
                            disabled={current_loading}
                        />
                    </div>

                    <div className="col-md-3">
                        <Button fluid
                            color="blue"
                            loading={current_loading}
                            disabled={current_loading || !isForm}
                            onClick={handleSync}
                        >
                            <i className="fas fa-save"></i>
                        </Button>
                    </div>

                    <div className="col-12 text-center text-muted">
                        <h3 className="mt-5 mb-5">
                            <i className="fas fa-sync font-24"></i> <br />
                            Los cambios son inrreversibles
                        </h3>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SyncScheduleInfos;