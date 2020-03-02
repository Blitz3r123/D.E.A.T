let rdpState = document.querySelector('#rdp-settings-container');
let rdpData;

rdpConstructor();

async function rdpConstructor(){
    try{
        rdpData = await asyncReadData(path.join(__dirname, './../data/RDPSettings.json'));
    }catch(err){
        console.log(`%c ${err}`, 'color: red;');
    }

    // $('.add-rdp-connection-container').hide();

    renderList();
}

$('#add-rdp-button').on('click', e => {
    addRDPConnection(e);
    renderList();
});

async function deleteRDPConnection(event){
    let conName = unnormaliseString(event.target.id.replace('rdp-delete-', ''));

    let toDelete = rdpData.filter(a => {return a.title == conName})[0];
    rdpData.splice( rdpData.indexOf(toDelete), 1 );
    await asyncWriteFile(path.join(__dirname, './../data/RDPSettings.json'), JSON.stringify(rdpData));
}

function addRDPConnection(event){
    // console.log(event.target.parentElement.parentElement.childNodes);
    let parentElem = event.target.parentElement.parentElement;
    let titleVal = parentElem.childNodes[5].childNodes[3].value;
    let domainVal = parentElem.childNodes[7].childNodes[3].value;
    let usernameVal = parentElem.childNodes[9].childNodes[3].value;
    let passwordVal = parentElem.childNodes[11].childNodes[3].value;

    if(titleVal == '' || domainVal == '' || usernameVal == '' || passwordVal == ''){
        showPopup("You can't leave anything empty!");
        return;
    }else{
        // console.log(`%c titleVal:>|${titleVal}|<`, 'background: #eee; color: blue;');
        // console.log(`%c domainVal:>|${domainVal}|<`, 'background: #eee; color: blue;');
        // console.log(`%c usernameVal:>|${usernameVal}|<`, 'background: #eee; color: blue;');
        // console.log(`%c passwordVal:>|${passwordVal}|<`, 'background: #eee; color: blue;');
    
        let connection = {
            title: titleVal,
            domain: domainVal,
            username: usernameVal,
            password: passwordVal
        };
    
        rdpData.push(connection);

        fs.writeFile(path.join(__dirname, './../data/RDPSettings.json'), JSON.stringify(rdpData), err => {
            if(err){
                console.log(`%c err`, 'color: red;');
            }else{
                $('.add-rdp-connection-container').hide();
            }
        });

    }

    // Reset input values
    document.querySelector('#rdp-connection-title').value = '';
    document.querySelector('#rdp-domain').value = '';
    document.querySelector('#rdp-username').value = '';
    document.querySelector('#rdp-password').value = '';

}

function showRDPAdd(){
    $('.add-rdp-connection-container').show();
}

$('#close-rdp-box').on('click', e => {
    $('.' + e.target.parentElement.parentElement.className).hide();
});

function renderList(){
    let connectionList = document.querySelector('#rdp-connection-list');
    clearList(connectionList);
    rdpData.forEach(connection => {
        connectionList.appendChild(createConnectionItem(connection));
    });

    connectionList.appendChild(createAddRDPButton());
}

function createConnectionItem(connection){
    // Outermost container
    let itemContainer = document.createElement('div');
    itemContainer.className = 'connection-list-item';

    // Title
    let titleContainer = document.createElement('div');
    titleContainer.className = 'connection-list-item-title-container';
    let titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = connection.title;
    titleInput.className = 'connection-list-item-title';
    titleInput.id = 'rdp-title-' + normaliseString(connection.title);
    titleInput.addEventListener('keyup', e => {
        updateRDPTitle(e);
    });
    titleContainer.appendChild(titleInput);

    // Content
    let contContainer = document.createElement('div');
    contContainer.className = 'connection-list-item-content-container';
        
        // Domain
        let domainContainer = document.createElement('div');
        domainContainer.className = 'domain-container';
        let domainInput = document.createElement('input');
        domainInput.type = 'text';
        domainInput.className = 'domain';
        domainInput.placeholder = 'Domain';
        domainInput.value = connection.domain;
        domainInput.id = 'rdp-domain-' + normaliseString(connection.domain);
        domainInput.addEventListener('keyup', e => {
            updateRDPDomain(e);
        });
        domainContainer.appendChild(domainInput);
        contContainer.appendChild(domainContainer);

        // Login
        let logContainer = document.createElement('div');
        logContainer.className = 'login-details-container';
        
            // Username
            let userInput = document.createElement('input');
            userInput.type = 'text';
            userInput.className = 'username';
            userInput.placeholder = 'Username';
            userInput.value = connection.username;
            userInput.id = 'rdp-username-' + normaliseString(connection.username);
            userInput.addEventListener('keyup', e => {
                updateRDPUsername(e);
            });
            logContainer.appendChild(userInput);

            // Password
            let passContainer = document.createElement('div');
            passContainer.className = 'password-container';
            let passInput = document.createElement('input');
            passInput.type = 'password';
            passInput.placeholder = 'Password';
            passInput.value = connection.password;
            passInput.id = 'rdp-password-' + normaliseString(connection.password);
            passInput.addEventListener('keyup', e => {
                updateRDPPassword(e);
            });
            let passIcon = document.createElement('ion-icon');
            passIcon.name = 'eye';
            passIcon.addEventListener('click', e => {
                showPassword(e);
            });
            passContainer.appendChild(passInput);
            passContainer.appendChild(passIcon);
            logContainer.appendChild(passContainer);

        contContainer.appendChild(logContainer);

        // Edit
        let editContainer = document.createElement('div');
        editContainer.className = 'edit-container';
        let editIcon = document.createElement('ion-icon');
        editIcon.name = 'trash';
        editIcon.className = 'delete';
        editIcon.id = 'rdp-delete-' + normaliseString(connection.title);
        editIcon.addEventListener('click', e => {
            deleteRDPConnection(e);
            renderList();
        });
        editContainer.appendChild(editIcon);
        contContainer.appendChild(editContainer);
        
    itemContainer.appendChild(titleContainer);
    itemContainer.appendChild(contContainer);

    return itemContainer;
}

function createAddRDPButton(){
    let div = document.createElement('div');
    let icon = document.createElement('ion-icon');

    div.className = 'add-connection-container';
    icon.name = 'add';
    icon.id = 'rdp-add';
    icon.addEventListener('click', e => showRDPAdd());

    div.appendChild(icon);

    return div;
}

function showPassword(event){
    let currType = event.target.parentElement.childNodes[0].type;
    if(currType == 'password'){
        event.target.parentElement.childNodes[0].type = 'text';
    }else{
        event.target.parentElement.childNodes[0].type = 'password';
    }
}