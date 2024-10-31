document.addEventListener('DOMContentLoaded', () => {
    const pickr = Pickr.create({
        el: '#color-picker',
        theme: 'classic',
        swatches: ['#F44336', '#E91E63', '#9C27B0'],
        defaultRepresentation: 'RGBA',
        components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
                input: true,
                clear: true,
                save: true,
            }
        },
        i18n: {
            // Strings visible in the UI
           'ui:dialog': 'color picker dialog',
           'btn:toggle': 'toggle color picker dialog',
           'btn:swatch': 'color swatch',
           'btn:last-color': 'use previous color',
           'btn:save': '选择',
           'btn:clear': '清除',
    
           // Strings used for aria-labels
           'aria:btn:save': 'save and close',
           'aria:btn:cancel': 'cancel and close',
           'aria:btn:clear': 'clear and close',
           'aria:input': 'color input field',
           'aria:palette': 'color selection area',
           'aria:hue': 'hue selection slider',
           'aria:opacity': 'selection slider'
        }
    });

    pickr.on('change', (color) => {
        const rgbaColor = color.toRGBA().toString();
        document.body.style.backgroundColor = rgbaColor; // 设置背景色
    });
});