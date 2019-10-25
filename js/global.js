/*
    Notes:
    - Search features show the setting but changing values of settings isn't affecting it
*/

const fs = require('fs');

// GLOBAL VARIABLES
var hasError;

// -------------------- START UP --------------------

// HIDE ALL WINDOWS EXCEPT INDEX
$('#indexContent').hide();
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

// --------------- START OF EVENTS ------------------

$('#searchSettingInput').on('keyup', (e) => {
    var searchSettingDOM = document.getElementById('#searchSettingInput');
    var foundArray;
    var foundItem;
    var textNode;
    var innerHTML;
    var searchResults = document.querySelector('#search-results');      

    if(e.target.value === ''){

        // searchResults.removeChild(searchResults.firstChild);    

        // console.log(searchResults);
    }else{

        foundArray = $('.settings-column').find('p.setting');
    
        foundArray.each((index, item) => {
            if(item.title.includes(e.target.value) || item.innerHTML.includes(e.target.value)){
                // console.log(item);
                
                foundItem = document.createElement('p');
                textNode = document.createTextNode(item.textContent);
                foundItem.append(textNode);
                foundItem.innerHTML = item.innerHTML;
                foundItem.className = item.className;
                foundItem.title = item.title;
    
            }
        });
        
        foundItem.className += " found-item ";
        // console.log(foundItem);
    
        let searchResultDOM = document.querySelector('#search-results');
        searchResultDOM.innerHTML = '';
        searchResultDOM.appendChild(foundItem);
    }

});

$('#latencyTest').on('click', () => {
    let latencyTestDOM = document.querySelector('#latencyTest');
    let latencyCountDOM = document.querySelector('#latencyCount');
    
    if(!isChecked(latencyTestDOM.name)){
        latencyCountDOM.setAttribute('value', '10000');
        latencyCountDOM.setAttribute('disabled', 'true');
    }else{
        latencyCountDOM.setAttribute('value', '-1');
        latencyCountDOM.removeAttribute('disabled');
    }
});

$('#executionTime').on('keyup', () => {
    let executionTimeDOM = document.querySelector('#executionTime');
    let numIterDOM = document.querySelector('#numIter');

    if(executionTimeDOM.value !== ''){
        numIterDOM.setAttribute('disabled', 'true');
    }else{
        numIterDOM.removeAttribute('disabled');
    }
});

$('#numIter').on('keyup', () => {
    let executionTimeDOM = document.querySelector('#executionTime');
    let numIterDOM = document.querySelector('#numIter');

    if(numIterDOM.value !== ''){
        executionTimeDOM.setAttribute('disabled', 'true');
    }else{
        executionTimeDOM.removeAttribute('disabled');
    }
});

// ---------------- END OF EVENTS -------------------

// MAIN SCRIPT CREATION FUNCTION
// Not working
// CHANGE IT BACK TO #createButton AFTER IT IS WORKING

