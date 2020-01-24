// Get files for analysis
$('#folder-selection-input').on('change', e => {
    let pathValue = document.querySelector('#folder-selection-input').files[0].path;

    let files = readFolder(pathValue);

    let analysePublisherListDOM = document.querySelector('#analyse-publisher-list');
    let analyseSubscriberListDOM = document.querySelector('#analyse-subscriber-list');

    files.forEach(file => {
        let item = document.createElement('p');
        item.className = 'analyse-section-list-item';

        item.addEventListener('click', e => {
            analyseFile(path.join(pathValue, file));
        });

        item.textContent = file;

        if(file.toLowerCase().includes('pub')){
            $('#publisher-empty-message').hide();
            analysePublisherListDOM.appendChild(item);
        }else if(file.toLowerCase().includes('sub')){
            $('#subscriber-empty-message').hide();
            analyseSubscriberListDOM.appendChild(item);
        }
    });
});

function analyseFile(file){
    let fileExtension = file.substr(file.indexOf('.'), file.length);
    $('.analyse-selection-window').hide();
    $('.analysis-window').show();

    document.querySelector('#analyse-current-tab').textContent = path.basename(file);
}
