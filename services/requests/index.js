import atob from 'atob';
import { findConvocatoria } from './convocatoria';

// recuperar id
export const getId = (ctx) => {
    let { query } = ctx;
    return query.id ? atob(query.id) : '_error';
}

export {
    findConvocatoria
};