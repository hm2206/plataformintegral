import React, { useMemo, useState } from 'react';
import Modal from '../../modal';
import { Button, Form } from 'semantic-ui-react';
import { format } from 'currency-formatter';
import { DropZone } from '../../Utils';
import Show from '../../show';
import { ToastContainer, toast } from 'react-toastify';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';

const ChangePim = ({ pim = {}, isEntry = true, onClose = null, onSave = null }) => {

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: 0
  });

  const handleInput = ({ name, value }) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleIntInput = ({ name, value }) => {
    let newValue = value;
    if (value) newValue = parseInt(`${value}`);
    handleInput({ name, value: newValue });
  }

  const handleFile = ({ files }) => {
    if (!files.length) return;
    const currentFile = files[0];
    handleInput({ name: 'file', value: currentFile });
  }

  const displayAmount = useMemo(() => {
    const tmpAmount = parseFloat(`${form?.amount || 0}`);
    const tmpPimAmount = parseFloat(`${pim.amount}`);
    if (!isEntry) return (tmpPimAmount - tmpAmount);
    return tmpPimAmount + tmpAmount
  }, [form]);

  const displayDiff = useMemo(() => {
    const tmpDiff = parseFloat(`${pim.executedAmount}`);
    return displayAmount - tmpDiff;
  }, [form]);

  const handleSave = async () => {
    setLoading(true);
    toast.dismiss();
    const payload = new FormData();
    payload.set('pimId', pim.id);
    payload.set('amount', parseFloat(`${form.amount}`));
    payload.set('mode', isEntry ? 'ENTRY' : 'EGRESS');
    payload.set('observation', form?.observation || null);
    payload.set('file', form?.file || null);
    await microPlanilla.post(`pimLogs`, payload)
      .then(async res => {
        const successMsg = "El regístro se guardo correctamente!"
        await Swal.fire({ icon: 'success', text: successMsg });
        if (typeof onSave == 'function') onSave(res.data);
      }).catch(() => {
        toast.error("El regístro no se pudo guardar!", {
          progress: false
        });
    });
    setLoading(false);
  }

  return (
    <Modal show={true}
      disabled={loading}
      md="5 col-lg-4 col-sm-8 col-11"
      isClose={onClose}
      titulo={<span>
        <i className={`mr-2 fas fa-${isEntry ? 'plus' : 'minus'}`}></i>
        {isEntry ? "Aumentar Presupuesto" : "Disminuir  Presupuesto"}
      </span>}
    >
      <div className="card-body">
        <Form>
          <div className="card card-body">
            <div className="row">
              <Form.Field className='mb-3 col-6'>
                <label htmlFor="">Monto Actual</label>
                <input type="text"
                  readOnly
                  value={format(displayAmount, { code: 'PEN' })}
                />
              </Form.Field>

              <Form.Field className='mb-3 col-6'>
                <label>Saldo Actual</label>
                <input type="text"
                  readOnly
                  value={format(displayDiff, { code: 'PEN' })}
                />
            </Form.Field>
            </div>
          </div>

          <div className="col-12">
            <hr />
            <i className="fas fa-cogs"></i> Editar Presupuesto
            <hr />
          </div>

          <Form.Field className='mb-3'>
            <label>
              {isEntry ? 'Aumentar' : 'Disminuir'} Presupuesto
              <b className="text-red ml-2">*</b>
            </label>
            <input type="number"
              step="any"
              name="amount"
              onChange={({ target }) => handleIntInput(target)}
              value={form?.amount}
              disabled={loading}
            />
          </Form.Field>

          <Form.Field className='mb-3'>
            <label >Observación</label>
            <textarea rows={4}
              name="observation"
              onChange={({ target }) => handleInput(target)}
              value={form?.observation}
              disabled={loading}
            />
          </Form.Field>

          <Form.Field className='mb-3'>
            <label >Archivo</label>
            <Show condicion={!form?.file}
              predeterminado={
                <div className='card card-body'>
                  <div className="row">
                    <div className="col-10">
                      {form?.file?.name} 
                    </div>
                    <div className="col-2 text-right">
                      <Button onClick={() => handleInput({ name: 'file', value: null })}
                        size="mini"
                        color='red'
                        disabled={loading}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              }
            >
              <DropZone
                name="file"
                multiple={false}
                title="Archivo de constancia"
                accept="application/pdf"
                disabled={loading}
                onChange={handleFile}
              />
            </Show>
          </Form.Field>

          <Show condicion={form?.amount}>
            <div className="mt-4 text-right">
              <hr />
              <Button color='teal'
                loading={loading}
                disabled={loading}
                onClick={handleSave}
              >
                <i className="fas fa-save"></i> Guardar
              </Button>
            </div>
          </Show>
        </Form>
      </div>
      <ToastContainer/>
    </Modal>
  )
}

export default ChangePim;