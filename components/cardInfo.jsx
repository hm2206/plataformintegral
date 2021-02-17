import React from 'react';
import Show from './show';

const templateInfo = {
    key: "key",
    value: "value",
    className: "",
}

const templateButton = {
    key: "example",
    title: "example",
    icon: "fas fa-search",
    className: ""
}

const CardInfo = ({ 
    img = "", infos = [templateInfo], buttons = [templateButton], onShare = null,
    onButton = null,
}) => {

    // render
    return (
        <div className="card h-100">
            <div className="card-body" style={{ position: 'relative' }}>
                <Show condicion={typeof onShare == 'function'}>
                    <a href="#" style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.preventDefault();
                            onShare(e);
                        }}
                    >
                        <i class="fas fa-share-square"></i>
                    </a>
                </Show>
                <Show condicion={img}>
                    <div className="py-4 text-center">
                        <img src={img} alt="imagen" 
                            style={{ 
                                maxWidth: "100%", 
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <hr/>
                </Show>
                {infos.map((i, indexI) => 
                    <div key={`list-info-${indexI}`}>
                        <b>{i.key}</b>: <span className={i.className}>{i.value}</span>
                    </div>
                )}
            </div>
            <Show condicion={buttons.length}>
                <div className="card-footer">
                    <div className="card-body">
                        <div className="btn-group">
                            {buttons.map((b, indexB) => 
                                <button className={`btn ${b.className}`}
                                    key={`btn-list-${indexB}`}
                                    title={b.title}
                                    onClick={(e) => typeof onButton == 'function' ? onButton(e, indexB, b) : null}
                                >
                                    <i className={b.icon}></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
}

export default CardInfo;