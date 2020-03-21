// Set values of all general settings on start
let genSettingVals = readData( path.join(__dirname, '../data/GeneralSettings.json') );

let defPerftestLocFileNameDOM = document.querySelector('#defPerftestLocFileName');
let defScriptLocFileNameDOM = document.querySelector('#defScriptLocFileName');
let testFolderLocFileNameDOM = document.querySelector('#testFolderLocFileName');
let pubResultLocFileNameDOM = document.querySelector('#pubResultLocFileName');
let subResultLocFileNameDOM = document.querySelector('#subResultLocFileName');
let nddsHomeLocFileNameDOM = document.querySelector('#nddsHomeLocFileName');

defPerftestLocFileNameDOM.textContent = normalisePath(genSettingVals.defPerftestLoc);
defScriptLocFileNameDOM.textContent = normalisePath(genSettingVals.defScriptLoc);
testFolderLocFileNameDOM.textContent = normalisePath(genSettingVals.testFolderLoc);
pubResultLocFileNameDOM.textContent = normalisePath(genSettingVals.pubResultLoc);
subResultLocFileNameDOM.textContent = normalisePath(genSettingVals.subResultLoc);
nddsHomeLocFileNameDOM.textContent = normalisePath(genSettingVals.nddsHomeLoc);

// Collapse all collapses
$('.collapse').collapse('hide');

$('#defPerftestLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    if(!path.basename(newPath).includes('perftest_java.bat')){
        showPopup("That file isn't perftest_java.bat.");
    }else{

        oldData.defPerftestLoc = newPath;

        fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
            if(err){
                console.log(err);
            }else{
                defPerftestLocFileNameDOM.textContent = normalisePath(newPath);
            }
        });
    }
})

$('#defScriptLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.defScriptLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            defScriptLocFileNameDOM.textContent = normalisePath(newPath);
        }
    });
})

$('#testFolderLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.testFolderLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            testFolderLocFileNameDOM.textContent = normalisePath(newPath);
        }
    });
})

$('#pubResultLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.pubResultLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            pubResultLocFileNameDOM.textContent = normalisePath(newPath);
        }
    });
})

$('#subResultLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.subResultLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            subResultLocFileNameDOM.textContent = normalisePath(newPath);
        }
    });
})

$('#nddsHomeLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.nddsHomeLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            nddsHomeLocFileNameDOM.textContent = normalisePath(newPath);
        }
    });
})

function normalisePath(pathVal){
    return path.join( path.basename(path.dirname(pathVal)), path.basename(pathVal) );
}

function togglePathView(id, setting){
    let textDOM = $(id)[0].textContent;
    let classDOM = $(id)[0].className;

    if(textDOM == setting || classDOM == 'file-name path-view'){
        $(id)[0].className = 'file-name';
        $(id)[0].textContent = normalisePath(setting);

    }else{
        $(id)[0].className = 'file-name path-view';
        $(id)[0].textContent = setting;
    }

}