let runDataPath = path.join(__dirname, '../data/RunTest.json');
let state = document.querySelector('#runContent').attributes;
let data = readData(path.join(__dirname, '../data/RunTest.json'));
let fileListContainerDOM = document.querySelector('#file-selection-list-container');
let settings = readData(path.join( __dirname, '../data/GeneralSettings.json' ));

$('.file-selection-window-container').hide();
$('.run-test-window').hide();
// Delete next 3 lines when done with running test part
// $('.run-test-window').show();
// $('.run-selection-window').hide();
// startTests();

runConstructor();

$('#close-button').on('click', e => {
    $('.file-selection-window-container').hide();
});

$('.folder-selection-input').on('change', e => populateFileList(e));

function runConstructor(){
    populateProcesses();
    // validateStartButton();
}

function setState(item, value){
    document.querySelector('#runContent').setAttribute(item, value);
}

$('#run-test-go-button').on('click', e => {
    let option = getRunOption();

    option == 'local' ? runTestsLocally() : runTestsRemotely();
});

function runTestsRemotely(){
    console.log(`%c Running tests remotely...shhhhhhhh......`, 'color: blue;');
}

async function runTestsLocally(){
    let processes = data.processes;
    let saveDir = path.join(__dirname, '../data/currentRun');;

    // Empty the currentRun folder before adding new files into it
    setCurrentProcessDom(processes[0]);
    let delFiles = await readFolder(saveDir);
    delFiles.forEach(file => {
        fs.unlink(path.join(saveDir, file), err => {
            if(err){
                console.log(`%c err`, 'color: red;');
            }
        });
    });
    
    processes.forEach(process => {
        
        process.files.forEach((file, index) => {

            // Rewrite the bat files to add exit to their end
            /*
                For example:
                
                perftest_java.bat ....
                
                would become
                
                perftest_java.bat ...
                exit

            */

           let fileContents = fs.readFileSync( file.path, 'utf8' );
           
           // Check if there is exit at the end:
            if(!fileContents.split('\n').includes('exit')){
                let toWrite = fs.readFileSync( file.path, 'utf8' ) + '\nexit';
                fs.writeFileSync(file.path, toWrite);
            }

            // Create starter for each file
            /*
                Example stater file:
                
                start /wait "" "publisher 1.bat"
                exit

            */
            let fileName = normaliseString( (file.title).replace('.bat', '') + ' starter.bat' );
            let fileOutput = '';
            fileOutput += `start /wait "" "${file.title}" \n`;
            fileOutput += `exit`;
            fs.writeFileSync( path.join(saveDir, fileName), fileOutput );
        });

    });

    // 2. Create bat file for all processes
    let files = fs.readdirSync(saveDir);
    let batFiles = files.filter(a => path.extname(a) == '.bat');

    let batOut;

    batFiles.forEach((file, index) => {
        // At this point, only starter files should be here
        
        // 3 cases: first, last and in between
        if(index == 0){                             // first
            batOut = `@echo off \n`;
            batOut += `start "" "${file}" \n`;
            batOut += `REG ADD "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /V "2.bat" /t REG_SZ /F /D "2.bat" \n`;
            batOut += `mkdir "${file.replace('.bat', '').replace('_starter', '')}" \n`;
            batOut += `move *.csv "${file.replace('.bat', '').replace('_starter', '')}" \n`;
            batOut += `pause \n`;
            batOut += `shutdown -r -t 0 \n`;
            fs.writeFileSync(`${path.join( saveDir, (index + 1) + '.bat' )}`, batOut);
            // console.log(batOut);
        }else if(index == batFiles.length - 1){         // last
            batOut = `@echo off \n`;
            batOut += `start "" "${file}" \n`;
            batOut += `REG DELETE "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /V "${index + 1}.bat" /t REG_SZ /F /D "${index + 1}.bat" \n`;
            batOut += `mkdir "${file.replace('.bat', '').replace('_starter', '')}" \n`;
            batOut += `move *.csv "${file.replace('.bat', '').replace('_starter', '')}" \n`;
            fs.writeFileSync(`${path.join( saveDir, (index + 1) + '.bat' )}`, batOut);
            // console.log(batOut);
        }else{                                      // in between
            batOut = `@echo off \n`;
            batOut += `start "" "${file}" \n`;
            batOut += `REG DELETE "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /V "${index + 1}.bat"\n`;
            batOut += `REG ADD "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" /V "${index + 2}.bat" /t REG_SZ /F /D "${index + 2}.bat" \n`;
            batOut += `mkdir "${file.replace('.bat', '').replace('_starter', '')}" \n`;
            batOut += `move *.csv "${file.replace('.bat', '').replace('_starter', '')}" \n`;
            batOut += `pause \n`;
            batOut += `shutdown -r -t 0 \n`;
            fs.writeFileSync(`${path.join( saveDir, (index + 1) + '.bat' )}`, batOut);
            // console.log(batOut);
        }
    });


    // 3. Run bat file created in step 2
    if(process.platform === 'darwin'){              // Its a mac
        exec(`chmod 755 "${path.join(saveDir, '1.bat')}" && ` + path.join(saveDir, '1.bat'), (err, stdout, stderr) => {
            if(err){
                console.log(`%c ${err}`, 'color: red;');
            }
    
            if(stdout){
                console.log(`%c ${stdout}`, 'color: green;');
            }
    
            if(stderr){
                console.log(`%c ${stderr}`, 'color: orange;');
            }
        });
    }else{
        console.log(`Executing "${path.join(saveDir, '1.bat')}"`);
        exec(`"${path.join(saveDir, '1.bat')}"`, (err, stdout, stderr) => {
            if(err){
                console.log(`%c ${err}`, 'color: red;');
            }
    
            if(stdout){
                console.log(`%c ${stdout}`, 'color: green;');
            }
    
            if(stderr){
                console.log(`%c ${stderr}`, 'color: orange;');
            }
        });        
    }

    $('.run-selection-window').hide();
    $('#run-test-window').show();
}

