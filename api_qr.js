
const codigo_qr = async (ctx) => {
    let { slug } = ctx.query;
    if (slug) {
        // tu código
    }
    // configuramos el responseType
    return await tramite.get(`tramite/${slug}/code_qr`, { responseType: 'blob' })
        .then(async res => {
            let type = res.headers['content-type'];
            let blob = new Blob([res.data], { type });
            // generar url del blob para mostrar en un <img/>
            let url = await URL.createObjectURL(blob);
            return url;
        }).catch(err => "");
}
