// $('#create-test-index').hide();
$('#create-test-settings').hide();
$('.test-list-content .empty-message').hide();

populateTestList();

function viewSettings(event){
    console.log(event.target.parentElement.firstChild);
}

function resetPubSubInput(){
    let pubInput = document.querySelector('#pub-list-input');
    let subInput = document.querySelector('#sub-list-input');
    
    pubInput.value = '';
    subInput.value = '';
}

function changeFileTab(event){
    resetPubSubInput();
    let fileName = event.target.textContent;

    // Reset classnames of all file tabs
    let fileTabList = document.querySelector('.file-tab-container');
    fileTabList.childNodes.forEach(child => {
        child.className = 'file-tab-item';
    });

    let index = parseInt(fileName.replace(/File/g, ''));

    document.querySelector('#create-test-settings').setAttribute('fileIndex', index);

    event.target.className = 'file-tab-item active-file-tab-item';

    // Update view of pub/sub list here
    /*
        Read config file
        Look at current file with current fileIndex
        See how many publishers there are 
        See how many subscribers there are
    */
    let testConfigFolder = document.querySelector('#create-test-settings').attributes.path.value;
    let testConfigPath = path.join( testConfigFolder, path.basename(testConfigFolder) + '.json' );

    let testConfig = readData(testConfigPath);
    let fileConfig = testConfig.files[index - 1];
    
    let listdom = document.querySelector('#pub-list');
    while(listdom.firstChild){
        listdom.removeChild(listdom.firstChild);
    }

    fileConfig.publishers.forEach((pub, index) => {
        let item = createPubListItem(index, pub.title);
        listdom.appendChild(item);
    });
    
    listdom = document.querySelector('#sub-list');
    while(listdom.firstChild){
        listdom.removeChild(listdom.firstChild);
    }

    fileConfig.subscribers.forEach((sub, index) => {
        let item = createSubListItem(index, sub.title);
        listdom.appendChild(item);
    });

    // for(var i = 1; i < parseInt(fileConfig.subscriberAmount) + 1; i++){
    //     let item = createSubListItem(i);
    //     listdom.appendChild(item);
    // }

}

// Update repetition count when changes
$('#test-rep-input').on('keyup', e => {
    let data = document.querySelector('#create-test-settings').attributes;
    let testFolderPath = data.path.value;
    let fileIndex = data.fileIndex.value;

    updateRepCount(e.target.value, testFolderPath, fileIndex);
});

function updateRepCount(value, pathval, fileIndex){
    /*
        Get config of file
        Update config values
        Rewrite config values of file
    */
    let testFilePath = path.join( pathval, path.basename(pathval) + '.json' );

    let config = readData(testFilePath);

    if(value == '' || value ==  0){
        value = 1;
    }

    config.repetitionAmount = parseInt(value);

    fs.writeFile(testFilePath, JSON.stringify(config), err => err ? console.log(err) : console.log('Written to ' + testFilePath));

}

// Update publisher list when user enters in value
$('#sub-list-input').on('keyup', e => {
    let listdom = document.querySelector('#sub-list');
    let amount = parseInt(e.target.value);
    let data = document.querySelector('#create-test-settings').attributes;

    let fileConfig = readData( path.join( data.path.value, path.basename(data.path.value) + '.json' ) ).files[data.fileIndex.value - 1];

    while(listdom.firstChild){
        listdom.removeChild(listdom.firstChild);
    }

    if(amount == 0 || amount == '' || isNaN(amount)){
        while(listdom.firstChild){
            listdom.removeChild(listdom.firstChild);
        }
    }

    for(var i = 1; i < amount + 1; i++){
        let item = createSubListItem(i, 'Subscriber ' + i);
        listdom.appendChild(item);
    }

    updateSubConfigObj(data.path.value, amount, data.fileIndex.value);
});

