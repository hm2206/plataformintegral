import moment from 'moment';
import React from 'react';
import { useMemo } from 'react';
import Show from '../../components/show';
import { BtnBack } from '../Utils';

const Cover = ({ back, image, titulo, email, phone, documentNumber, birhday, cargo }) => {

  const displayBirthDay = useMemo(() => {
    return moment(birhday).format('DD/MM/YYYY');
  }, [birhday]);

  return (
    <div class="page-cover">
        <Show condicion={back}>
            <BtnBack/>
        </Show>
        <div class="text-center">
            <a href={image} target="_blank" class="user-avatar user-avatar-xl"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
            >
                <img src={image ? image: "/img/.jpg"} 
                    alt={titulo}
                    style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                />
            </a>
            <h2 class="h4 mt-2 mb-0 uppercase">{titulo}</h2>
            <div class="my-1"></div>
            <Show condicion={cargo}>
                <p class="text-muted mb-0"> Cargo: <b className='text-dark capitalize'>{`${cargo}`.toLowerCase()}</b></p>
            </Show>
            <Show condicion={documentNumber}>
                <p class="text-muted mb-0"> N° Documento: <b className='badge badge-dark'>{documentNumber}</b></p>
            </Show>
            <Show condicion={birhday}>
                <p class="text-muted mb-0"> F. Nacimiento: <b className='text-dark'>{displayBirthDay}</b></p>
            </Show>
            <Show condicion={email}>
                <p class="text-muted mb-0"> Correo de Contacto: <a href={`mailto:${email}`}>{email}</a> </p>
            </Show>
            <Show condicion={phone}>
                <p class="text-muted"> Teléfono: <a href={`tel:${phone}`}>{phone}</a> </p>
            </Show>
            <p className='mt-3'> Información básica del trabajador </p>
        </div>
        <div class="cover-controls cover-controls-bottom">
            {/* <a href="https://uselooper.com/user-profile.html#" class="btn btn-light" data-toggle="modal" data-target="#followersModal">
                2,159 Followers
            </a> 
            <a href="https://uselooper.com/user-profile.html#" class="btn btn-light" data-toggle="modal" data-target="#followingModal">
                136 Following
            </a> */}
        </div>
    </div>
);

}

export default Cover;