function setCurrentProcessDom(process){
    document.querySelector('#current-process-title').textContent = process.title;
}

function getRunOption(){
    let sel = document.querySelector('#run-test-run-option');

    if(sel.value.toLowerCase().includes('local')){
        return 'local';
    }else{
        return 'remote';
    }
}

function validateStartButton(){
    let startButton = document.querySelector('#run-test-go-button');
    let processAmount = data.processes.length;
    let emptyProcessAmount = data.processes.filter(a => a.files.length == 0).length;
    processAmount > 0 && emptyProcessAmount == 0 ? startButton.className = 'run-go-button' : startButton.className = 'run-go-button disabled';
}

$('#run-test-start').on('click', e => {
    startTests();
});

function stopTest(){
    $('.run-selection-window').show();
    $('#run-test-window').hide();
    console.log(`%c You need to implement this part.`, 'color: blue;');
}

function startTests(){
    populateRunFileList();

    $('.run-selection-window').hide();
    $('#run-test-window').show();
}

function populateRunFileList(){
    let processes = data.processes;

    let pendingProcesses = processes.filter(a => a.status.toLowerCase() == 'pending');

    let dropdown = document.querySelector('#process-dropdown-selection');

    pendingProcesses[0].files.forEach(file => {
        let optiondom = document.createElement('option');
        optiondom.value = file.path;
        optiondom.textContent = file.title;
        dropdown.appendChild(optiondom);
    });

    document.querySelector('#current-process-title').textContent = pendingProcesses[0].title;
}

function removeFileItem(event){
    let processTitle = event.target.parentElement.parentElement.parentElement.id;
    let processConfig = getProcess(processTitle);

    let fileToDel = processConfig.files.filter(a => a.path == event.target.id)[0];

    processConfig.files.splice( processConfig.files.indexOf(fileToDel) , 1 );

    fs.writeFile(runDataPath, JSON.stringify({"processes": data.processes}), err => err ? console.log(err) : populateProcesses());
}

function updateProcessRepCount(event){
    let process = getProcess(event.target.id);
    event.target.value == '' ? process.repCount = 1 : process.repCount = parseInt(event.target.value);
    let timesSpan = document.querySelector('#times-span');

    event.target.value > 1 ? timesSpan.textContent = ' times.' : timesSpan.textContent = ' time.';

    fs.writeFile(runDataPath, JSON.stringify({"processes": data.processes}), err => err ? console.log(err) : console.log(''));
}

function getProcess(processTitle){
    let processes = data.processes;
    return processes.filter(a => a.title == processTitle)[0];
}

