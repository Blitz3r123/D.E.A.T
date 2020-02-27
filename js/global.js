const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// GLOBAL VARIABLES
var hasError;

// START UP

// HIDE ALL WINDOWS EXCEPT INDEX
$('#createContent').hide();
$('#createTestContent').hide();
// $('#runContent').hide();
$('#indexContent').hide();
$('#analyseContent').hide();
$('#settingsContent').hide();

// Hide popup view
$('#popup').hide();

// Hide analyse window on start
// WORKING
$('.analysis-window').hide();

// Hide perftest location setting on start
$('#perftestLocationSetting').hide();

// Hide error message pop up
// WORKING
$('#error-message').hide();

// Hide selection window on start
// WORKING
$('.selection-window').hide();

// Hide subscriber settings on start
// WORKING
$('#subscriber-settings').hide();

// Hide instances settings on start
// WORKING
$('#instances-setting').hide();

// Hide create test instances settings on start
$('#createTestInstancesSetting').hide();

// Hide multicast address on start
// WORKING
$('#multicastAddress-setting').hide();

// ----------------- END OF START UP ----------------

// --------------- START OF EVENTS ------------------

// Toggle between set event count and set event delay
/*
    If setEventCount is changed, disable setDelay.
    If setDelay is changed, disable setEventCount.
*/
$('#waitSetDelay').keyup(() => {
    let waitSetDelayDOM = document.querySelector('#waitSetDelay');
    let waitSetEventCountDOM = document.querySelector('#waitSetEventCount');

    if(waitSetDelayDOM.value != ''){
        waitSetEventCountDOM.disabled = true;
    }else{
        waitSetEventCountDOM.disabled = false;
    }
});
// Look at above description
$('#waitSetEventCount').keyup(() => {
    let waitSetDelayDOM = document.querySelector('#waitSetDelay');
    let waitSetEventCountDOM = document.querySelector('#waitSetEventCount');

    if(waitSetEventCountDOM.value != ''){
        waitSetDelayDOM.disabled = true;
    }else{
        waitSetDelayDOM.disabled = false;
    }
});

// Hide popup when you click the 'x'
$('#popup').on('click', e => {
    $('#popup').hide();
});

// Show add run window when pressed
$('#addTab').on('click', e => {
    $('.selection-window').show();
});

// Close selection window when x is pressed
$('.selection-close-button').on('click', e => {
    $('.selection-window').hide();
});

/*
    SEARCH TAGS:
    STATUS: In Progress
    DESCRIPTION: Adds publisher to create test and also writes to file
*/
$('#addPublisher').on('click', e => {
    // Read createTestData file to see current test
    let createTestData = JSON.parse(fs.readFileSync(__dirname + '/../data/CreateTest.json', 'utf8'));

    let currentCreateTestData = createTestData.currentCreateTest;

    currentCreateTestData.publisherAmount ++;

    let publisherList = document.querySelector('#createTestPublishers');

    let p = document.createElement('p');
    p.className = "test-publisher";
    // p.textContent = "Publisher 1";
    
    let input = document.createElement('input');
    input.type = "text";
    input.className = "publisher-input";
    input.placeholder = "Publisher Name";

    let trashIcon = document.createElement('ion-icon');
    trashIcon.name = "trash";

    p.appendChild(input);
    p.appendChild(trashIcon);
    
    publisherList.appendChild(p);

    // <p class="test-publisher">Publisher 1 <ion-icon name="trash"></ion-icon></p>

    createTestData.currentCreateTest = currentCreateTestData;

    fs.writeFile(__dirname + '/../data/CreateTest.json', JSON.stringify(createTestData), err => {
        if(err) throw err;
        console.log("File Saved");
    });
});

/*

    SEARCH TAGS: search function, search feature, search, search setting input, searcher, searching
    STATUS: In Progress
    DESCRIPTION: Searches for a setting so that user can easily change a certain setting

*/
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

/*

    SEARCH TAGS: latency test, latency, latency count, disable latency, disabling function
    STATUS: Complete
    DESCRIPTION: Changes/Disables latency count setting depending on if latency test option is ticked or not

*/
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

