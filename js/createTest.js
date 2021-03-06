let createTestState = document.querySelector('#create-test-settings').attributes;

$('#create-test-settings').hide();
$('.run-create-test-container').hide();
$('.test-list-content .empty-message').hide();

createTestConstructor();

function createTestConstructor(){
    populateTestList();
    document.querySelector('#create-test-console').value = '';
}

$('.rdp-settings-back-button').on('click', e => {
    $('#create-test-rdp-settings').hide();
    $('#create-test-settings').show();
});

$('#run-create-test-button').on('click', e => {
    let runOption = getCreateRunOption();
    runCreateTest(runOption);
});

function runCreateTestRDP(){
    console.log(`%c RUN TEST ON VM HERE`, 'color: green;');
    console.trace();
}

function runCreateTest(runOption){
    if(runOption == 'local'){
        createBatFiles();
        startCreateTest();
    }else{                          // runOption == 'rdp'
        showRDPSettings();
    }
}   

function showRDPSettings(){
    renderMachineList();
    $('#create-test-settings').hide();
    $('#create-test-rdp-settings').show();
}

$('#add-machine').on('click', e => {
    addMachine();
});

async function addMachine(){
    let testPath = createTestState.path.value;

    let testFiles = await asyncReadFolder(testPath);

    let machineConfig = await asyncReadData( path.join( testPath, 'machineConfig.json' ) );

    let machineObj = {title: "", files: []};

    machineObj.title = "Machine " + (parseInt(machineConfig.length) + 1);

    machineConfig.push(machineObj);

    fs.writeFile(path.join( testPath, 'machineConfig.json' ), JSON.stringify(machineConfig), err => {
        if(err){
            console.log(err);
        }
    });

    renderMachineList();

}

async function renderMachineList(){
    let testPath = createTestState.path.value;
    let testConfig = await asyncReadData( path.join(createTestState.path.value, path.basename(createTestState.path.value) + '.json') ).catch(err => console.log(err));

    let files = await asyncReadFolder(testPath);

    files = files.filter(a => {
        return path.extname(a).includes('.json');
    });

    let machineConfigFiles = files.filter(a => {
        return a.includes('machineConfig');
    });

    if(machineConfigFiles.length == 0){
        createMachineConfigFile(testPath);
    }else{

        let configPath = path.join(testPath, machineConfigFiles[0]);

        let machines = await asyncReadData(configPath);
        let list = document.querySelector('.machine-list');

        clearList(list);

        if(machines.length > 0){
            machines.forEach(machine => {
                let machineItem = createMachineItem(machine);
                list.appendChild(machineItem);
            });
        }

    }
    
}

async function deleteMachine(machineTitle){
    let testPath = createTestState.path.value;
    let machineConf = await asyncReadData( path.join( testPath, 'machineConfig.json' ) );

    let toDelete = machineConf.filter(a => a.title == machineTitle)[0];

    machineConf = machineConf.filter(a => a != toDelete);

    fs.writeFile(path.join(testPath, 'machineConfig.json'), JSON.stringify(machineConf), err => {
        if(err){
            console.log(`%c err`, 'color: red;');
        }
    });

    renderMachineList();

}

function createMachineItem(machine){
    let machineDiv = document.createElement('div');
    machineDiv.className = 'machine';

    let titleInput = document.createElement('input');
    titleInput.className = 'machine-title machine-title-input';
    titleInput.value = machine.title;

    machineDiv.appendChild(titleInput);

    let machineContainerDiv = document.createElement('div');
    machineContainerDiv.className = 'machine-container';

    let fileContainer = document.createElement('div');
    fileContainer.className = 'file-container';
    
    machine.files.forEach(file => {
        let fileItem = document.createElement('p');
        fileItem.className = 'file-name';
        fileItem.textContent = path.basename(file);
        fileItem.id = file;
        fileItem.addEventListener('click', e => {
            deleteMachineFile(e);
        });
        fileContainer.appendChild(fileItem);
    });

    machineContainerDiv.appendChild(fileContainer);

    let resetButtonContainer = document.createElement('div');
    resetButtonContainer.className = 'reset-button-container';
    let resetIcon = document.createElement('ion-icon');
    resetIcon.name = 'trash';
    resetIcon.addEventListener('click', e => {
        deleteMachine(machine.title);
    });
    resetButtonContainer.appendChild(resetIcon);

    let addFileContainer = document.createElement('div');
    addFileContainer.className = 'add-file-container';
    let addIcon = document.createElement('ion-icon');
    addIcon.name = 'add';
    addFileContainer.appendChild(addIcon);

    machineContainerDiv.appendChild(resetButtonContainer);
    machineContainerDiv.appendChild(addFileContainer);

    machineDiv.appendChild(machineContainerDiv);

    return machineDiv;
}

