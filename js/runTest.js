let state = document.querySelector('#runContent').attributes;
let fileListContainerDOM = document.querySelector('#file-selection-list-container');

$('.file-selection-window-container').hide();

populateFileList();

$('#close-button').on('click', e => {
    $('.file-selection-window-container').hide();
});

$('.add-file-container').on('click', e => {
    $('.file-selection-window-container').show();
});

function populateFileList(){
    fs.readFile(path.join( __dirname, '../data/GeneralSettings.json' ), (err, data) => {
        if(err){
            console.log(err);
        }else{
            let defScriptLoc = JSON.parse(data).defScriptLoc;

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

}

function createProcessDom(newProcessTitle){
    let processDiv = document.createElement('div');                         //  <div class="process">
    processDiv.className = 'process';                                       //  </div>

    let processTitleInput = document.createElement('input');                //  <input class="process-title process-title-input">
    processTitleInput.value = newProcessTitle;                              //  </input>
    processTitleInput.className = 'process-title process-title-input';

    let processContainerDiv = document.createElement('div');                //  <div class="process-container">
    processContainerDiv.className = 'process-container';                    //  </div>

    let fileContainerDiv = document.createElement('div');                   //  <div class="file-container">
    fileContainerDiv.className = 'file-container';                          //  </div>

    let resetButtonContainerDiv = document.createElement('div');            //  <div class="reset-button-container">
    resetButtonContainerDiv.className = 'reset-button-container';           //      <ion-icon name="trash"></ion-icon>    
    let trashIconDiv = document.createElement('ion-icon');                  //  </div>
    trashIconDiv.name = 'trash';
    resetButtonContainerDiv.appendChild(trashIconDiv);

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