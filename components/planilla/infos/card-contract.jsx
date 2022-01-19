import React from 'react';
import { Checkbox, Form } from 'semantic-ui-react';

const CardContract = ({ contract = {} }) => {
  return (
    <>
      <div className="col-md-4 mb-3">
        <Form.Field>
          <label htmlFor="">Código AIRHSP</label>
          <input type="text"
            name="codeAIRSHP"
            value={contract?.codeAIRSHP || null}
            placeholder="Código de AIRHSP"
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-4 mb-3">
        <Form.Field>
          <label htmlFor="">Tip. Categoría</label>
          <input type="text"
            value={contract?.typeCategory?.name || null}
            placeholder="Tip. Categoría"
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-4 mb-3">
        <Form.Field>
          <label htmlFor="">Condición</label>
          <input type="text"
            value={contract?.condition || null}
            placeholder="Condición"
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-4 mb-3">
        <Form.Field>
          <label htmlFor="">Dependencia </label>
          <input type="text"
            value={contract?.dependency?.name || null}
            placeholder="Dependencia"
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-4 mb-3">
        <Form.Field>
          <label htmlFor="">Perfil Laboral</label>
          <input type="text"
            value={contract?.profile?.name || null}
            placeholder="Perfil Laboral"
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-4 mb-3">
        <Form.Field>
          <label htmlFor="">Plaza</label>
          <input type="text" 
            value={contract?.plaza || null}
            placeholder="Plaza"
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-6 mb-3">
        <Form.Field>
          <label htmlFor="">Resolución</label>
          <input type="text" 
            placeholder="N° Resolución"
            value={contract.resolution || ""}
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-6 mb-3">
        <Form.Field>
          <label htmlFor="">Fecha de Resolución</label>
          <input type="date" 
            name="dateOfResolution"
            placeholder="Fecha de resolucion"
            value={contract.dateOfResolution || ""}
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-6 mb-3">
        <Form.Field>
          <label htmlFor="">Fecha de Ingreso</label>
          <input type="date" 
            placeholder="Fecha de ingreso"
            value={contract.dateOfAdmission || ""}
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-6 mb-3">
        <Form.Field>
          <label htmlFor="">Fecha de Cese </label>
          <input type="date" 
            placeholder="Fecha de cese"
            value={contract.terminationDate || ""}
            readOnly
          />
        </Form.Field>
      </div>

      <div className="col-md-12 mb-3 text-right">
        <Form.Field>
          <label htmlFor="">Estado</label>
          <div className={`badge badge-${contract?.state ? 'success' : 'danger'}`}>
            {contract?.state ? 'Activo' : 'Terminado'}
          </div>
        </Form.Field>
      </div>
    </>
  )
}

export default CardContract;