function createMachineConfigFile(testPath){
    fs.writeFile(path.join( testPath, 'machineConfig.json'), JSON.stringify([]), err => {
        if(err){
            console.log(err);
        }
    });
}

// Gets whether user wants to run locally or through RDP
function getCreateRunOption(){
    let select = document.querySelector('#create-test-run-option');
    if(select.value.includes('local')){
        return 'local';
    }else if(select.value.includes('remote desktop')){
        return 'rdp';
    }
}

// $('.create-test-start-button').on('click', e => {
//     createBatFiles();
//     startCreateTest();
// });

// Greys out start button on create-test page if there are no files
// function checkStartTestStatus(){
//     let batFiles = readFolder(createTestState.path.value).filter(a => a.toLowerCase().includes('.bat'));

//     // console.log(batFiles);

// }

function stopCreateTest(){
    $('#create-test-settings').show();
    // $('#create-test-index').show();
    $('.run-create-test-container').hide();
}

async function startCreateTest(){
    let data = document.querySelector('#create-test-settings').attributes;
    let testConfig = readData( path.join(data.path.value, path.basename(data.path.value) + '.json') );
    let batFiles = readFolder(data.path.value).filter(a => a.toLowerCase().includes('.bat'));

    let fileDrop = document.querySelector('#file-dropdown-selection');

    clearList(fileDrop);

    // Populates the file dropdown
    batFiles.forEach(file => {
        file = unnormaliseString(file);
        // Populate file dropdown:
        let option = document.createElement('option');
        option.value = path.join(data.path.value, file);
        option.textContent = file;
        fileDrop.appendChild(option);
    });

    let runConfig = createRunConfig();

    fs.writeFileSync(path.join(createTestState.path.value, 'runConfig.json'), JSON.stringify(runConfig));

    // runNextPendingFile(runConfig);

    // Run all the files
    runConfig.files.forEach((file, index) => {
        file.status = 'running';
        runFile(file.path, runConfig, index);
    });
    
    $('#create-test-settings').hide();
    $('.run-create-test-container').show();
}

function outputConsole(fileConf){
    console.log('Outputting to console...');
    let output = fileConf.output;

    let conOut = document.querySelector('#create-test-console');

    conOut.value += output;

    console.log(output);
}

async function runFile(pathval, runConfig, fileIndex){
    // let runConfig = await asyncReadData(path.join(createTestState.path.value, 'runConfig.json'));

    let fileConf = runConfig.files.filter(a => a.path == pathval)[0];

    let command = `${pathval}`;
    let dir = exec(command, (err, stdout, stderr) => {
        if(err){
            fileConf.output += err;
        }else if(stdout){
            fileConf.output += stdout;
        }else if(stderr){
            fileConf.output += stderr;
        }

        fs.writeFileSync(
            path.join(
                createTestState.path.value,
                'runConfig.json'
            ),
            JSON.stringify(runConfig)
        );

        if(fileIndex = 0){
            outputConsole(fileConf);
        }

    });

    dir.stdout.on('data', data => {
        console.log('STDOUT: \n');
        console.log(data);
        fileConf.output += data;
        fs.writeFileSync(
            path.join(
                createTestState.path.value,
                'runConfig.json'
            ),
            JSON.stringify(runConfig)
        );
        if(fileIndex = 0){
            outputConsole(fileConf);
        }
    });
    
    dir.stderr.on('data', data => {
        console.log('STDERR: \n');
        console.log(data);
        fileConf.output += data + '\n';
        fs.writeFileSync(
            path.join(
                createTestState.path.value,
                'runConfig.json'
            ),
            JSON.stringify(runConfig)
        );
        if(fileIndex = 0){
            outputConsole(fileConf);
        }
    });

}

// Takes in run config file and runs next pending file
function runNextPendingFile(runConfig){
    let pendFiles = runConfig.files.filter(a => a.status == 'pending');
    let nextFile = pendFiles[0];

    let generalSettings = readData(__dirname + '/../data/GeneralSettings.json');
    let perfTestLoc = generalSettings.defPerftestLoc;
    
    let conOut = document.querySelector('#create-test-console');
        
    // Execute .bat file of test
    let command = `${nextFile.path}`;
    // let command = 'ping www.google.com';
    let dir = exec(command);

    console.log('Executing ' + command);

    dir.stdout.on('data', data => {
        console.log('STDOUT: \n');
        console.log(data);
        conOut.value += data;
        conOut.scrollTop = conOut.scrollHeight;
    });
    
    dir.stderr.on('data', data => {
        console.log('STDERR: \n');
        console.log(data);
        conOut.value += data;
        conOut.scrollTop = conOut.scrollHeight;
        
    });

    document.querySelector('#current-file-title').textContent = path.basename(nextFile.path);

}

