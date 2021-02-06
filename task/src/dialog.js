/* HELP & SETTINGS */
let dialog_bg = document.querySelector('#dialog-bg');
let dialog_closebtn = document.querySelector('#dialog-closebtn');
function openHelp() {
    dialog_bg.style.display = 'flex';
    dialog_closebtn.focus();
}
dialog_closebtn.addEventListener('click', () => {
    dialog_bg.style.display = 'none';
});