$('#createButton').on('click', () => {
    /*
        For all checkboxes:
        FALSE = close-circle-outline
        TRUE = checkmark-circle-outline
    */

    let finalOutput;
    let finalTestType;

    // Get perftest file location value
    let perftestFileDOM = document.querySelector('#perftestLocation');
    let perftestFilePath;

    if(perftestFileDOM.value == ''){
        showError('Please select where you perftest_java.bat file is located.');
    }else{
        perftestFilePath = perftestFileDOM.files[0].path;
    }

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
    let domainValue;
    if(domainID < 0){
        showError("Domain ID can't be negative.");
        domainValue = '-domain 1';
    }else if(domainID !== ''){
        domainValue = `-domain ${domainID}`;
    }else{
        domainValue = '-domain 1';
    }

    // Get keyed value
    let keyed = document.querySelector('#keyed').name;
    let keyedValue;
    keyed === 'close-circle-outline' ? keyedValue = '' : keyedValue = '-keyed';
    
    // Get instances value
    let instances = document.querySelector('#instances').value;
    let instancesValue;
    
    if(keyedValue == ''){
        instancesValue = `-instances ` + 1;
    }else{
        if(instances == ''){
            instancesValue = `-instances ` + 1;
        }else{
            instancesValue = `-instances ` + instances;
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
    let qosFileInput = document.querySelector('#qosFile').value;
    let qosFileInputValue;
    let qosFileInputValueText;

    // Check they selected a file
    if(qosFileInput !== ''){
        qosFileInput = document.querySelector('#qosFile');
        qosFileInputValue = qosFileInput.files[0].path;
        qosFileInputValueText = `-qosFile '${qosFileInputValue}'`;
    }else{
        qosFileInputValueText = '';
    }

    // console.log(`qosFileInputValueText: [${qosFileInputValueText}]`);

    // Get use read thread value
    let useReadThread = document.querySelector('#useReadThread').name;
    let useReadThreadValue;
    useReadThread === 'close-circle-outline' ? useReadThreadValue = '' : useReadThreadValue = '-useReadThread';

    // Get wait set delay value
    let waitSetDelay = document.querySelector('#waitSetDelay').value;
    let waitSetDelayValue;

    // Check if delay is set
    if(waitSetDelay !== ''){
        if(waitSetDelay < 0){
            showError('Delay has to be greater than zero.');
            waitSetDelayValue = ``;
        }else{
            waitSetDelayValue = `-waitsetDelayUsec ${waitSetDelay}`;
        }
    }else{
        waitSetDelayValue = '';
    }

    // Get wait set event count value
    let waitSetEvent = document.querySelector('#waitSetEventCount').value;
    let waitSetEventValue;

    // Check if count is set
    if(waitSetEvent !== ''){
        if(waitSetEvent < 1){
            showError('Set Event Count has to be greater than 0.');
            waitSetEventValue = '';
        }else{
            waitSetEventValue = `-waitSetEventCount ${waitSetEvent}`;
        }
    }else{
        waitSetEventValue = '';
    }

    // Get Asynchronous value
    let async = document.querySelector('#asynchronous').name;
    let asyncValue;
    async === 'close-circle-outline' ? asyncValue = '' : asyncValue = '-asynchronous';

    // Get display cpu value
    let cpu = document.querySelector('#cpu').name;
    let cpuValue;
    cpu === 'close-circle-outline' ? cpuValue = '' : cpuValue = '-cpu';

    // Make string for general settings
    let generalSettingsValue = `${bestEffortValue} ${dataLenValue} ${verbosityValue} ${dynamicValue} ${durabilityValue} ${domainValue} ${keyedValue} ${instancesValue} ${multicastValue} ${multicastAddressValue} ${directCommunicationValue} ${noPositiveAcksValue} ${printIntervalsValue} ${qosFileInputValueText} ${useReadThreadValue} ${waitSetDelayValue} ${waitSetEventValue} ${asyncValue} ${cpuValue}`;

    let testType = document.querySelector('#type-select').value;

    if(testType === 'publisher'){
        // Get batch size value
        let batchSize = document.querySelector('#batchSize').value;
        let batchSizeValue;

        if(batchSize == ''){
            batchSizeValue = '-batchSize 0';
        }else{
            batchSizeValue = `-batchSize ${batchSize}`;
        }

        // Get enableAutoThrottle value
        let enableAutoThrottle = document.querySelector('#enableAutoThrottle').name;
        let enableAutoThrottleValue;

        enableAutoThrottle === 'close-circle-outline' ? enableAutoThrottleValue = '' : enableAutoThrottleValue = '-enableAutoThrottle';

        // Get enableTurboMode value
        let enableTurboMode = document.querySelector('#enableTurboMode').name;
        let enableTurboModeValue;

        enableTurboMode === 'close-circle-outline' ? enableTurboModeValue = '' : enableTurboModeValue = '-enableTurboMode';

        // Get execution time value
        let executionTime = document.querySelector('#executionTime').value;
        let executionTimeValue;

        if(executionTime === ''){
            executionTimeValue = '-executionTime 0';
        }else if(executionTime !== ''){
            executionTimeValue = `-executionTime ${executionTime}`;
        }else{
            console.error('Problem with execution time part thingy majingy.');
        }

        // Get execution time value
        let numIter = document.querySelector('#numIter').value;
        let numIterValue;

        if(numIter === ''){
            numIterValue = '-numIter 0';
        }else if(numIter !== ''){
            numIterValue = `-numIter ${numIter}`;
        }else{
            console.error('Problem with num iter part thingy majingy.');
        }

        // Get latencyTest value
        let latencyTest = document.querySelector('#latencyTest').name;
        let latencyTestValue;

        latencyTest === 'close-circle-outline' ? latencyTestValue = '' : latencyTestValue = '-latencyTest';

        // Get latencyCount value
        let latencyCount = document.querySelector('#latencyCount').value;
        let latencyCountValue;

        if(latencyCount === ''){
            latencyCountValue = '-latencyCount -1';
        }else if(latencyCount !== ''){
            latencyCountValue = `-latencyCount ${latencyCount}`;
        }else{
            console.error('Problem with latency count part thingy majingy.');
        }               

        // Get number of subscribers value
        let numSubscribers = document.querySelector('#numSubscribers').value;
        let numSubscribersValue;

        if(numSubscribers == ''){
            numSubscribersValue = '-numSubscribers 1';
        }else{
            numSubscribersValue = `-numSubscribers ${numSubscribers}`;
        }

        // Get publisher id value
        let pid = document.querySelector('#pid').value;
        let pidValue;

        if(pid == ''){
            pidValue = '-pidMultiPubTest 0';
        }else{
            pidValue = `-pidMultiPubTest ${pid}`;
        }

        // Get sendQueueSize value
        let sendQueueSize = document.querySelector('#sendQueueSize').value;
        let sendQueueSizeValue;

        if(sendQueueSize == ''){
            sendQueueSizeValue = '-sendQueueSize 50';
        }else{
            sendQueueSizeValue = `-sendQueueSize ${sendQueueSize}`;
        }

        // Get sleep time value
        let sleep = document.querySelector('#sleep').value;
        let sleepValue;

        if(sleep === ''){
            sleepValue = '-sleep 0';
        }else{
            sleepValue = `-sleep ${sleep}`;
        }

        // Get write instance value
        let writeInstance = document.querySelector('#writeInstance').value;
        let writeInstanceValue;

        if(writeInstance == ''){
            writeInstanceValue = '';
        }else{
            writeInstanceValue = `-writeInstance ${writeInstance}`;
        }

        let pubOutput = `-pub ${batchSizeValue} ${enableAutoThrottleValue} ${enableTurboModeValue} ${executionTimeValue} ${numIterValue} ${latencyTestValue} ${latencyCountValue} ${numSubscribersValue} ${pidValue} ${sendQueueSizeValue} ${sleepValue} ${writeInstanceValue}`;

        finalOutput = `"${perftestFilePath}" ${generalSettingsValue} ${pubOutput}`;
        finalTestType = 'pub';

    }else if(testType === 'subscriber'){

        // Get number of publishers value
        let numPublisher = document.querySelector('#numPublisher').value;
        let numPublisherValue;

        if(numPublisher == ''){
            numPublisherValue = '-numPublishers 1';
        }else{
            numPublisherValue = `-numPublishers ${numPublisher}`;
        }

        // Get subscriber id value
        let sid = document.querySelector('#sid').value;
        let sidValue;

        if(sid == ''){
            sidValue = '-sidMultiSubTest 1';
        }else{
            sidValue = `-sidMultiSubTest ${sid}`;
        }

        let subOutput = `-sub ${numPublisherValue} ${sidValue}`;

        finalOutput = `"${perftestFilePath}" ${generalSettingsValue} ${subOutput}`;
        finalTestType = 'sub';
    }else{
        console.error(`Can't decide test type.`);
    }

    let saveLocationDOM = document.querySelector('#saveLocation');
    
    if(saveLocationDOM.value == ''){
        showError('Please select somewhere to store the file.');
    }else{
        let saveLocationPath = document.querySelector('#saveLocation').files[0].path;
        createFile(finalOutput, `${saveLocationPath}\\${finalTestType}.bat`);
    }

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
// Set file name placeholder depending on test type
// WORKING
$('#type-select').on('change', (e) => {
    let fileName = document.querySelector('#fileName');

    if(e.target.value == 'subscriber'){
        $('#publisher-settings').hide();
        $('#subscriber-settings').show();
        fileName.setAttribute('placeholder', 'sub');
    }else{
        $('#subscriber-settings').hide();
        $('#publisher-settings').show();
        fileName.setAttribute('placeholder', 'pub');
    }

});

// -------------------- FUNCTION DEFINITIONS --------------------

function showError(errorMessage){
    hasError = true;
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

function isChecked(name){
    if(name === 'close-circle-outline'){
        return false;
    }else{
        return true;
    }
}

function createFile(output, path){
    fs.writeFile(path, output, err => err ? console.log(`error creating file: ${err}`) : console.log('file created successfully'));
}