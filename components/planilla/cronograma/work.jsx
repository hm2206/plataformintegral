import React, { useEffect, useContext } from 'react';
import { Form, Select } from 'semantic-ui-react';
import Show from '../../show';
import { CronogramaContext } from '../../../contexts/cronograma/CronogramaContext';
import Skeleton from 'react-loading-skeleton';
import { useMemo } from 'react';

const PlaceholderInput = () => <Skeleton height="37px"/> 

const Work = () => {

  const { historial, setBlock, loading, setIsEditable } = useContext(CronogramaContext);
  const isHistorial = Object.keys(historial).length;
  
  const displayWork = useMemo(() => {
    return historial?.info?.contract?.work || {};
  }, [historial])

  useEffect(() => {
    setIsEditable(false);
    if (historial.id) setBlock(false);
  }, [historial.id]);

  return (
    <div className="row">
      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Abrev.</label>
            <input type="text"
              className="uppercase"
              name="profession"
              value={displayWork?.person?.prefix || ''}
              readOnly
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-6 mb-3">
        <Show condicion={isHistorial && !loading}
            predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Apellidos</label>
            <input type="text" 
                name="ape_pat"
                className="uppercase"
                value={`${displayWork?.person?.lastname} ${displayWork?.person?.secondaryName || ''}`}
                readOnly
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-3 mb-3">
          <Show condicion={isHistorial && !loading}
              predeterminado={<PlaceholderInput/>}
          >
            <Form.Field>
              <label>Nombres</label>
              <input type="text" 
                className="uppercase"
                name="name"
                value={displayWork?.person?.name}
                readOnly
              />
            </Form.Field>
          </Show>
      </div>

      <div className="col-md-3 mb-3">
        <Form.Field>
          <Show condicion={isHistorial && !loading}
            predeterminado={<PlaceholderInput/>}
          >
            <label>Género</label>
            <Select placeholder="Select. Género"
              fluid
              options={[
                {key: "t", value: "", text: "Select. Género"},
                {key: "m", value: "M", text: "Masculino"},
                {key: "f", value: "F", text: "Femenino"},
                {key: "i", value: "I", text: "No Binario"}
              ]}
              name="gender"
              value={displayWork?.person?.gender}
              disabled
            />
          </Show>
        </Form.Field>
      </div>

      <div className="col-md-3 mb-3">
        <Form.Field>
          <Show condicion={isHistorial && !loading}
              predeterminado={<PlaceholderInput/>}
          >
            <label>Tipo Documento</label>
            <input
              type="text"
              readOnly
              value={displayWork?.person?.documentType?.name}
            />
          </Show>
        </Form.Field>
      </div>

      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>N° Documento</label>
            <input type="text" 
              name="document_number"
              value={displayWork?.person?.documentNumber}
              readOnly
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Fecha de Nacimiento</label>
            <input type="date" 
              name="date_of_birth"
              value={displayWork?.person?.dateOfBirth || ''}
              readOnly
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Departamento</label>
            <input type="text"
              name="cod_dep"
              className="uppercase"
              readOnly
              value={displayWork?.person?.badge?.departament || ""}
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-6 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Provincia</label>
            <input type="text"
              className="uppercase"
              name="cod_pro"
              readOnly
              value={displayWork?.person?.badge?.province || ""}
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Distrito</label>
            <input type="text" 
              name="cod_dis"
              className="uppercase"
              readOnly
              value={displayWork?.person?.badge?.district || ""}
            />
          </Form.Field>
        </Show>
      </div>

      <div className="col-md-6 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Dirección</label>
            <input type="text" 
              name="address"
              className="uppercase"
              value={displayWork?.person?.address || ''}
              readOnly
            />
          </Form.Field>      
        </Show>    
      </div>
                
      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>Correo Electrónico</label>
            <input type="text" 
              name="email_contact"
              value={displayWork?.person?.emailContact || ''}
              readOnly
            />
          </Form.Field> 
        </Show>
      </div>
                
      <div className="col-md-3 mb-3">
        <Show condicion={isHistorial && !loading}
          predeterminado={<PlaceholderInput/>}
        >
          <Form.Field>
            <label>N° Teléfono</label>
            <input type="text"  
              name="phone"
              value={displayWork?.person?.phone || ""}
              readOnly
            />
          </Form.Field> 
        </Show> 
      </div>
    </div>   
  )
}


export default Work;