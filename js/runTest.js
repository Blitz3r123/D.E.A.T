let fileListContainerDOM = document.querySelector('#file-selection-list-container');

populateFileList();

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