var skin = localStorage.getItem('skin') || '';
var unusedLink = document.querySelector('link[data-skin]:not([data-skin="' + skin + '"])');
unusedLink.setAttribute('rel', '');
unusedLink.setAttribute('disabled', true);