function updateSubConfigObj(testFolderPath, amount, fileIndex){
    if(isNaN(amount)){
        amount = 0;
    }
    amount = parseInt(amount);
    fileIndex -= 1;

    let testConfigFile = path.join(testFolderPath, path.basename(testFolderPath) + '.json');

    let testConfig = readData(testConfigFile);

    testConfig.files[fileIndex].subscriberAmount = amount;

    // Reset list
    testConfig.files[fileIndex].subscribers = [];

    for(i = 1; i < amount + 1; i++){
        testConfig.files[fileIndex].subscribers.push(createSubSettingsObj( 'Subscriber ' + i ));
    }

    fs.writeFile(testConfigFile, JSON.stringify(testConfig), err => err ? console.log(err) : console.log(''));
};

// Update publisher list when user enters in value
$('#pub-list-input').on('keyup', e => {
    let listdom = document.querySelector('#pub-list');
    let amount = parseInt(e.target.value);
    let data = document.querySelector('#create-test-settings').attributes;

    if(amount == 0 || amount == '' || isNaN(amount)){
        while(listdom.firstChild){
            listdom.removeChild(listdom.firstChild);
        }
    }

    for(var i = 1; i < amount + 1; i++){
        // Create pub list item dom
        let item = createPubListItem(i, 'Publisher ' + i);
        listdom.appendChild(item);
    }

    updatePubConfigObj(data.path.value, amount, data.fileIndex.value);
});

function updatePubConfigObj(testFolderPath, amount, fileIndex){
    if(isNaN(amount)){
        amount = 0;
    }
    amount = parseInt(amount);
    fileIndex -= 1;
    let testConfigFile = path.join(testFolderPath, path.basename(testFolderPath) + '.json');

    let testConfig = readData(testConfigFile);

    testConfig.files[fileIndex].publisherAmount = amount;

    // Reset list
    testConfig.files[fileIndex].publishers = [];

    for(i = 1; i < amount + 1; i++){
        testConfig.files[fileIndex].publishers.push(createPubSettingsObj( 'Publisher ' + i ));
    }

    fs.writeFile(testConfigFile, JSON.stringify(testConfig), err => err ? console.log(err) : console.log(''));

};

$('#test-list-folder-selection-input').on('change', e => {
    populateTestList(e.target.files[0].path);
});

function editListItem(event){
    let inputdom = document.createElement('input');
    inputdom.type = 'text';
    inputdom.value = event.target.textContent;
    inputdom.className = 'pub-sub-list-item-title';
    inputdom.addEventListener('keyup', e => editListItemSetting(e));
    inputdom.id = event.target.id;

    event.target.parentElement.replaceChild(inputdom, event.target.parentElement.firstChild);
}

function editListItemSetting(event){
    let newValue = event.target.value;
    let itemId = event.target.id;
    let data = document.querySelector('#create-test-settings').attributes;

    let testConfig = readData( path.join( data.path.value, path.basename(data.path.value) + '.json' ) );
    let fileConfig = testConfig.files[data.fileIndex.value - 1];

    if(itemId.includes('Publisher ')){
        itemId = itemId.replace('Publisher ', '');
    }else{
        itemId = itemId.replace('Subscriber ', '');
    }

    fileConfig.publishers[itemId].title = newValue;

    fs.writeFile(path.join( data.path.value, path.basename( data.path.value ) + '.json' ), JSON.stringify(testConfig), err => err ? console.log(err) : console.log(''));

    // console.log(fileConfig.publishers[itemId].title);
}

function deleteListItem(event){
    let listdom = event.target.parentElement.parentElement;
    let listitemdom = event.target.parentElement;
    listdom.removeChild(listitemdom);
}

function createSubListItem(index, title){
    let divdom = document.createElement('div');
    divdom.className = 'pub-sub-list-item';

    let spandom = document.createElement('span');
    spandom.className = 'pub-sub-list-item-title';
    spandom.textContent = title;
    spandom.id = index;
    spandom.addEventListener('click', e => editListItem(e));

    let icondom = document.createElement('ion-icon');
    icondom.name = 'trash';
    icondom.addEventListener('click', e => deleteListItem(e));

    divdom.appendChild(spandom);
    divdom.appendChild(icondom);

    return divdom;

}

