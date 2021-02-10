import React, { useState } from 'react';

const ModalBoardConfig = () => {

    // render
    return (
        <div class="modal modal-drawer fade has-shown" 
            id="modalBoardConfig" role="dialog" 
            aria-labelledby="modalBoardConfigTitle" style={{ display: "block", zIndex: 1050, }} aria-modal="true"
        >
            {/* <!-- .modal-dialog --> */}
            <div class="modal-dialog modal-drawer-right" role="document">
                {/* <!-- .modal-content --> */}
                <div id="modalContentLayer1" class="modal-content">
                    {/* <!-- .modal-header --> */}
                    <div class="modal-header">
                        <h5 id="modalBoardConfigTitle" class="modal-title"> Menu </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    {/* <!-- .modal-body --> */}
                    <div class="modal-body">
                        {/* <!-- .nav --> */}
                        <ul class="nav flex-column">
                            <li class="nav-item">
                                <a class="nav-link" href="#modalLayer2" data-toggle="modal" data-dismiss="modal" data-content-layer="board-overview.html">Overview</a>
                            </li>
                        </ul>
                    </div>
                    <div class="text-center p-3">
                        <a href="#" class="btn btn-link">View all activity ...</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

// exportar
export default ModalBoardConfig;