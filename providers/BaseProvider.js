'use strict';

class BaseException extends Error {

    constructor(message, status = 501, errors = {}) {
      // Pasa los argumentos restantes (incluidos los específicos del proveedor) al constructor padre
      super(message);
  
      // Mantiene un seguimiento adecuado de la pila para el lugar donde se lanzó nuestro error (solo disponible en V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, BaseException)
      }
  
      this.name = 'BaseException'
      this.success = false;
      this.status = status;
      this.errors = errors;
    }

}

class BaseProvider {

    status = 501;
    message = "Ocurrió un error";

    handleError = (err) => {
        let response = err.response;
        if (!response) throw new BaseException(err.message || this.message, this.status);
        let { data } = response;
        if (typeof data == 'object') throw new BaseException(data.message || this.message, this.status, data.errors || {});
        throw new BaseException(err.message || this.message, this.status);
    }

}

export default BaseProvider;