function createPubListItem(index, title){
    let divdom = document.createElement('div');
    divdom.className = 'pub-sub-list-item';

    let spandom = document.createElement('span');
    spandom.className = 'pub-sub-list-item-title';
    spandom.textContent = title;
    spandom.id = index;
    spandom.addEventListener('click', e => editListItem(e));

    let viewIconDom = document.createElement('ion-icon');
    viewIconDom.name = 'eye';
    viewIconDom.addEventListener('click', e => viewSettings(e));

    let icondom = document.createElement('ion-icon');
    icondom.name = 'trash';
    icondom.addEventListener('click', e => deleteListItem(e));

    divdom.appendChild(spandom);
    divdom.appendChild(viewIconDom);
    divdom.appendChild(icondom);

    return divdom;

}

function createNewTest(){
    let nameInput = document.querySelector('#create-new-test-name');
    let fileAmountInput = document.querySelector('#create-new-test-file-amount');
    let fileLocationInput = document.querySelector('#create-new-test-file-location');

    let saveLocation;

    if(nameInput.value == ''){
        showPopup("Test Name is empty!");
    }else if(fileAmountInput.value == ''){
        showPopup("Number of Files empty.");
    }else{
        if(fileAmountInput.value <= 0){
            showPopup("Need to have at least 1 file!");
        }else{

            if(fileLocationInput.files.length == 0){
                saveLocation = readData( path.join( __dirname, '../data/GeneralSettings.json' ) ).testFolderLoc;
            }else{
                saveLocation = fileLocationInput.files[0].path;
            }

            let testName = nameInput.value;
            let fileAmount = parseInt(fileAmountInput.value);
            
            // Check test folder doesn't already exist
            if(!fs.existsSync( path.join( saveLocation, testName ) )){
                fs.mkdirSync( path.join( saveLocation, testName ) );
                
                let newFolder = path.join( saveLocation, testName );
                
                let config = createTestConfigObj(testName, fileAmount);

                for(var i = 1; i < fileAmount + 1; i++){
                    let batFileLocation = path.join( newFolder, 'File ' + i + '.bat');
                    createFile('', batFileLocation);
                }
                
                createFile(JSON.stringify(config), path.join( newFolder, testName + '.json' ));
                
                populateFileTabs(newFolder, fileAmount);

                // console.log(newFolder);

                // Redirect to file settings page here
                $('#create-test-index').hide();
                document.querySelector('#create-test-settings').setAttribute('path', newFolder);
                document.querySelector('#create-test-settings').setAttribute('fileAmount', fileAmountInput.value);
                document.querySelector('#create-test-settings').setAttribute('fileIndex', 1);

                createNewFileList(fileAmount);

                $('#create-test-settings').show();

            }else{
                showPopup("Test already exists with that name in that location!");
            }

        }
    }
}

function createTestConfigObj(name, amount){
    let mainConfig = {
        "title": name,
        "repetitionAmount": 1,
        "fileAmount": parseInt(amount),
        "files": []
    };

    for(var i = 1; i < parseInt(amount) + 1; i++){
        let fileObj = {
            "publisherAmount": 0,
            "subscriberAmount": 0,
            "publishers": [],
            "subscribers": []
        };
        mainConfig.files.push(fileObj);
    }

    return mainConfig;
}

function createNewFileList(amount){
    let fileListDom = document.querySelector('.file-tab-container');

    // Clear list first
    while(fileListDom.firstChild){
        fileListDom.removeChild(fileListDom.firstChild);
    }

    for(var i = 1; i < parseInt(amount) + 1; i++){
        let pdom = document.createElement('p');
        
        if(i == 1){
            pdom.className = 'file-tab-item active-file-tab-item';
        }else{
            pdom.className = 'file-tab-item';
        }

        pdom.textContent = 'File ' + i;

        fileListDom.appendChild(pdom);

    }

}

