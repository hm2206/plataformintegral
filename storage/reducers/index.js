import { combineReducers } from 'redux';
import auth from './authReducer';
import work from './workReducer';
import cronograma from './cronogramaReducer';
import info from './infoReducer';
import cargo from './cargoReducer';
import historial from './historialReducer';
import person from './personReducer';
import type_remuneracion from './typeRemuneracionReducer';
import type_descuento from './typeDescuentoReducer';
import type_aportacion from './typeAportacionReducer';
import type_categoria from './typeCategoriaReducer';
import type_detalle from './typeDetalleReducer';
import type_sindicato from './typeSindicatoReducer'
import afp from './afpReducer';
import meta from './metaReducer';
import convocatoria from './convocatoriaReducer';
import personal from './personalReducer';
import dependencia from './dependenciaReducer';
import user from './userReducer';
import system from './systemReducer';
import permission from './permissionReducer';
import apps from './appsReducer';

const rootReducer = combineReducers({
    auth,
    work,
    cronograma,
    info,
    cargo,
    historial,
    person,
    type_remuneracion,
    type_descuento,
    type_aportacion,
    type_categoria,
    type_detalle,
    type_sindicato,
    afp,
    meta,
    convocatoria,
    personal,
    dependencia,
    user,
    system,
    permission,
    apps,
});

export default rootReducer;