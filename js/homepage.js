$('#recent-empty-message').hide();

populateQuickRunLists();
renderRecentResults();


function renderRecentResults(){
    let generalSettings = readData(__dirname + '/../data/GeneralSettings.json');
    let resDir = generalSettings.pubResultLoc;                                      // resDir = results directory

    if(pathExists(resDir) && isFolder(resDir)){                                     // Check path exists and that it is a folder

        let files = fs.readdirSync(resDir);
        let csvFiles = files.filter(file => {return path.extname(file) == '.csv'});

        if(csvFiles.length == 0){                                                   // No csv files so display empty message

            $('#recent-empty-message').show();
            
        }else{

            let pubFiles = csvFiles.filter(file => path.basename(file).toLowerCase().includes('pub'));
            let subFiles = csvFiles.filter(file => path.basename(file).toLowerCase().includes('sub'));

            if(pubFiles.length == 0){

                displayGraph( path.join( resDir, subFiles[0] ));

            }else{

                displayGraph( path.join( resDir, pubFiles[0] ));

            }
        }

    }else{
        console.log(`%c I can't find the path \n ${resDir}`, 'color: red;');
    }

}

function displayGraph(filepath){

    fs.readFile(filepath, 'utf8', (err, data) => {
        if(err){
            console.log(`%c ${err}`, 'color: red;');
        }else{
            data = getRawData(data);

            let title = document.querySelector('#recent-graph-title');

            title.textContent = path.join( path.basename(path.dirname(filepath)), path.basename(filepath) );

            let chart = c3.generate({
                bindto: `#recent-graph`,
                data: {
                    columns: [
                        data
                    ]
                }
            });
        }
    });

}

function getRawData(data){
    let rows = data.split('\n');

    let headings = rows[0].split(',');

    let item;

    let normData = [];

    let indexToUse;

    rows.forEach(row => {

        if( row.split(',')[0] == '' || row.split(',')[0] == ' '){
            item = row.split(',')[1];
            indexToUse = 1;
        }else{
            item = row.split(',')[0];
            indexToUse = 0;
        }

        if(!isNaN(item)){
            normData.push(item);
        }

    });

    normData.unshift(headings[indexToUse]);

    return normData;

}

function populateQuickRunLists(){
    let generalSettings = readData(__dirname + '/../data/GeneralSettings.json');
    let defScriptLoc = generalSettings.defScriptLoc;

    let scriptFiles = readFolder(defScriptLoc);

    clearList(document.querySelector('.pub-list'));
    clearList(document.querySelector('.sub-list'));

    if(scriptFiles.length <= 1){
        let pdom = document.createElement('p');
        pdom.className = 'list-item';
        pdom.textContent = "Couldn't find anything. Why not create one?";

        document.querySelector('.pub-list').appendChild(pdom);

        pdom = document.createElement('p');
        pdom.className = 'list-item';
        pdom.textContent = "Couldn't find anything. Why not create one?";

        document.querySelector('.sub-list').appendChild(pdom);
    }else{
        scriptFiles.forEach(file => {
            let pdom = document.createElement('p');
            pdom.className = 'list-item';
            pdom.textContent = file;
            if(file.toLowerCase().includes('pub')){
                document.querySelector('.pub-list').appendChild(pdom);
            }else if(file.toLowerCase().includes('sub')){
                document.querySelector('.sub-list').appendChild(pdom);
            }
        });
    }
}

function createDefPub(){
    let generalSettings = readData(__dirname + '/../data/GeneralSettings.json');
    let defScriptLoc = generalSettings.defScriptLoc;
    let perfTestLoc = generalSettings.defPerftestLoc;

    let pubFiles = readFolder(defScriptLoc).filter(a => a.toLowerCase().includes('publisher'));

    let newName = 'Publisher ' + (pubFiles.length + 1) + '.bat';

    let generalSettingValues = readData(__dirname + '/../data/CreateGeneralSettings.json');
    let publisherSettingValues = readData(__dirname + '/../data/CreatePublisherSettings.json');

    let output = createPubBatOutput(perfTestLoc, generalSettingValues, publisherSettingValues);

    fs.writeFile(path.join(defScriptLoc, newName), output, err => err ? console.log(err) : console.log(''));
    showPopup('Publisher Created in ' + defScriptLoc + '!');
    populateQuickRunLists();
}

function createDefSub(){
    let generalSettings = readData(__dirname + '/../data/GeneralSettings.json');
    let defScriptLoc = generalSettings.defScriptLoc;
    let perfTestLoc = generalSettings.defPerftestLoc;

    let subFiles = readFolder(defScriptLoc).filter(a => a.toLowerCase().includes('subscriber'));

    let newName = 'Subscriber ' + (subFiles.length + 1) + '.bat';

    let generalSettingValues = readData(__dirname + '/../data/CreateGeneralSettings.json');
    let SubscriberSettingValues = readData(__dirname + '/../data/CreateSubscriberSettings.json');

    let output = createSubBatOutput(perfTestLoc, generalSettingValues, SubscriberSettingValues);

    fs.writeFile(path.join(defScriptLoc, newName), output, err => err ? console.log(err) : console.log(''));
    showPopup('Subscriber Created in ' + defScriptLoc + '!');
    populateQuickRunLists();
}