function populateTestList(pathValue){
    /*
        - Read GeneralSettings.json
        - Get path for test folder location
        - Read directory of test folder location
        - Check if each folder has a .json file
        - If folder does add it to list and set an attribute as its path
    */

    let listOutput = [];

    let listDom = document.querySelector('.test-list-content');

    while(listDom.firstChild){
        listDom.removeChild(listDom.firstChild);
    }

    let genSetting = readData( path.join(__dirname, '../data/GeneralSettings.json') );
    let testFolderLocPath = genSetting.testFolderLoc;

    if(pathValue != undefined){
        testFolderLocPath = pathValue;
    }
    
    let contents = readFolder(testFolderLocPath);

    contents.forEach(item => {
        let itemContents = readFolder(path.join( testFolderLocPath, item ));

        itemContents.forEach(content => {
            if(path.extname(content) == '.json'){
                listOutput.push(item);
            }
        });
    });

    // Taken from: https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
    listOutput = listOutput.filter((v, i, a) => a.indexOf(v) === i); 

    if(listOutput.length > 0){
        $('.test-list-content .empty-message').hide();
        listOutput.forEach(item => {
            listDom.appendChild(createTestListItem(item, path.join( testFolderLocPath, item )));
        });
    }else{
        $('.test-list-content .empty-message').show();
    }

}

function deleteTest(event){
    let testFolderPath = event.target.parentElement.attributes.path.value;

    deleteFolder(testFolderPath);

    // console.log(testFolderPath + ' removed!');

    populateTestList();
}

function createTestListItem(title, pathValue){
    let pdom = document.createElement('p');
    
    pdom.className = 'test-list-item';

    pdom.setAttribute('path', pathValue);

    let spandom = document.createElement('span');
    spandom.textContent = title;
    spandom.addEventListener('click', e => {openTestSettings(e.target.parentElement)});

    pdom.appendChild(spandom);

    let ionicondom = document.createElement('ion-icon');
    ionicondom.name = 'trash';
    ionicondom.addEventListener('click', e => {deleteTest(e)});

    pdom.appendChild(ionicondom);

    return pdom;
}

function populateFileTabs(testFolderPath, count){
    let files = readFolder(testFolderPath);
    let fileListDom = document.querySelector('.file-tab-container');

    fs.readdir(testFolderPath, (err, files) => {
        if(err){
            console.log(err);
        }else{
            files.forEach(file => {
                if(path.extname(file) == '.json'){
                    // Clear list first
                    while(fileListDom.firstChild){
                        fileListDom.removeChild(fileListDom.firstChild);
                    }

                    let data = readData( path.join( testFolderPath, file ) );
        
                    if(count == undefined){
                        let count = parseInt(data.fileAmount);
                    }
        
                    for(var i = 1; i < count + 1; i++){
                        let pdom = document.createElement('p');
                        
                        if(i == 1){
                            pdom.className = 'file-tab-item active-file-tab-item';
                        }else{
                            pdom.className = 'file-tab-item';
                        }
                
                        pdom.textContent = 'File ' + i;
                        pdom.addEventListener('click', e => changeFileTab(e));
                
                        fileListDom.appendChild(pdom);
                    }
        
                }
            });
        }
    });

    


}

function openTestSettings(element){
    $('#create-test-index').hide();

    let testFolderPath = element.attributes.path.value;

    populateFileTabs(testFolderPath);
    updateSubPubList(testFolderPath, 0, 'pub');
    updateSubPubList(testFolderPath, 0, 'sub');

    let pubListAmountDom = document.querySelector('#pub-list-input');
    let subListAmountDom = document.querySelector('#sub-list-input');

    if(pubListAmountDom.value == '' && subListAmountDom.value == ''){
        $('.settings-list-container').hide();
    }
    
    document.querySelector('#create-test-settings').setAttribute('path', testFolderPath);
    document.querySelector('#create-test-settings').setAttribute('fileIndex', 1);

    $('#create-test-settings').show();
}

