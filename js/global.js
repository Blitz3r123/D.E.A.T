// -------------------- START UP --------------------

// HIDE ALL WINDOWS EXCEPT INDEX
document.querySelector('#createContent').style.display = "none";
$('#runContent').hide();

// Hide error message pop up
// WORKING
$('#error-message').hide();

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



// MAIN SCRIPT CREATION FUNCTION
// Not working
// CHANGE IT BACK TO #createButton AFTER IT IS WORKING

$('#reset-button').on('click', () => {
    /*
        For all checkboxes:
        FALSE = close-circle-outline
        TRUE = checkmark-circle-outline
    */

    // Get BestEffort Value
    let BestEffort = document.querySelector('#bestEffort'); 
    let bestEffortValue;
    BestEffort.name === 'checkmark-circle-outline' ? bestEffortValue = '-bestEffort' : bestEffortValue = '';

    // Get DataLen Value
    // If DataLen is empty set it to 100.
    let dataLen = document.querySelector('#dataLen');
    let dataLenValue;
    dataLen.value === '' ? dataLenValue = '-dataLen 100' : dataLenValue = `-dataLen ${dataLen.value}`;

    if(dataLen.value < 28 && dataLen.value !== ''){
        showError("Data Length can't be less than 28.");
    }else if(dataLen.value > 2147483128){
        showError("Data Length can't be more than 2147483128.");
    }

    // Get Verbosity value
    let verbosity = document.querySelector('#verbosity');
    let verbosityValue = `-verbosity ${verbosity.value}`;
    
    // Get dynamic data value
    let dynamicData = document.querySelector('#dynamicData').name;
    let dynamicValue;
    dynamicData === 'close-circle-outline' ? dynamicValue = '' : dynamicValue = '-dynamicData';

    // Get durability value
    let durabilityValue = '-durability ' + document.querySelector('#durability').value;

    // Get domainID value
    let domainID = document.querySelector('#domain').value;
    if(domainID < 0){
        showError("Domain ID can't be negative.");
    }

    // Get keyed value
    let keyed = document.querySelector('#keyed').name;
    let keyedValue;
    keyed === 'close-circle-outline' ? keyedValue = '' : keyedValue = '-keyed';
    
    // Get instances value
    let instances = document.querySelector('#instances').value;
    let instancesValue;
    
    if(keyedValue == ''){
        instancesValue = 1;
    }else{
        if(instances == ''){
            instancesValue = 1;
        }else{
            instancesValue = instances;
        }
    }

    // Get multicast value
    let multicast = document.querySelector('#multicast').name;
    let multicastAddress = document.querySelector('#multicastAddress').value;
    let multicastValue;
    let multicastAddressValue;
    
    multicast === 'close-circle-outline' ? multicastValue = '' : multicastValue = '-multicast';

    if(multicastValue == ''){
        multicastAddressValue = '';
    }else{
        if(multicastAddress == ''){
            multicastAddressValue = '';
        }else{
            multicastAddressValue = `${multicastValue} ${multicastAddress}`;
        }
    }

    if(multicastAddress !== '' && !multicastAddress.match(/\d/)){
        showError("Multicast address can only be numeric.");
    }

    // Get dynamic data value
    let directCommunication = document.querySelector('#directCommunication').name;
    let directCommunicationValue;
    directCommunication === 'close-circle-outline' ? directCommunicationValue = '-noDirectCommunication' : directCommunicationValue = '';

    // Get positive acknowledgements value
    let noPositiveAcks = document.querySelector('#noPositiveAcks').name;
    let noPositiveAcksValue;
    noPositiveAcks === 'close-circle-outline' ? noPositiveAcksValue = '-noPositiveAcks' : noPositiveAcksValue = '';

    // Get print intervals value
    let printIntervals = document.querySelector('#printIntervals').name;
    let printIntervalsValue;
    printIntervals === 'close-circle-outline' ? printIntervalsValue = '-noPrintIntervals' : printIntervalsValue = '';

    // Get QOS file
    let qosFileInput = document.querySelector('#qosFile');
    let qosFileInputValue = qosFileInput.files[0].path;
    
    console.log(qosFileInput.value);
    
});

// Close error message if opened
// WORKING
$('#error-message').on('click', () => {
    
    var error = document.querySelector('#error-message');
    
    while(error.firstChild){
        error.removeChild(error.firstChild);
    }

    $('#error-message').hide();
});

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

// -------------------- FUNCTION DEFINITIONS --------------------

function showError(errorMessage){
    var errorMessagePopUp = document.querySelector('#error-message');
    var errorText = document.createTextNode(errorMessage);;

    errorMessagePopUp.appendChild(errorText);

    $('#error-message').show();
}

function showContent(content){
    let toBeShown = document.querySelector(content);
    let indexContent = document.querySelector('#indexContent');
    
    // Hide everything
    $('#indexContent').hide();
    $('#createContent').hide();
    $('#runContent').hide();

    // Show parameter content
    $(content).show();
}