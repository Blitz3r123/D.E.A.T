// Set values of all general settings on start
let genSettingVals = readData( path.join(__dirname, '../data/GeneralSettings.json') );

let defPerftestLocFileNameDOM = document.querySelector('#defPerftestLocFileName');
let defScriptLocFileNameDOM = document.querySelector('#defScriptLocFileName');
let pubResultLocFileNameDOM = document.querySelector('#pubResultLocFileName');
let subResultLocFileNameDOM = document.querySelector('#subResultLocFileName');
let nddsHomeLocFileNameDOM = document.querySelector('#nddsHomeLocFileName');

defPerftestLocFileNameDOM.textContent = normalisePath(genSettingVals.defPerftestLoc);
defScriptLocFileNameDOM.textContent = normalisePath(genSettingVals.defScriptLoc);
pubResultLocFileNameDOM.textContent = normalisePath(genSettingVals.pubResultLoc);
subResultLocFileNameDOM.textContent = normalisePath(genSettingVals.subResultLoc);
nddsHomeLocFileNameDOM.textContent = normalisePath(genSettingVals.nddsHomeLoc);

$('#defPerftestLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.defPerftestLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            console.log('Written to file!');
            defPerftestLocFileNameDOM.textContent = path.join( path.dirname(newPath), path.basename(newPath) );
        }
    });
})

$('#defScriptLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.defScriptLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            console.log('Written to file!');
            defScriptLocFileNameDOM.textContent = newPath;
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
            console.log('Written to file!');
            pubResultLocFileNameDOM.textContent = newPath;
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
            console.log('Written to file!');
            subResultLocFileNameDOM.textContent = newPath;
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
            console.log('Written to file!');
            nddsHomeLocFileNameDOM.textContent = newPath;
        }
    });
})

function normalisePath(pathVal){
    return path.join( path.basename(path.dirname(pathVal)), path.basename(pathVal) );
}