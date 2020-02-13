// $('#create-test-index').hide();
$('#create-test-settings').hide();
$('.test-list-content .empty-message').hide();

populateTestList();

$('#test-list-folder-selection-input').on('change', e => {
    populateTestList(e.target.files[0].path);
});

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

                for(var i = 1; i < fileAmount + 1; i++){
                    let fileLocation = path.join( newFolder, 'File ' + i + '.bat');
                    createFile('', fileLocation);

                    // Redirect to file settings page here
                    $('#create-test-index').hide();
                    $('#create-test-settings').show();

                }

            }else{
                showPopup("Test already exists with that name in that location!");
            }

        }
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

function createTestListItem(title, pathValue){
    let pdom = document.createElement('p');
    
    pdom.className = 'test-list-item';

    pdom.setAttribute('path', pathValue);

    pdom.textContent = title;

    pdom.addEventListener('click', e => {openTestSettings(e.target)});

    return pdom;
}

function openTestSettings(element){
    $('#create-test-index').hide();
    $('#create-test-settings').show();
}

function showTestSettingsPage(){
    $('#create-test-index').show();
    $('#create-test-settings').hide();
}