// Create run config file to see what files are pending/running/complete/aborted
function createRunConfig(){
    let batFiles = readFolder(createTestState.path.value).filter(a => a.toLowerCase().includes('.bat'));
    let runObj = {
        files: []
    };

    batFiles.forEach(file => {
        let newObj = {
            path: path.join( createTestState.path.value, file ),
            title: file,
            status: 'pending',
            output: ''
        };
        runObj.files.push(newObj);
    });

    return runObj;
}

function createBatFiles(){
    let data = document.querySelector('#create-test-settings').attributes;
    let testConfig = readData( path.join(data.path.value, path.basename(data.path.value) + '.json') );
    // let fileConfig = testConfig.files[data.fileIndex.value - 1];
    let generalSettings = readData(__dirname + '/../data/GeneralSettings.json');
    let perfTestLoc = generalSettings.defPerftestLoc;

    let fileConfig;

    for(var i = 0; i < testConfig.files.length; i++){
        fileConfig = testConfig.files[i];
        
        fileConfig.publishers.forEach(publisher => {
            let fileOutput = createPubBatOutput(perfTestLoc, publisher.generalSettings, publisher.publisherSettings);
    
            fs.writeFile( path.join(data.path.value, publisher.title + '.bat') , fileOutput, err => err ? console.log(err) : console.log(`%c Created \n ${publisher.title + '.bat'} \n in \n ${data.path.value}`, 'color: green;'));
        });
    
        fileConfig.subscribers.forEach(subscriber => {
            let fileOutput = createSubBatOutput(perfTestLoc, subscriber.generalSettings, subscriber.subscriberSettings);
    
            fs.writeFile( path.join(data.path.value, subscriber.title + '.bat') , fileOutput, err => err ? console.log(err) : console.log(`%c Created \n ${subscriber.title + '.bat'} \n in \n ${data.path.value}`, 'color: green;'));
        });
    }

}

async function createBatSequenceFiles(){
    let allFiles = await asyncReadFolder(createTestState.path.value).catch(err => console.log(err));
    let batFiles = await allFiles.filter(a => path.extname(a) == '.bat');
    let fileName, fileOutput;

    

    // for(var i = 0; i < batFiles.length; i++){
    //     if(i != batFiles.length - 1){
    //         fileName = i;
    //         fileOutput = `
    //             @echo off
    //             Start /wait ${batFiles[i]}
    //             REG ADD "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /V ${`${i + 1}.bat`} /t REG_SZ /F /D ${i + 1 + '.bat'}
    //             pause
    //             shutdown -r -t 0
    //         `;
    //     }else{
    //         fileName = i;
    //         fileOutput = `
    //             @echo off
    //             Start /wait ${batFiles[i]}
    //             exit
    //         `;
    //     }

    //     console.log(`%c i: ${i}.bat`, 'color: green;');

    //     // fs.writeFile(
    //     //     path.join(
    //     //         createTestState.path.value,
    //     //         `${i}.bat`
    //     //     ),
    //     //     fileOutput,
    //     //     err => {err ? console.log(err) : console.log(`Created ${i + '.bat'} in ${createTestState.path.value}`);}
    //     // );
    // }

}

function updateItemSetting(element, inputType, value){
    // Either 'Publisher' or 'Subscriber'
    let type = element.parentElement.parentElement.parentElement.parentElement.parentElement.childNodes[5].childNodes[1].textContent.replace(' Settings', '');

    let data = document.querySelector('#create-test-settings').attributes;
    let testConfig = readData( path.join(data.path.value, path.basename(data.path.value) + '.json') );
    let fileConfig = testConfig.files[data.fileIndex.value - 1];
    let itemName = element.parentElement.parentElement.parentElement.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[3].value;
    // Either 'General Settings' or ('Publisher Settings' or 'Subscriber Settings')
    let settingType = element.parentElement.parentElement.parentElement.parentElement.childNodes[1].textContent;

    if(inputType == 'ionicon'){
        value ? element.name = 'close-circle-outline' : element.name = 'checkmark-circle-outline';
        value = !value;
    }

    if(type == 'Publisher'){
        let pubConfig = fileConfig.publishers.filter(a => a.title == normaliseString(itemName))[0];
        if(settingType == 'General Settings'){
            let setting = pubConfig.generalSettings.filter(a => a.id == element.id)[0];
            setting.value = value;
        }else if(settingType == 'Publisher Settings'){
            let setting = pubConfig.publisherSettings.filter(a => a.id == element.id)[0];
            setting.value = value;
        }else{
            console.log(`%c I don't know what the settingType is!`, 'color: red;');
        }
    }else if(type == 'Subscriber'){
        let subConfig = fileConfig.subscribers.filter(a => a.title == normaliseString(itemName))[0];
        if(settingType == 'General Settings'){
            let setting = subConfig.generalSettings.filter(a => a.id == element.id)[0];
            setting.value = value;
        }else if(settingType == 'Subscriber Settings'){
            let setting = subConfig.subscriberSettings.filter(a => a.id == element.id)[0];
            setting.value = value;
        }else{
            console.log(`%c I don't know what the settingType is!`, 'color: red;');
        }
    }else{
        console.log(`%c I can't tell what the type is!`, 'color: red;');
    }
    
    fs.writeFile(path.join(data.path.value, path.basename(data.path.value) + '.json'), JSON.stringify(testConfig), err => {
        err ? console.log(err) : createBatFiles();
    });

}

