// -------------------- START UP --------------------

// Hide subscriber settings on start
// WORKING
$('#subscriber-settings').hide();

// Hide instances settings on start
// WORKING
$('#instances-setting').hide();

// Hide multicast address on start
// WORKING
$('#multicastAddress-setting').hide();

// ----------------- END OF START UP ----------------

// Show multicast address when multicast is clicked
// WORKING
$('#multicast').on('click', (e) => {
    // console.log(e.target.getAttribute('name'));
    if(e.target.getAttribute('name') == 'close-circle-outline'){
        $('#multicastAddress-setting').show();
    }else{
        $('#multicastAddress-setting').hide();
    }
})

// Show instances when keyed is true
// WORKING
$('#keyed').on('click', (e) => {
    // console.log(e.target.getAttribute('name'));
    if(e.target.getAttribute('name') == 'close-circle-outline'){
        $('#instances-setting').show();
    }else{
        $('#instances-setting').hide();
    }
})

// Turn check marks to X when clicked
// WORKING
$('.checkmark').on('click', (e) => {

    if(e.target.getAttribute('name') == 'checkmark-circle-outline'){
        e.target.setAttribute('name', 'close-circle-outline');
    }else{
        e.target.setAttribute('name', 'checkmark-circle-outline');
    }

});

// Show publisher/subscriber settings on drop down click
// WORKING
$('#type-select').on('change', (e) => {

    if(e.target.value == 'subscriber'){
        $('#publisher-settings').hide();
        $('#subscriber-settings').show();
    }else{
        $('#subscriber-settings').hide();
        $('#publisher-settings').show();
    }

});