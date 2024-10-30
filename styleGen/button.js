function toggleSliderButton(buttonId) {
    var toggle = document.getElementById(buttonId);
    toggle.classList.toggle('on');
}

// 改造它
// function toggleAutoBuildRegion() {
//     const button = document.getElementById('autoBuildRegionButton');
//     autoBuildRegion = !autoBuildRegion;
//     if (autoBuildRegion) {
//         button.classList.add('on');
//     } else {
//         button.classList.remove('on');
//     }
// }