$('#pub-sub-dropdown').on('change', e => {
    let itemName = e.target.attributes.itemName.value;
    let copyFrom = e.target.value;
    let copyTo = e.target.parentElement.parentElement.childNodes[0].nextSibling.childNodes[3].value;
    
    let type = e.target.value.slice(0, 3).toLowerCase();

    let data = document.querySelector('#create-test-settings').attributes;
    let fileConfig = readData(path.join( data.path.value, path.basename(data.path.value) + '.json' ));

    populateItemSettings(type, data, itemName);

    let settingsDrop = document.querySelector('#settings-dropdown');
    let settingsType = settingsDrop.value;

    if(type == 'pub'){
        let pubArray = fileConfig.files[data.fileIndex.value - 1].publishers;
        let pubConfig = pubArray.filter(a => a.title == copyFrom)[0];
        let copyToConfig = pubArray.filter(a => a.title == copyTo)[0];

        let copyFromData;

        if(settingsType == 'generalSettings'){
            copyFromData = pubConfig.generalSettings;
            copyToConfig.generalSettings = copyFromData;
        }else{
            copyFromData = pubConfig.publishersettings;
            copyToConfig.publishersettings = copyFromData;
        }

        fs.writeFile(path.join( data.path.value, path.basename(data.path.value) + '.json' ), JSON.stringify(fileConfig), err => err ? console.log(err) : console.log(''));
    }else if(type == 'sub'){
        let subArray = fileConfig.files[data.fileIndex.value - 1].subscribers;
        let subConfig = subArray.filter(a => a.title == copyFrom)[0];
        let copyToConfig = subArray.filter(a => a.title == copyTo)[0];

        let copyFromData;

        if(settingsType == 'generalSettings'){
            copyFromData = subConfig.generalSettings;
            copyToConfig.generalSettings = copyFromData;
        }else{
            copyFromData = subConfig.subscriberSettings;
            copyToConfig.subscriberSettings = copyFromData;
        }

        fs.writeFile(path.join( data.path.value, path.basename(data.path.value) + '.json' ), JSON.stringify(fileConfig), err => err ? console.log(err) : console.log(''));
    }
});

function populateCopyDropdown(type, data, itemName){

    populateItemSettings(type, data, itemName);

    let settingsDrop = document.querySelector('#settings-dropdown');
    let pubSubDrop = document.querySelector('#pub-sub-dropdown');

    let subList = document.querySelector('#sub-list');
    let pubList = document.querySelector('#pub-list');

    clearList(pubSubDrop);
    clearList(settingsDrop);

    if(type == 'pub'){
        settingsDrop.appendChild(createOption('generalSettings', 'General Settings'));
        settingsDrop.appendChild(createOption('publisherSettings', 'Publisher Settings'));

        pubList.childNodes.forEach(node => {
            let pubName = node.innerText;

            let option = createOption(pubName, pubName, itemName);

            pubSubDrop.appendChild(option);
        });
    }else if(type == 'sub'){
        settingsDrop.appendChild(createOption('generalSettings', 'General Settings'));
        settingsDrop.appendChild(createOption('subscriberSettings', 'Subscriber Settings'));

        subList.childNodes.forEach(node => {
            let subName = node.innerText;

            let option = createOption(subName, subName, itemName);

            pubSubDrop.appendChild(option);
        });
    }

    pubSubDrop.setAttribute('itemName', itemName);

}

function createOption(value, title, itemName){
    let option = document.createElement('option');
    option.textContent = title;
    option.value = value;

    return option;
}

function updatePubTitle(testConfigPath, fileIndex, pubIndex, value){
    let data = document.querySelector('#create-test-settings').attributes;
    
    fs.readFile(testConfigPath, (err, filedata) => {
        if(err){
            console.log(err);
        }else{
            testConfig = JSON.parse(filedata);
            if(value == ''){
                value = 'Publisher';
            }
        
            testConfig.files[fileIndex].publishers[pubIndex].title = value;
            // console.log(testConfig.files[fileIndex].publishers);
            // console.log(pubIndex);
        
            fs.writeFile(testConfigPath, JSON.stringify(testConfig), err => err ? console.log(err) : console.log());
        
            updateSubPubList(path.dirname(testConfigPath), fileIndex, 'pub');
        }
    });

}

