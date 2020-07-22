import { recursoshumanos } from '../apis';
import { getId } from './index';


export const findConvocatoria = async (ctx) => {
    let id = getId(ctx);
    return await recursoshumanos.get(`convocatoria/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({
            success: false,
            code: 501,
            message: error.message
        }));
}

export const getEtapas = async (ctx) => {
    let id = getId(ctx);
    return await recursoshumanos.get(`convocatoria/${id}/etapas`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({
        success: false,
        code: 501,
        message: err.message
    }));
}