/*

    SEARCH TAGS: executionTime, execution time, numIter, iteration number, number of iterations, disabling function, disable numIter, disable executionTime
    STATUS: Complete
    DESCRIPTION: Either disables execution time or iteration number depending on what is chosen

*/
$('#executionTime').on('keyup', () => {
    let executionTimeDOM = document.querySelector('#executionTime');
    let numIterDOM = document.querySelector('#numIter');

    if(executionTimeDOM.value !== ''){
        numIterDOM.setAttribute('disabled', 'true');
    }else{
        numIterDOM.removeAttribute('disabled');
    }
});

/*

    SEARCH TAGS: numIter, disable execution time, executionTime, iteration number, execution time
    STATUS: Complete
    DESCRIPTION: Toggles execution time depending on whether numIter is set or not

*/
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

/*

    SEARCH TAGS: main function, create, creation, test creation
    STATUS: Complete
    DESCRIPTION: Creates the test scripts

    For all checkboxes:
        FALSE = close-circle-outline
        TRUE = checkmark-circle-outline

*/
$('#createButton').on('click', () => {
    let finalOutput;
    let finalTestType;

    // Get perftest file location value
    let perftestFileDOM = document.querySelector('#perftestLocation');
    let perftestFilePath;

    // Check if user wants to use custom location for perftest
    // == none means user will use local location
    if(document.querySelector('#perftestLocationSetting').style.display == 'none'){
        perftestFilePath = 'perftest_java.bat';
    }else{
        if(perftestFileDOM.value == ''){
            showError('Please select where you perftest_java.bat file is located.');
        }else{
            perftestFilePath = perftestFileDOM.files[0].path;
        }
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

    // Get file name
    let fileNameDOM = document.querySelector('#fileName');
    let fileName;
    // Check if empty
    if(fileNameDOM.value === ''){
        fileName = finalTestType;
    }else{
        fileName = fileNameDOM.value;
    }

    let saveLocationDOM = document.querySelector('#saveLocation');
    
    if(saveLocationDOM.value == ''){
        showError('Please select somewhere to store the file.');
    }else{
        let saveLocationPath = document.querySelector('#saveLocation').files[0].path;
        createFile(finalOutput, `${saveLocationPath}/${fileName}.bat`);
        showPopup('File created!');
    }

});

$('#useCustomLocation').on('click', (e) => {
    if(e.target.getAttribute('name') == 'close-circle-outline'){
        $('#perftestLocationSetting').show();
    }else{
        $('#perftestLocationSetting').hide();
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

// Show instances when keyed is true on create test page
// IN PROGRESS
$('#createTestKeyed').on('click', e => {
    if(e.target.getAttribute('name') == 'close-circle-outline'){
        $('#createTestInstancesSetting').show();
    }else{
        $('#createTestInstancesSetting').hide();
    }
});

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

// ---------------------------------------------------------------------------------------------------------------------------------------------
// FUNCTION DEFINITIONS ------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------

/*

    SEARCH TAGS: reset, reset values, reset test script
    STATUS: In Progress
    DESCRIPTION: Resets test script options

*/
function resetValues(){
    console.log("hello");
}

function createPublisher(){
    let typeSelectDOM = document.querySelector('#type-select');
    let fileNameDOM = document.querySelector('#fileName');

    typeSelectDOM.selectedIndex = 0;                    // Select subscriber as test type dropdown
    fileNameDOM.setAttribute('placeholder', 'pub');     // Set file name placeholder to sub

    showContent('#createContent');                      // Show create content

    $('#publisher-settings').show();
    $('#subscriber-settings').hide();
}

function createSubscriber(){
    let typeSelectDOM = document.querySelector('#type-select');
    let fileNameDOM = document.querySelector('#fileName');

    typeSelectDOM.selectedIndex = 1;                    // Select subscriber as test type dropdown
    fileNameDOM.setAttribute('placeholder', 'sub');     // Set file name placeholder to sub

    showContent('#createContent');                      // Show create content

    $('#publisher-settings').hide();
    $('#subscriber-settings').show();

}

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
    $('#createTestContent').hide();
    $('#runContent').hide();
    $('#analyseContent').hide();
    $('#settingsContent').hide();

    // Check for data if content is #createTestContent
    // readCreateTestData('./../data/CreateTest.json');

    // Show parameter content
    $(content).show();
}

function readCreateTestData(path){
    var createTestData = JSON.parse(fs.readFileSync(path, 'utf8'));

    createTestData.allTests.forEach(test => {
        console.log(test);
    });

    console.log(createTestData.allTests);
}

function isChecked(name){
    if(name === 'close-circle-outline'){
        return false;
    }else{
        return true;
    }
}

function createFile(output, path){
    fs.writeFile(path, output, err => err ? console.log(`error creating file: ${err}`) : console.log(`%c Created file at \n ${path}`, 'color: blue;'));
}

function showPopup(message){
    let popup = document.querySelector('#popup');
    let popupMessage = document.querySelector('#popup-message');

    popupMessage.textContent = message;
    $('#popup').show();
}

// Takes in the folder path and returns its files (not as paths - just its names)
function readFolder(pathVal){
    let theFiles = [];

    if(fs.lstatSync(pathVal).isDirectory()){
        fs.readdirSync(pathVal).forEach(file => theFiles.push(file));
    }

    return theFiles;
}

function readData(path){
    let data = fs.readFileSync(path);

    return JSON.parse(data);
}

function normaliseString(string){
    return string.replace(/\s/g, "^");
}

function unnormaliseString(string){
    return string.replace(/\^/g, " ");
}

function removeWhiteSpaces(string){
    return string.replace(/\s/g, "");
}

function removePeriods(string){
    return string.replace(/\./g, "");;
}

function removeForwardSlashes(string){
    return string.replace(/\//g, "");
}

// Removes white spaces, periods and forward slashes
function stringate(string){
    return removeWhiteSpaces( removePeriods( removeForwardSlashes(string) ) );
}

function deleteFolder(pathVal){
    if(fs.existsSync(pathVal)){
        fs.readdirSync(pathVal).forEach( (file, index) => {
            var currentPath = path.join(pathVal, file);

            if(fs.lstatSync(currentPath).isDirectory()){
                deleteFolder(currentPath);
            }else{
                fs.unlinkSync(currentPath);
            }

        } );
    }

    fs.rmdirSync(pathVal);
}

function clearList(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}

function createPubBatOutput(perftestLoc, generalSettings, publisherSettings){
    let generalOutput = '';

    generalSettings.forEach(item => {
        if(item.title == 'Best Effort'){
            item.value ? generalOutput += ' -bestEffort ' : generalOutput += '';
        }else if(item.title == 'Data Length (bytes)'){
            generalOutput += ' -dataLen ' + item.value;
        }else if(item.title == 'Verbosity'){
            generalOutput += ' -verbosity ' + item.value;
        }else if(item.title == 'Dynamic Data'){
            item.value ? generalOutput += ' -dynamicData ' : generalOutput += '';
        }else if(item.title == 'Durability'){
            generalOutput += ' -durability ' + item.value;
        }else if(item.title == 'Domain ID'){
            generalOutput += ' -domain ' + item.value;
        }else if(item.title == 'Keyed Data'){
            item.value ? generalOutput += ' -keyed' : generalOutput += '';
        }else if(item.title == 'Multicast'){
            item.value ? generalOutput += ' -multicast' : generalOutput = generalOutput;
        }else if(item.title == 'Direct Communication'){
            item.value ? generalOutput += '' : generalOutput += ' -noDirectCommunication ';
        }else if(item.title == 'Positive Acknowledgements'){
            item.value ? generalOutput += '' : generalOutput += ' -noPositiveAcks ';
        }else if(item.title == 'Print Interval'){
            item.value ? generalOutput += '' : generalOutput += ' -noPrintIntervals ';
        }else if(item.title == 'Custom QOS File'){
            generalOutput += ' -qosProfile ' + item.value;
        }else if(item.title == 'Use Read Thread'){
            item.value ? generalOutput += ' -useReadThread ' : generalOutput = generalOutput;
        }else if(item.title == 'Wait Set Delay (Microseconds)'){
            generalOutput += ' -waitSetDelayUSec ' + item.value;
        }else if(item.title == 'Wait Set Event Count'){
            generalOutput += ' -waitSetEventCount ' + item.value;
        }else if(item.title == 'Asynchronous'){
            item.value ? generalOutput += ' -asynchronous ' : generalOutput = generalOutput;
        }else if(item.title == 'Display CPU'){
            item.value ? generalOutput += ' -cpu ' : generalOutput = generalOutput;
        }
    });

    let publisherOutput = ' -pub ';
    publisherSettings.forEach(item => {
        if(item.title == 'Batch Size'){
            publisherOutput += ' -batchSize ' + item.value;
        }else if(item.title == 'Enable Auto Throttle'){
            item.value ? publisherOutput += ' -enableAutoThrottle ' : publisherOutput = publisherOutput;
        }else if(item.title == 'Enable Turbo Mode'){
            item.value ? publisherOutput += ' -enableTurboMode ' : publisherOutput = publisherOutput;
        }else if(item.title == 'Execution Time (s)'){
            publisherOutput += ' -executionTime ' + item.value;
        }else if(item.title == 'Number of Iterations'){
            publisherOutput += ' -numIter ' + item.value;
        }else if(item.title == 'Latency Test'){
            item.value ? publisherOutput += ' -latencyTest ' : publisherOutput = publisherOutput;
        }else if(item.title == 'Latency Count'){
            publisherOutput += ' -latencyCount ' + item.value;           
        }else if(item.title == 'Number of Subscribers'){
            publisherOutput += ' -numSubscribers ' + item.value;
        }else if(item.title == 'Publisher ID'){
            publisherOutput += ' -pidMultiPubTest ' + item.value;
        }else if(item.title == 'Send-queue Size'){
            publisherOutput += ' -sendQueueSize ' + item.value;
        }else if(item.title == 'Sleep Time (Milliseconds)'){
            publisherOutput += ' -sleep ' + item.value;
        }else if(item.title == 'Instance Number'){
            publisherOutput += ' -writeInstance ' + item.value;
        }
    });

    return `"${perftestLoc}" ${generalOutput} ${publisherOutput}`;
}

function createSubBatOutput(perftestLoc, generalSettings, subscriberSettings){
    let generalOutput = '';

    generalSettings.forEach(item => {
        if(item.title == 'Best Effort'){
            item.value ? generalOutput += ' -bestEffort ' : generalOutput += '';
        }else if(item.title == 'Data Length (bytes)'){
            generalOutput += ' -dataLen ' + item.value;
        }else if(item.title == 'Verbosity'){
            generalOutput += ' -verbosity ' + item.value;
        }else if(item.title == 'Dynamic Data'){
            item.value ? generalOutput += ' -dynamicData ' : generalOutput += '';
        }else if(item.title == 'Durability'){
            generalOutput += ' -durability ' + item.value;
        }else if(item.title == 'Domain ID'){
            generalOutput += ' -domain ' + item.value;
        }else if(item.title == 'Keyed Data'){
            item.value ? generalOutput += ' -keyed' : generalOutput += '';
        }else if(item.title == 'Multicast'){
            item.value ? generalOutput += ' -multicast' : generalOutput = generalOutput;
        }else if(item.title == 'Direct Communication'){
            item.value ? generalOutput += '' : generalOutput += ' -noDirectCommunication ';
        }else if(item.title == 'Positive Acknowledgements'){
            item.value ? generalOutput += '' : generalOutput += ' -noPositiveAcks ';
        }else if(item.title == 'Print Interval'){
            item.value ? generalOutput += '' : generalOutput += ' -noPrintIntervals ';
        }else if(item.title == 'Custom QOS File'){
            generalOutput += ' -qosProfile ' + item.value;
        }else if(item.title == 'Use Read Thread'){
            item.value ? generalOutput += ' -useReadThread ' : generalOutput = generalOutput;
        }else if(item.title == 'Wait Set Delay (Microseconds)'){
            generalOutput += ' -waitSetDelayUSec ' + item.value;
        }else if(item.title == 'Wait Set Event Count'){
            generalOutput += ' -waitSetEventCount ' + item.value;
        }else if(item.title == 'Asynchronous'){
            item.value ? generalOutput += ' -asynchronous ' : generalOutput = generalOutput;
        }else if(item.title == 'Display CPU'){
            item.value ? generalOutput += ' -cpu ' : generalOutput = generalOutput;
        }
    });

    let subscriberOutput = ' -sub ';
    subscriberSettings.forEach(item => {
        if(item.title == 'Subscriber ID'){
            subscriberOutput += ' -sidMultiSubTest ' + item.value;
        }else if(item.title == 'Number of Publishers'){
            subscriberOutput += ' -numPublishers ' + item.value;
        }
    });

    return `"${perftestLoc}" ${generalOutput} ${subscriberOutput}`;
}
