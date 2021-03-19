import React, { useEffect } from 'react';

const ModalRight = ({ title = 'Menu', onClose = null, show = false, disabled = false, children = null }) => {

    const toggleBody = (hidden = false) => {
        document.body.style = `overflow-y: ${hidden ? 'hidden' : 'auto'};`;
    }

    useEffect(() => {
        toggleBody(show);
    }, [show]);

    // render
    return (
        <div className={`modal modal-drawer fade show has-shown window-fixed ${show ? 'fixed-open' : 'fixed-close'}`} 
            id="modalBoardConfig" 
            tabIndex="-1"
            role="dialog" 
            style={{ display: 'block' }}>
            {/* <!-- .modal-dialog --> */}
            <div className="modal-dialog modal-drawer-right" role="document">
                {/* <!-- .modal-content --> */}
                <div id="modalContentLayer1" className="modal-content">
                    {/* <!-- .modal-header --> */}
                    <div className="modal-header modal-body-scrolled">
                        <h4 id="modalBoardConfigTitle" className="modal-title"> {title || ''} </h4>
                        <button type="button" 
                            className="close"
                            disabled={disabled || !show}
                            onClick={(e) => typeof onClose == 'function' ? onClose(e) : null}
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    {/* <!-- .modal-body --> */}
                    <div className="modal-body">
                        <div style={{ minWidth: '50vh', maxWidth: '100vh' }}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalRight