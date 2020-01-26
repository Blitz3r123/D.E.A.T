let quickCreateGenSettingVals = readData( path.join(__dirname, '../data/QuickCreateGeneralSettings.json') );

let outputContainer = document.querySelector('#quick-create-general-settings-container');

console.log(outputContainer);

quickCreateGenSettingVals.forEach(item => {

    let divDOM = document.createElement('div');
    divDOM.className = 'quick-create-setting';

    let pDOM = document.createElement('p');
    pDOM.textContent = item.title;

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
    }else if(item.type == 'dropdown'){
        inputDOM = document.createElement('select');

        item.options.forEach(option => {
            let optionDOM = document.createElement('option');
            optionDOM.value = option;
            optionDOM.textContent = option;
            
            if(option.includes(item.value)){
                optionDOM.setAttribute('selected', true);
            }
            
            inputDOM.appendChild(optionDOM);
        });

    }else if(item.type == 'input'){
        inputDOM = document.createElement('input');

        inputDOM.type = 'number';

        inputDOM.id = item.id;

        inputDOM.value = item.value;
    }

    divDOM.appendChild(pDOM);
    divDOM.appendChild(inputDOM);

    outputContainer.appendChild(divDOM);

});