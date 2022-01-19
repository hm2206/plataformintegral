import React, { useState, useEffect } from "react";

const Modal = ({ titulo, show = false, children = null, isClose, md, disabled = false, display, classHeader, classClose, height  }) => {

  const [is_show, setIsShow] = useState(false)

  const handleClose = () => {
    if (typeof isClose == 'function') isClose(!is_show)
    setIsShow(prev => !prev)
  } 

  useEffect(() => {
    setIsShow(show)
  }, [show])

  if (is_show || display) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          position: "fixed",
          top: "0px",
          left: "0px",
          zIndex: "1050",
          display: is_show  ? 'block' : 'none',
          padding: "0.5em 0.5em"
        }}
      >
        <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center", }}>
          <div
            className={`col-md-${md ? md : "6"} card`}
            style={{ position: "relative", minHeight: height, maxHeight: '95%', height: 'auto', background: 'white', overflow: 'auto'}}
          >
            <div className={`card-header ${classHeader}`}>
              {titulo}
              <button
                className={`close ${classClose}`}
                disabled={disabled}
                onClick={handleClose}
              >
                <i className="fas fa-times fa-xs"></i>
              </button>
            </div>
            <div style={{ height: "100%", position: "relative" }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );    
  }

  return null;
}

export default Modal;