function updateSubTitle(testConfigPath, fileIndex, subIndex, value){
    let data = document.querySelector('#create-test-settings').attributes;
    
    fs.readFile(testConfigPath, (err, filedata) => {
        if(err){
            console.log(err);
        }else{
            testConfig = JSON.parse(filedata);
            if(value == ''){
                value = 'Subscriber';
            }
        
            testConfig.files[fileIndex].subscribers[subIndex].title = value;
        
            fs.writeFile(testConfigPath, JSON.stringify(testConfig), err => err ? console.log(err) : console.log());
        
            updateSubPubList(path.dirname(testConfigPath), fileIndex, 'sub');
        }
    });

}

function createSettingItem(title, id, type, value, options){
    let container = document.createElement('div');
    container.className = 'setting-list-item';
    
    let titledom = document.createElement('span');
    titledom.className = 'setting-list-item-title';
    titledom.textContent = title;

    let inputdom;

    if(type == 'input'){
        inputdom = document.createElement('input');
        inputdom.type = 'number';
        inputdom.id = id;
        inputdom.value = value;
        inputdom.addEventListener('keyup', e => {
            updateItemSetting(e.target, 'nameinput', e.target.value);
        });
    }else if(type == 'boolean'){
        inputdom = document.createElement('ion-icon');
        inputdom.id = id;
        
        if(value.toString() == 'false'){
            inputdom.name = 'close-circle-outline';
        }else{
            inputdom.name = 'checkmark-circle-outline';
        }

        inputdom.addEventListener('click', e => {
            updateItemSetting(e.target, 'ionicon', e.target.name == 'checkmark-circle-outline' ? true : false);
        });
    }else if(type == 'file'){
        inputdom = document.createElement('input');
        inputdom.type = 'file';
        inputdom.id = id;

        inputdom.addEventListener('change', e => {
            updateItemSetting(e.target, 'fileinput', e.target.files[0].path);
        });
    }else if(type == 'dropdown'){
        inputdom = document.createElement('select');
        inputdom.id = id;

        options.forEach(item => {
            let option = document.createElement('option');
            option.textContent = item;

            if(item.includes(value)){
                option.setAttribute('selected', '');
            }

            inputdom.appendChild(option);

        });

        inputdom.addEventListener('change', e => {
            updateItemSetting(e.target, 'dropdown', e.target.value);
        });
    }else{
        console.log(`%c I don't know what the type is.`, 'color: red;');
    }

    container.appendChild(titledom);
    container.appendChild(inputdom);

    return container;

}

function populateItemSettings(type, data, itemName){
    fs.readFile(path.join(data.path.value, path.basename(data.path.value) + '.json'), (err, testConfig) => {

        testConfig = JSON.parse(testConfig);

        let fileConfig = testConfig.files[data.fileIndex.value - 1];
    
        // Clear list first
        clearList(document.querySelector('#settings-list-first-half'));
        clearList(document.querySelector('#settings-list-second-half'));
        clearList(document.querySelector('#pub-sub-first-half'));
        clearList(document.querySelector('#pub-sub-second-half'));
    
        if(type == 'pub'){

            document.querySelector('#pub-sub-setting-title').textContent = 'Publisher Settings';
    
            let pubConfig;
            let pubIndex;
    
            fileConfig.publishers.forEach((pub, index) => {
                if(pub.title == normaliseString(itemName)){
                    pubConfig = pub;
                    pubIndex = index;
                }
            });
    
            let nameInput = document.querySelector('#setting-name-input');
            nameInput.addEventListener('keyup', e => {
                updatePubTitle(
                    path.join( data.path.value, path.basename(data.path.value) + '.json' ), 
                    data.fileIndex.value - 1, 
                    pubIndex, 
                    e.target.value
                );
            });
            nameInput.value = itemName;
    
            let generalSettings = pubConfig.generalSettings;
            let publisherSettings = pubConfig.publisherSettings;
    
            let settingsListFirstHalf = document.querySelector('#settings-list-first-half');
            let settingsListSecondHalf = document.querySelector('#settings-list-second-half');
    
            $('.settings-list-container').show();
    
            for(var i = 0; i < parseInt(generalSettings.length / 2); i ++){
                let setting = generalSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListFirstHalf.appendChild(settingItem);
            }
    
            for(var i = parseInt(generalSettings.length / 2); i < generalSettings.length; i ++){
                let setting = generalSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListSecondHalf.appendChild(settingItem);
            }
    
            settingsListFirstHalf = document.querySelector('#pub-sub-first-half');
            settingsListSecondHalf = document.querySelector('#pub-sub-second-half');
    
            for(var i = 0; i < parseInt(publisherSettings.length / 2); i ++){
                let setting = publisherSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListFirstHalf.appendChild(settingItem);
            }
    
            for(var i = parseInt(publisherSettings.length / 2); i < publisherSettings.length; i ++){
                let setting = publisherSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListSecondHalf.appendChild(settingItem);
            }
    
    
        }else if(type == 'sub'){
    
            document.querySelector('#pub-sub-setting-title').textContent = 'Subscriber Settings';
    
            let subConfig;
            let subIndex;
    
            fileConfig.subscribers.forEach((sub, index) => {
                if(sub.title == normaliseString(itemName)){
                    subConfig = sub;
                    subIndex = index;
                }
            });
    
            let nameInput = document.querySelector('#setting-name-input');
            nameInput.addEventListener('keyup', e => {
                updateSubTitle(
                    path.join( data.path.value, path.basename(data.path.value) + '.json' ), 
                    data.fileIndex.value - 1, 
                    subIndex, 
                    e.target.value
                );
            });
            nameInput.value = itemName;
    
            let generalSettings = subConfig.generalSettings;
            let subscriberSettings = subConfig.subscriberSettings;
    
            let settingsListFirstHalf = document.querySelector('#settings-list-first-half');
            let settingsListSecondHalf = document.querySelector('#settings-list-second-half');
    
            $('.settings-list-container').show();
    
            for(var i = 0; i < parseInt(generalSettings.length / 2); i ++){
                let setting = generalSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListFirstHalf.appendChild(settingItem);
            }
    
            for(var i = parseInt(generalSettings.length / 2); i < generalSettings.length; i ++){
                let setting = generalSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListSecondHalf.appendChild(settingItem);
            }
    
            settingsListFirstHalf = document.querySelector('#pub-sub-first-half');
            settingsListSecondHalf = document.querySelector('#pub-sub-second-half');
    
            for(var i = 0; i < parseInt(subscriberSettings.length / 2); i ++){
                let setting = subscriberSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListFirstHalf.appendChild(settingItem);
            }
    
            for(var i = parseInt(subscriberSettings.length / 2); i < subscriberSettings.length; i ++){
                let setting = subscriberSettings[i];
                let settingItem = createSettingItem(setting.title, setting.id, setting.type, setting.value, setting.options);
                settingItem.id = i;
                settingsListSecondHalf.appendChild(settingItem);
            }
    
        }else{
            console.log(`%c I don't know what the type is.`, 'color: red;');
        }
    });
}

