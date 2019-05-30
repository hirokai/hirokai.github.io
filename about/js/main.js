$(() => {
    const setHandler = (kind) => {
        $('#'+kind).click((ev) => {
            const active = !$(ev.target).hasClass('active');
            if(active) {
                $('[data-kind='+kind+']').show();
            }else{
                $('[data-kind='+kind+']').hide();
            }
        });    
    }
    setHandler('poster');
    setHandler('oral');
    setHandler('outreach');
});