function updateProcessTitle(event){
    let processes = data.processes;
    let currentProcess = processes.filter(a => a.title == event.target.id)[0];
    
    currentProcess.title = event.target.value;
    event.target.id = event.target.value;

    // If they press enter
    if(event.keyCode == 13){
        fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => {
            if(err){
                console.log(err);
            }else{
                populateProcesses();
            }
    
        });
    }else{
        fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => {
            if(err){
                console.log(err);
            }else{
            }
        });
    }

}

function addFileItems(){
    let fileItems = document.querySelectorAll('.file-selected');
    let processes = data.processes;
    let currentProcess = processes.filter(a => a.title == state.currentProcess.value)[0];
    let files = currentProcess.files;

    fileItems.forEach((item, index) => {
        let filePath = item.id;
        let fileName = item.textContent;

        let fileObj = {
            "title": fileName,
            "path": filePath,
            "status": "pending",
            "order": files.length + 1
        };
        
        files.push(fileObj);
    });

    fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => {
        if(err){
            console.log(err);
        }else{
            fileItems.forEach(item => {
                item.className = 'file';
            });
            $('.file-selection-window-container').hide();
            clearList(document.querySelector('#file-selection-list-container'));
            populateProcesses();
        }

    });

    validateStartButton();
}

function selectFileListItem(event){
    event.target.className == 'file' ? event.target.className = 'file file-selected' : event.target.className = 'file';
}

function deleteProcess(event){
    let id = event.target.parentElement.parentElement.parentElement.id;
    let processes = data.processes;
    
    let toDeleteProcess = processes.filter(a => a.title == id)[0];
    processes.splice(processes.indexOf(toDeleteProcess), 1);
    
    fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => err ? console.log(err) : console.log(`%c Removed a process from \n ${runDataPath}`, 'color: green;'));
    populateProcesses();
    validateStartButton();
}

function populateProcesses(){
    let processes = data.processes;
    let processList = document.querySelector('.process-list');
    let defScriptLoc = settings.defScriptLoc;

    clearList(processList);

    processes.forEach(process => {
        let processDom = createProcessDom(process.title, process.files, defScriptLoc, process);
        processList.appendChild(processDom);
    });
}

function populateFileList(event){
    let pathView = document.querySelector('.path-view');
    let newPath = event.target.files[0].path;
    pathView.textContent = newPath;
    pathView.scrollLeft = pathView.scrollWidth;
    clearList(document.querySelector('#file-selection-list-container'));

    let files = readFolder(newPath);
    files.forEach(file => {
        if(!fs.lstatSync(path.join(newPath, file)).isDirectory()){
            if(file.toLowerCase().includes('pub') || file.toLowerCase().includes('sub') || file.toLowerCase().includes('.bat')){
                createFileListItem(file, path.join(newPath, file));
            }
        }
    });

}

function createFileListItem(filename, path){
    let listItem = document.createElement('p');
    listItem.className = 'file';
    listItem.textContent = filename;
    listItem.id = path;
    listItem.addEventListener('click', e => {
        selectFileListItem(e);
    });

    fileListContainerDOM.appendChild(listItem);
}

function populateDefFileList(){
    fs.readFile(path.join( __dirname, '../data/GeneralSettings.json' ), (err, data) => {
        if(err){
            console.log(err);
        }else{
            let defScriptLoc = JSON.parse(data).defScriptLoc;
            
            document.querySelector('.path-view').textContent = defScriptLoc;

            let pathView = document.querySelector('.path-view');
            pathView.scrollLeft = pathView.scrollWidth;

            fs.readdir(defScriptLoc, (err, files) => {
                if(err){
                    console.log(err);
                }else{
                    files.forEach(file => {
                        if(!fs.lstatSync(path.join(defScriptLoc, file)).isDirectory()){
                            if(file.toLowerCase().includes('pub') || file.toLowerCase().includes('sub') || file.toLowerCase().includes('.bat')){
                                createFileListItem(file, path.join(defScriptLoc, file));
                            }
                        }
                    });
                }
            });
        }
    });
}

function addProcess(){
    /*
        1. Get amount of processes
        2. Put next process title as step 1 + 1
        3. Create process dom
        4. Append process dom
    */

    let processList = document.querySelector('.process-list');

    // processList.childElementCount == 0 when the page is fresh
    let processAmount = processList.childElementCount;

    let newProcessTitle = 'Test ' + (processAmount + 1);

    let processDom = createProcessDom(newProcessTitle);

    processList.appendChild(processDom);

    let processObj = {
        "title": newProcessTitle,
        "repCount": 1,
        "currentRep": 0,
        "status": "pending",
        "files": []
    };

    let processes = data.processes;
    processes.push(processObj);

    fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => err ? console.log(err) : console.log());
    validateStartButton();

}