function updateSubPubList(testFolderPath, fileIndex, option){
    let testConfig = readData( path.join( testFolderPath, path.basename(testFolderPath) + '.json' ) );
    let fileConfig = testConfig.files[fileIndex];

    if(option == 'pub'){
        let count = parseInt(testConfig.files[fileIndex].publisherAmount);
    
        let pubListDom = document.querySelector('#pub-list');

        fileConfig.publishers.forEach((pub, index) => {
            let pubListItem = createPubListItem(index, pub.title);
            pubListDom.appendChild(pubListItem);
        });
    }else if(option == 'sub'){
        let count = parseInt(testConfig.files[fileIndex].subscriberAmount);
    
        let subListDom = document.querySelector('#sub-list');
    
        fileConfig.subscribers.forEach((sub, index) => {
            let subListItem = createSubListItem(index, sub.title);
            subListDom.appendChild(subListItem);    
        });
    }else{
        console.log("I don't know what the option is!");
    }
}

// Called when back button is pressed
function showTestSettingsPage(){
    resetPubSubInput();
    $('#create-test-index').show();
    document.querySelector('#create-test-settings').setAttribute('path', '');
    document.querySelector('#create-test-settings').setAttribute('fileAmount', 1);
    populateTestList();
    $('#create-test-settings').hide();
}

function createSubSettingsObj(title){
    return {
        "title": title,
        "generalSettings": [
            {
                "id": "bestEffortQuickGenSet",
                "title": "Best Effort",
                "value": "false",
                "description": "Use best-effort communication.",
                "type": "boolean"
            },
            {
                "id": "dataLenQuickGenSet",
                "title": "Data Length (bytes)",
                "value": "100",
                "description": "Length of payloads in bytes for each send.",
                "type": "input"
            },
            {
                "id": "verbosityQuickGenSet",
                "title": "Verbosity",
                "value": "1",
                "description": "Run with different levels of verbosity for RTI Connext DDS.",
                "type": "dropdown",
                "options": [
                    "0 - SILENT",
                    "1 - ERROR",
                    "2 - WARNING",
                    "3 - ALL"
                ]
            },
            {
                "id": "dynamicDataQuickGenSet",
                "title": "Dynamic Data",
                "value": "false",
                "description": "Run using the Dynamic Data API functions instead of the rtiddsgen generated calls.",
                "type": "boolean"
            },
            {
                "id": "durabilityQuickGenSet",
                "title": "Durability",
                "value": "0",
                "description": "Sets the Durability kind.",
                "type": "dropdown",
                "options": [
                    "0 - VOLATILE",
                    "1 - TRANSIENT LOCAL",
                    "2 - TRANSIENT",
                    "3 - PERSISTENT"
                ]
            },
            {
                "id": "domainIDQuickGenSet",
                "title": "Domain ID",
                "value": "1",
                "description": "The publisher and subscriber applications must use the same domain ID in order to communicate.",
                "type": "input"
            },
            {
                "id": "keyedDataQuickGenSet",
                "title": "Keyed Data",
                "value": "false",
                "description": "Specify the use of a keyed type.",
                "type": "boolean"
            },
            {
                "id": "multicastQuickGenSet",
                "title": "Multicast",
                "value": "false",
                "description": "Use multicast to receive data. In addition, the Datawriter heartbeats will be sent using multicast instead of unicast.",
                "type": "boolean"
            },
            {
                "id": "directCommunicationQuickGenSet",
                "title": "Direct Communication",
                "value": "false",
                "description": "Indicates if the subscribing application will receive samples from the publishing application when RTI Persistence Service is used.",
                "type": "boolean"
            },
            {
                "id": "positiveAcknowledgementsQuickGenSet",
                "title": "Positive Acknowledgements",
                "value": "false",
                "description": "Enable use of positive ACKs in the reliable protocol.",
                "type": "boolean"
            },
            {
                "id": "printIntervalsQuickGenSet",
                "title": "Print Interval",
                "value": "false",
                "description": "Enable printing of statistics at intervals during the test.",
                "type": "boolean"
            },
            {
                "id": "customQosFileQuickGenSet",
                "title": "Custom QOS File",
                "value": "path",
                "description": "Path to the XML file containing DDS QoS profiles.",
                "type": "file"
            },
            {
                "id": "useReadThreadQuickGenSet",
                "title": "Use Read Thread",
                "value": "false",
                "description": "Use a separate thread (instead of a callback) to read data.",
                "type": "boolean"
            },
            {
                "id": "waitSetDelayQuickGenSet",
                "title": "Wait Set Delay (Microseconds)",
                "value": "100",
                "description": "Process incoming data in groups, based on time, rather than individually.",
                "type": "input"
            },
            {
                "id": "waitSetEventCountQuickGenSet",
                "title": "Wait Set Event Count",
                "value": "5",
                "description": "Process incoming data in groups, based on the number of samples, rather than individually.",
                "type": "input"
            },
            {
                "id": "asynchronousQuickGenSet",
                "title": "Asynchronous",
                "value": "false",
                "description": "Enable asynchronous publishing in the DataWriter QoS.",
                "type": "boolean"
            },
            {
                "id": "displayCpuQuickGenSet",
                "title": "Display CPU",
                "value": "false",
                "description": "Display the cpu used by the RTI Perftest process.",
                "type": "boolean"
            }
        ],
        "subscriberSettings": [
            {
                "id": "publisherAmountSet",
                "title": "Number of Publishers",
                "value": "1",
                "description": "The subscribing application will wait for this number of publishing applications to start.",
                "type": "input"
            },
            {
                "id": "subIdSet",
                "title": "Subscriber ID",
                "value": "0",
                "description": "ID of the subscriber in a multi-subscriber test.",
                "type": "input"
            }
        ]
    };
}