function viewSettings(event){
    let type = event.target.parentElement.parentElement.id.replace('-list', '');
    let data = document.querySelector('#create-test-settings').attributes;
    
    let itemName = event.target.parentElement.firstChild.textContent;
    
    populateCopyDropdown(type, data, itemName);
    populateItemSettings(type, data, itemName);
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

}

function preUpdateRepCount(e){
    let data = document.querySelector('#create-test-settings').attributes;
    let testFolderPath = data.path.value;
    let fileIndex = data.fileIndex.value;

    let timeSpan = document.querySelector('#test-rep-time');

    e.target.value > 1 ? timeSpan.textContent = 'times.' : timeSpan.textContent = 'time.';

    updateRepCount(e.target.value, testFolderPath, fileIndex);
}

// Update repetition count when changes
$('#test-rep-input').on('keyup', e => {
    preUpdateRepCount(e);
});

// Update repetition count when changes
$('#test-rep-input').on('change', e => {
    preUpdateRepCount(e);
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
        let item = createSubListItem(i, 'Subscriber ' + (i - 1));
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

    for(i = 0; i < amount; i++){
        testConfig.files[fileIndex].subscribers.push(createSubSettingsObj( 'Subscriber ' + i ));
    }

    fs.writeFile(testConfigFile, JSON.stringify(testConfig), err => err ? console.log(err) : console.log(''));
};

// Update publisher list when user enters in value
$('#pub-list-input').on('keyup', e => {
    let listdom = document.querySelector('#pub-list');
    let amount = parseInt(e.target.value);
    let data = document.querySelector('#create-test-settings').attributes;

    clearList(listdom);

    if(amount == 0 || amount == '' || isNaN(amount)){
        while(listdom.firstChild){
            listdom.removeChild(listdom.firstChild);
        }
    }

    for(var i = 1; i < amount + 1; i++){
        // Create pub list item dom
        let item = createPubListItem(i, 'Publisher ' + (i - 1));
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

    for(i = 0; i < amount; i++){
        testConfig.files[fileIndex].publishers.push(createPubSettingsObj( 'Publisher ' + i ));
    }

    fs.writeFile(testConfigFile, JSON.stringify(testConfig), err => err ? console.log(err) : createBatFiles());
};

$('#test-list-folder-selection-input').on('change', e => {
    populateTestList(e.target.files[0].path);
});

function editListItem(event){
    let inputdom = document.createElement('input');
    inputdom.type = 'text';
    inputdom.value = event.target.textContent.replace(/\W/g, ' ');;
    inputdom.className = 'pub-sub-list-item-title';
    inputdom.addEventListener('keyup', e => editListItemSetting(e));
    inputdom.id = event.target.id;

    event.target.parentElement.replaceChild(inputdom, event.target.parentElement.firstChild);
}

function editListItemSetting(event){
    let newValue = event.target.value.replace(/\W/g, ' ');;
    let itemId = event.target.id;
    let data = document.querySelector('#create-test-settings').attributes;

    // let testConfig = readData( path.join( data.path.value, path.basename(data.path.value) + '.json' ) );

    fs.readFile( path.join( data.path.value, path.basename(data.path.value) + '.json' ), (err, filedata) => {
        testConfig = JSON.parse(filedata);
        
        // console.log(testConfig.files[data.fileIndex.value - 1].subscribers);
        // console.log(itemId);

        let fileConfig = testConfig.files[data.fileIndex.value - 1];
    
        let type = event.target.parentElement.parentElement.id.replace('-list', '');
    
        if(type == 'pub'){
            fileConfig.publishers[itemId].title = newValue;
        }else{
            fileConfig.subscribers[itemId].title = newValue;
        }
    
        fs.writeFile(path.join( data.path.value, path.basename( data.path.value ) + '.json' ), JSON.stringify(testConfig), err => err ? console.log(err) : console.log(''));
    });

}

function deleteListItem(event){
    let data = document.querySelector('#create-test-settings').attributes;
    // let testConfig = readData(path.join( data.path.value, path.basename(data.path.value) + '.json' ));

    fs.readFile(path.join( data.path.value, path.basename(data.path.value) + '.json' ), (err, testConfig) => {
        if(err){
            console.log(`%c ${err}`, 'color: red;');
        }
        testConfig = JSON.parse(testConfig);
        let fileConfig = testConfig.files[data.fileIndex.value - 1];
    
        let type = event.target.parentElement.parentElement.id.replace('-list', '');
    
        let listdom = event.target.parentElement.parentElement;
        let listitemdom = event.target.parentElement;
        listdom.removeChild(listitemdom);
    
        let index = event.target.parentElement.firstChild.id;
    
        if(type == 'pub'){
            fileConfig.publishers.splice(index, 1);
        }else if(type == 'sub'){
            fileConfig.subscribers.splice(index, 1);
        }
    
        fs.writeFile(
            path.join( data.path.value, path.basename(data.path.value) + '.json' ),
            JSON.stringify(testConfig),
            err => err ? console.log(err) : console.log()
        );
    });


}

function createSubListItem(index, title){
    title = unnormaliseString(title);
    let divdom = document.createElement('div');
    divdom.className = 'pub-sub-list-item';

    let spandom = document.createElement('span');
    spandom.className = 'pub-sub-list-item-title';
    spandom.textContent = title;
    spandom.id = index;
    spandom.addEventListener('click', e => editListItem(e));

    let viewicon = document.createElement('ion-icon');
    viewicon.name = 'eye';
    viewicon.addEventListener('click', e => viewSettings(e));

    let icondom = document.createElement('ion-icon');
    icondom.name = 'trash';
    icondom.addEventListener('click', e => deleteListItem(e));

    divdom.appendChild(spandom);
    divdom.appendChild(viewicon);
    divdom.appendChild(icondom);

    return divdom;

}

function createPubListItem(index, title){
    title = unnormaliseString(title);
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

            let testName = normaliseString(nameInput.value);
            let fileAmount = parseInt(fileAmountInput.value);

            // Check test folder doesn't already exist
            if(!fs.existsSync( path.join( saveLocation, testName ) )){
                fs.mkdirSync( path.join( saveLocation, testName ) );
                
                let newFolder = path.join( saveLocation, testName );
                
                let config = createTestConfigObj(testName, fileAmount);
                
                createFile(JSON.stringify(config), path.join( newFolder, testName + '.json' ));
                
                populateFileTabs(newFolder, fileAmount);

                // Redirect to file settings page here
                $('#create-test-index').hide();
                document.querySelector('#create-test-settings').setAttribute('path', normaliseString(newFolder));
                document.querySelector('#create-test-settings').setAttribute('fileAmount', fileAmountInput.value);
                document.querySelector('#create-test-settings').setAttribute('fileIndex', 1);

                createNewFileList(fileAmount);

                $('#create-test-settings').show();

                // Clear test name and test file amount fields
                nameInput.value = '';
                fileAmountInput.value = '';

                // Reset setting page
                document.querySelector('#test-rep-input').value = 1;
                clearList(document.querySelector('#pub-list'));
                clearList(document.querySelector('#sub-list'));
                document.querySelector('#setting-name-input').value = '';
                let pubListAmountDom = document.querySelector('#pub-list-input');
                let subListAmountDom = document.querySelector('#sub-list-input');

                if(pubListAmountDom.value == '' && subListAmountDom.value == ''){
                    $('.settings-list-container').hide();
                }

                let data = document.querySelector('#create-test-settings').attributes;
                let testFolderPath = data.path.value;

                document.querySelector('#create-test-page-title').textContent = 'CREATE TEST: ' + unnormaliseString(path.basename(testFolderPath));

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
                listOutput.push(unnormaliseString(item));
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

    pdom.setAttribute('path', normaliseString(pathValue));

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
    let fileListDom = document.querySelector('.file-tab-container');

    testFolderPath = normaliseString(testFolderPath);

    fs.readdir(testFolderPath, (err, files) => {
        if(err){
            console.log(err);
        }else{
            // Clear list first
            while(fileListDom.firstChild){
                fileListDom.removeChild(fileListDom.firstChild);
            }

            files.forEach(file => {
                if(path.extname(file) == '.json' && file.toLowerCase().includes( path.basename(createTestState.path.value.toLowerCase()) )){
                    fs.readFile(path.join( testFolderPath, file ), (err, data) => {
                        data = JSON.parse(data);
                        if(count == undefined){
                            count = parseInt(data.fileAmount);
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
                    });
        
                    
                }
            });
        }
    });
 }

function openTestSettings(element){
    $('#create-test-index').hide();
    
    let testFolderPath = element.attributes.path.value;
    document.querySelector('#create-test-page-title').textContent = 'CREATE TEST: ' + unnormaliseString(path.basename(testFolderPath));

    populateFileTabs(testFolderPath);
    updateSubPubList(testFolderPath, 0, 'pub');
    updateSubPubList(testFolderPath, 0, 'sub');

    let pubListAmountDom = document.querySelector('#pub-list-input');
    let subListAmountDom = document.querySelector('#sub-list-input');

    if(pubListAmountDom.value == '' && subListAmountDom.value == ''){
        $('.settings-list-container').hide();
    }
    
    document.querySelector('#create-test-settings').setAttribute('path', normaliseString(testFolderPath));
    document.querySelector('#create-test-settings').setAttribute('fileIndex', 1);

    $('#create-test-settings').show();
}

function updateSubPubList(testFolderPath, fileIndex, option){
    let testConfigPath = path.join( testFolderPath, path.basename(testFolderPath) + '.json' );

    fs.readFile(normaliseString(testConfigPath), (err, filedata) => {
        if(err){
            console.log(`%c ${err}`, 'color: red;');
        }

        let testConfig = JSON.parse(filedata);
        let fileConfig = testConfig.files[fileIndex];
    
        if(option == 'pub'){
            let count = parseInt(testConfig.files[fileIndex].publisherAmount);
        
            let pubListDom = document.querySelector('#pub-list');
            
            // Clear list first
            while(pubListDom.firstChild){
                pubListDom.removeChild(pubListDom.firstChild);
            }

            fileConfig.publishers.forEach((pub, index) => {
                let pubListItem = createPubListItem(index, pub.title);
                pubListDom.appendChild(pubListItem);
            });
        }else if(option == 'sub'){
            let count = parseInt(testConfig.files[fileIndex].subscriberAmount);
        
            let subListDom = document.querySelector('#sub-list');
        
            // Clear list first
            while(subListDom.firstChild){
                subListDom.removeChild(subListDom.firstChild);
            }

            fileConfig.subscribers.forEach((sub, index) => {
                let subListItem = createSubListItem(index, sub.title);
                subListDom.appendChild(subListItem);    
            });
        }else{
            console.log("I don't know what the option is!");
        }
    });

}

// Called when back button is pressed
function showTestSettingsPage(){
    document.querySelector('#create-test-page-title').textContent = 'CREATE TEST';    
    document.querySelector('#setting-name-input').value = '';
    resetPubSubInput();
    $('#create-test-index').show();
    document.querySelector('#create-test-settings').setAttribute('path', '');
    document.querySelector('#create-test-settings').setAttribute('fileAmount', 1);
    populateTestList();
    $('#create-test-settings').hide();
}

function createSubSettingsObj(title){
    let generalSettings = readData( path.join( __dirname, '../data/CreateGeneralSettings.json' ) );
    let subscriberSettings = readData( path.join( __dirname, '../data/CreateSubscriberSettings.json' ) );

    return {
        "title": normaliseString(title),
        "generalSettings": generalSettings,   
        "subscriberSettings": subscriberSettings
    };
}

function createPubSettingsObj(title){
    let generalSettings = readData( path.join( __dirname, '../data/CreateGeneralSettings.json' ) );
    let publisherSettings = readData( path.join( __dirname, '../data/CreatePublisherSettings.json' ) );

    return {
        "title": normaliseString(title),
        "generalSettings": generalSettings,
        "publisherSettings": publisherSettings
    };
}