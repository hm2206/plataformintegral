import React from 'react';

const Show = ({ condicion, children, predeterminado }) => {
    if (condicion) return children || null;
    else return predeterminado ||  null;
}


export default Show;