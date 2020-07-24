import atob from 'atob';
import { findConvocatoria } from './convocatoria';
import { getStaff } from './staff';

// recuperar id
export const getId = (ctx) => {
    let { query } = ctx;
    return query.id ? atob(query.id) : '_error';
}

export {
    getStaff,
    findConvocatoria
};