function createPubSettingsObj(title){
    return {
        "title": title,
        "generalSettings": [
            {
                "id": "bestEffortQuickGenSet",
                "title": "Best Effort",
                "value": "false",
                "description": "Use best-effort communication.",
                "type": "boolean"
            },
            {
                "id": "dataLenQuickGenSet",
                "title": "Data Length (bytes)",
                "value": "100",
                "description": "Length of payloads in bytes for each send.",
                "type": "input"
            },
            {
                "id": "verbosityQuickGenSet",
                "title": "Verbosity",
                "value": "1",
                "description": "Run with different levels of verbosity for RTI Connext DDS.",
                "type": "dropdown",
                "options": [
                    "0 - SILENT",
                    "1 - ERROR",
                    "2 - WARNING",
                    "3 - ALL"
                ]
            },
            {
                "id": "dynamicDataQuickGenSet",
                "title": "Dynamic Data",
                "value": "false",
                "description": "Run using the Dynamic Data API functions instead of the rtiddsgen generated calls.",
                "type": "boolean"
            },
            {
                "id": "durabilityQuickGenSet",
                "title": "Durability",
                "value": "0",
                "description": "Sets the Durability kind.",
                "type": "dropdown",
                "options": [
                    "0 - VOLATILE",
                    "1 - TRANSIENT LOCAL",
                    "2 - TRANSIENT",
                    "3 - PERSISTENT"
                ]
            },
            {
                "id": "domainIDQuickGenSet",
                "title": "Domain ID",
                "value": "1",
                "description": "The publisher and subscriber applications must use the same domain ID in order to communicate.",
                "type": "input"
            },
            {
                "id": "keyedDataQuickGenSet",
                "title": "Keyed Data",
                "value": "false",
                "description": "Specify the use of a keyed type.",
                "type": "boolean"
            },
            {
                "id": "multicastQuickGenSet",
                "title": "Multicast",
                "value": "false",
                "description": "Use multicast to receive data. In addition, the Datawriter heartbeats will be sent using multicast instead of unicast.",
                "type": "boolean"
            },
            {
                "id": "directCommunicationQuickGenSet",
                "title": "Direct Communication",
                "value": "false",
                "description": "Indicates if the subscribing application will receive samples from the publishing application when RTI Persistence Service is used.",
                "type": "boolean"
            },
            {
                "id": "positiveAcknowledgementsQuickGenSet",
                "title": "Positive Acknowledgements",
                "value": "false",
                "description": "Enable use of positive ACKs in the reliable protocol.",
                "type": "boolean"
            },
            {
                "id": "printIntervalsQuickGenSet",
                "title": "Print Interval",
                "value": "false",
                "description": "Enable printing of statistics at intervals during the test.",
                "type": "boolean"
            },
            {
                "id": "customQosFileQuickGenSet",
                "title": "Custom QOS File",
                "value": "path",
                "description": "Path to the XML file containing DDS QoS profiles.",
                "type": "file"
            },
            {
                "id": "useReadThreadQuickGenSet",
                "title": "Use Read Thread",
                "value": "false",
                "description": "Use a separate thread (instead of a callback) to read data.",
                "type": "boolean"
            },
            {
                "id": "waitSetDelayQuickGenSet",
                "title": "Wait Set Delay (Microseconds)",
                "value": "100",
                "description": "Process incoming data in groups, based on time, rather than individually.",
                "type": "input"
            },
            {
                "id": "waitSetEventCountQuickGenSet",
                "title": "Wait Set Event Count",
                "value": "5",
                "description": "Process incoming data in groups, based on the number of samples, rather than individually.",
                "type": "input"
            },
            {
                "id": "asynchronousQuickGenSet",
                "title": "Asynchronous",
                "value": "false",
                "description": "Enable asynchronous publishing in the DataWriter QoS.",
                "type": "boolean"
            },
            {
                "id": "displayCpuQuickGenSet",
                "title": "Display CPU",
                "value": "false",
                "description": "Display the cpu used by the RTI Perftest process.",
                "type": "boolean"
            }
        ],
        "publisherSettings": [
            {
                "id": "batchSizeSet",
                "title": "Batch Size",
                "value": "100",
                "description": "Enable batching and set the maximum batched message size.",
                "type": "input"
            },
            {
                "id": "enableAutoThrottleSet",
                "title": "Enable Auto Throttle",
                "value": "false",
                "description": "Enable the Auto Throttling feature.",
                "type": "boolean"
            },
            {
                "id": "enableTurboModeSet",
                "title": "Enable Turbo Mode",
                "value": "false",
                "description": "Enables the Turbo Mode feature.",
                "type": "boolean"
            },
            {
                "id": "executionTimeSet",
                "title": "Execution Time (s)",
                "value": "0",
                "description": "Allows you to limit the test duration by specifying the number of seconds to run the test.",
                "type": "input"
            },
            {
                "id": "iterationCountSet",
                "title": "Number of Iterations",
                "value": "100000000",
                "description": "Number of samples to send.",
                "type": "input"
            },
            {
                "id": "latencyTestSet",
                "title": "Latency Test",
                "value": "false",
                "description": "Run a latency test consisting of a ping-pong. The publisher sends a ping, then blocks until it receives a pong from the subscriber.",
                "type": "boolean"
            },
            {
                "id": "latencyCountSet",
                "title": "Latency Count",
                "value": "-1",
                "description": "Number samples to send before a latency ping packet is sent.",
                "type": "input"
            },
            {
                "id": "subscriberAmountSet",
                "title": "Number of Subscribers",
                "value": "1",
                "description": "Have the publishing application wait for this number of subscribing applications to start.",
                "type": "input"
            },
            {
                "id": "pubIdSet",
                "title": "Publisher ID",
                "value": "0",
                "description": "Set the ID of the publisher in a multi-publisher test.",
                "type": "input"
            },
            {
                "id": "sendQueueSizeSet",
                "title": "Send-queue Size",
                "value": "50",
                "description": "Size of the send queue.",
                "type": "input"
            },
            {
                "id": "sleepTimeSet",
                "title": "Sleep Time (Milliseconds)",
                "value": "0",
                "description": "Time to sleep between each send.",
                "type": "input"
            },
            {
                "id": "instanceNumberSet",
                "title": "Instance Number",
                "value": "",
                "description": "Set the instance number to be sent.",
                "type": "input"
            }
        ]
    };
}