function createProcessDom(newProcessTitle, files, pathvalue, process){
    let processDiv = document.createElement('div');                         //  <div class="process">
    processDiv.className = 'process';                                       //  </div>
    processDiv.id = newProcessTitle;

    let topBar = document.createElement('div');
    topBar.className = 'top-bar';

    let processTitleInput = document.createElement('input');                //  <input class="process-title process-title-input">
    processTitleInput.value = newProcessTitle;                              //  </input>
    processTitleInput.className = 'process-title process-title-input';
    processTitleInput.id = newProcessTitle;
    processTitleInput.addEventListener('keyup', e => {
        updateProcessTitle(e);
    });

    let repCountDiv = document.createElement('div');
    repCountDiv.className = 'rep-count-container';
    
    let runSpan = document.createElement('span');
    runSpan.textContent = 'Run ';
    runSpan.className = 'run-span';
    let repCountInput = document.createElement('input');
    repCountInput.value = 1;
    repCountInput.className = 'run-input';
    repCountInput.id = newProcessTitle;
    repCountInput.addEventListener('keyup', e => {
        updateProcessRepCount(e);
    });
    process != undefined ? repCountInput.value = process.repCount : repCountInput.value = 1;
    let timesSpan = document.createElement('span');
    timesSpan.id = 'times-span';
    process != undefined && process.repCount > 1 ? timesSpan.textContent = ' times.' : timesSpan.textContent = ' time.';
    timesSpan.className = 'times-span';

    repCountDiv.appendChild(runSpan);
    repCountDiv.appendChild(repCountInput);
    repCountDiv.appendChild(timesSpan);

    topBar.appendChild(processTitleInput);
    topBar.appendChild(repCountDiv);

    let processContainerDiv = document.createElement('div');                //  <div class="process-container">
    processContainerDiv.className = 'process-container';                    //  </div>

    let fileContainerDiv = document.createElement('div');                   //  <div class="file-container">
    fileContainerDiv.className = 'file-container';                          //  </div>

    if(files != undefined){
        if(files.length > 0){
            files.forEach((file, index) => {
                let fileItem = document.createElement('p');
                fileItem.className = 'file-name';
                fileItem.textContent = file.title;
                fileItem.id = path.join(pathvalue, file.title);
                fileItem.addEventListener('click', e => {removeFileItem(e)});
                fileContainerDiv.appendChild(fileItem);
            });
        }
    }


    let resetButtonContainerDiv = document.createElement('div');            //  <div class="reset-button-container">
    resetButtonContainerDiv.className = 'reset-button-container';           //      <ion-icon name="trash"></ion-icon>    
    let trashIconDiv = document.createElement('ion-icon');                  //  </div>
    trashIconDiv.name = 'trash';
    resetButtonContainerDiv.appendChild(trashIconDiv);
    resetButtonContainerDiv.addEventListener('click', e => deleteProcess(e));

    let addFileContainerDiv = document.createElement('div');                //  <div class="add-file-container">
    addFileContainerDiv.className = 'add-file-container';                   //      <ion-icon name="add"></ion-icon>
    addFileContainerDiv.addEventListener('click', e => {
        populateDefFileList();
        setState('currentProcess', newProcessTitle);
        $('.file-selection-window-container').show();
    });
    let addIconDiv = document.createElement('ion-icon');                    //  </div>
    addIconDiv.name = 'add';
    addFileContainerDiv.appendChild(addIconDiv);

    processContainerDiv.appendChild(fileContainerDiv);                      //  <div class="process-container">
    processContainerDiv.appendChild(resetButtonContainerDiv);               //      <div class="file-container"></div>
    processContainerDiv.appendChild(addFileContainerDiv);                   //      <div class="reset-button-container"></div>
                                                                            //      <div class="add-file-container"></div>
                                                                            //  </div>  

    processDiv.appendChild(topBar);
    // processDiv.appendChild(processTitleInput);
    // processDiv.appendChild(repCountDiv);
    processDiv.appendChild(processContainerDiv);

    return processDiv;

}