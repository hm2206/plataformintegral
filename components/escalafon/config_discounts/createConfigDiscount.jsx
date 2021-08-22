import React, { useState, useMemo, useEffect } from 'react'
import Modal from '../../modal'
import FormConfigDiscount from './formConfigDiscount'
import { Button } from 'semantic-ui-react'
import { Confirm } from '../../../services/utils'
import ConfigDiscountProvider from '../../../providers/escalafon/ConfigDiscountProvider'
import Swal from 'sweetalert2'
import moment from 'moment'

const configDiscountProvider = new ConfigDiscountProvider()

const CreateConfigDiscount = ({ onClose = null, onSave = null, show = true }) => {

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false)

    const canSave = useMemo(() => {
        let required = ['year', 'month'];
        for(let attr of required) {
            let value = form[attr];
            if (!value) return false;
        }

        return true;
    }, [form])

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = []
        setErrors(newErrors);
    }

    const handleSave = async () => {
        let answer = await Confirm('warning', '¿Estás seguro en guardar los datos?', 'Guardar');
        if (!answer) return;
        setCurrentLoading(true)
        await configDiscountProvider.store(form) 
        .then(async res => {
            let { config_discount } = res.data;
            await Swal.fire({ icon: 'success', text: 'Los datos se guardarón correctamente!' })
            if (typeof onSave == 'function') onSave(config_discount);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
        })
        setCurrentLoading(false)
    }

    const defaultDate =  () => {
        let current_date = moment();
        let year = current_date.year();
        let month = current_date.subtract(1, 'months').month() + 1;
        setForm({ year, month })
    }

    useEffect(() => {
        defaultDate();
    }, []);

    return (
        <Modal titulo={<span><i className="fas fa-cogs"></i> Crear Configuración de Descuento</span>}
            show={show}
            isClose={onClose}
        >
            <div className="card-body">
                <FormConfigDiscount onChange={handleInput}
                    readOnly={['year', 'month']}
                    form={form}
                    disabled={current_loading}
                    errors={errors}
                >
                    <div className="col-12 text-right">
                        <hr />

                        <Button color="teal"
                            onClick={handleSave}
                            disabled={!canSave}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </FormConfigDiscount>
            </div>
        </Modal>
    )
}

export default CreateConfigDiscount;