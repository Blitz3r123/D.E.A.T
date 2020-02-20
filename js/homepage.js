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
}