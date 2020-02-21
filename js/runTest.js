let runDataPath = path.join(__dirname, '../data/RunTest.json');
let state = document.querySelector('#runContent').attributes;
let data = readData(path.join(__dirname, '../data/RunTest.json'));
let fileListContainerDOM = document.querySelector('#file-selection-list-container');

$('.file-selection-window-container').hide();

runConstructor();

$('#close-button').on('click', e => {
    $('.file-selection-window-container').hide();
});

$('.add-file-container').on('click', e => {
    populateDefFileList();
    $('.file-selection-window-container').show();
});

$('.folder-selection-input').on('change', e => populateFileList(e));

function runConstructor(){
    populateProcesses();
}

function deleteProcess(event){
    let id = event.target.parentElement.parentElement.parentElement.id;
    let processes = data.processes;

    let toDeleteProcess = processes.filter(a => a.title == id)[0];
    processes.splice(processes.indexOf(toDeleteProcess), 1);

    fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => err ? console.log(err) : console.log(''));
    populateProcesses();
}

function populateProcesses(){
    let processes = data.processes;
    let processList = document.querySelector('.process-list');

    clearList(processList);

    processes.forEach(process => {
        let processDom = createProcessDom(process.title, process.files);
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
                let listItem = document.createElement('p');
                listItem.className = 'file';
                listItem.textContent = file;

                fileListContainerDOM.appendChild(listItem);
            }
        }
    });

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
                        let pDOM = document.createElement('p');
                        pDOM.className = 'file';
                        pDOM.textContent = file;

                        let fileListDOM = document.querySelector('#file-selection-list-container');
                        fileListDOM.appendChild(pDOM);
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

    // processList.childElementCount == 1 when the page is fresh
    let processAmount = processList.childElementCount;

    let newProcessTitle = 'Process ' + (processAmount + 1);

    let processDom = createProcessDom(newProcessTitle);

    processList.appendChild(processDom);

    let processObj = {
        "title": newProcessTitle,
        "files": []
    };

    let processes = data.processes;
    processes.push(processObj);

    fs.writeFile(runDataPath, JSON.stringify({"processes": processes}), err => err ? console.log(err) : console.log());

}

function createProcessDom(newProcessTitle, files){
    let processDiv = document.createElement('div');                         //  <div class="process">
    processDiv.className = 'process';                                       //  </div>
    processDiv.id = newProcessTitle;

    let processTitleInput = document.createElement('input');                //  <input class="process-title process-title-input">
    processTitleInput.value = newProcessTitle;                              //  </input>
    processTitleInput.className = 'process-title process-title-input';

    let processContainerDiv = document.createElement('div');                //  <div class="process-container">
    processContainerDiv.className = 'process-container';                    //  </div>

    let fileContainerDiv = document.createElement('div');                   //  <div class="file-container">
    fileContainerDiv.className = 'file-container';                          //  </div>

    if(files != undefined){
        if(files.length > 0){
            files.forEach((file, index) => {
                let fileItem = document.createElement('p');
                fileItem.className = 'file-name';
                let spanItem = document.createElement('span');
                spanItem.className = 'file-number';
                spanItem.textContent = file.order;
                let fileName = document.createElement('span');
                fileName.textContent = file.title;
                fileItem.appendChild(spanItem);
                fileItem.appendChild(fileName);
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
    let addIconDiv = document.createElement('ion-icon');                    //  </div>
    addIconDiv.name = 'add';
    addFileContainerDiv.appendChild(addIconDiv);

    processContainerDiv.appendChild(fileContainerDiv);                      //  <div class="process-container">
    processContainerDiv.appendChild(resetButtonContainerDiv);               //      <div class="file-container"></div>
    processContainerDiv.appendChild(addFileContainerDiv);                   //      <div class="reset-button-container"></div>
                                                                            //      <div class="add-file-container"></div>
                                                                            //  </div>  

    processDiv.appendChild(processTitleInput);
    processDiv.appendChild(processContainerDiv);

    return processDiv;

}