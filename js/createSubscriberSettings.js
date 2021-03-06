let quickCreateSubSettingVals = readData( path.join(__dirname, '../data/CreateSubscriberSettings.json') );
let createSubOutputContainer = document.querySelector('.quick-create-subscriber-settings-container');

// Render inputs from quick create subscriber settings file
quickCreateSubSettingVals.forEach(item => {
    let divDOM = document.createElement('div');
    divDOM.className = 'quick-create-setting';

    let pDOM = document.createElement('p');
    pDOM.textContent = item.title;

    let spanDOM = document.createElement('span');
    spanDOM.className = 'quick-create-setting-description';
    spanDOM.textContent = item.description;

    let inputDOM;

    if(item.type == 'boolean'){
        inputDOM = document.createElement('ion-icon');
        
        if(item.value == 'false'){
            inputDOM.name = 'close-circle-outline';
        }else{
            inputDOM.name = 'checkmark-circle-outline';
        }
        
        inputDOM.id = item.id;

        inputDOM.className = 'checkmark';

        inputDOM.addEventListener('click', e => updateSubSetting(e));
        
    }else if(item.type == 'dropdown'){
        inputDOM = document.createElement('select');

        inputDOM.id = item.id;

        item.options.forEach(option => {
            let optionDOM = document.createElement('option');
            optionDOM.value = option;
            optionDOM.textContent = option;
            
            if(option.includes(item.value)){
                optionDOM.setAttribute('selected', true);
            }
            
            inputDOM.appendChild(optionDOM);
        });

        inputDOM.addEventListener('change', e => updateSubSetting(e));

    }else if(item.type == 'input'){
        inputDOM = document.createElement('input');

        inputDOM.type = 'number';

        inputDOM.id = item.id;

        inputDOM.value = item.value;

        inputDOM.addEventListener('keyup', e => updateSubSetting(e));
    }else if(item.type == 'file'){
        inputDOM = document.createElement('input');
        inputDOM.type = 'file';
        inputDOM.id = item.id;

        inputDOM.addEventListener('change', e => updateSubSetting(e));
    }

    pDOM.appendChild(document.createElement('br'));
    pDOM.appendChild(spanDOM);
    divDOM.appendChild(pDOM);
    divDOM.appendChild(inputDOM);

    createSubOutputContainer.appendChild(divDOM);
});

function updateSubSetting(e){
    let eTag = e.target.tagName;
    let eId = e.target.id;
    let eType;
    let settingValue;
    let settingIndex;

    let allSettings = JSON.parse(fs.readFileSync( path.join( __dirname, '../data/CreateSubscriberSettings.json' ) ));

    allSettings.forEach((setting, index) => {
        if(setting.id == eId){
            settingValue =  setting;
            settingIndex = index;
        }
    });

    if(eTag.toLowerCase() == 'ion-icon'){
        
        if(e.target.name == 'close-circle-outline'){
            e.target.name = 'checkmark-circle-outline';
            settingValue.value = true;
        }else{
            e.target.name = 'close-circle-outline';
            settingValue = false;
        }

    }else if(eTag.toLowerCase() == 'select'){

    }else if(eTag.toLowerCase() == 'input'){

        eType = e.target.type;

        if(eType.toLowerCase() == 'number'){
            
            settingValue.value = e.target.value;

        }else if(eType.toLowerCase() == 'file'){

            settingValue.value = e.target.files[0].path;

        }
    }

    fs.writeFile(path.join( __dirname, '../data/CreateSubscriberSettings.json' ), JSON.stringify(allSettings), err => {
        if(err){
            console.log(err);
        }else{
            console.log('Updated CreateSubscriberSettings.json!');
        }
    });
}