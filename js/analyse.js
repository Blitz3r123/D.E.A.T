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
    /*
        Todo:
        - Check if it a publisher or subscriber
        - Get the data and put it in the table
        - Get the data and make cdf from it
    */

    let fileExtension = file.substr(file.indexOf('.'), file.length);
    
    // Check file is .csv
    if(!fileExtension.includes('.csv')){
        showPopup('File has to be .csv, this file is ' + fileExtension);
    }else{
        
        $('.analyse-selection-window').hide();
        $('.analysis-window').show();
        document.querySelector('#analyse-current-tab').textContent = path.basename(file);
    
        let analysisTableDOM = document.querySelector('#analysis-data-table');

        fs.readFile(file, 'utf8', (err, data) => {
            if(err){
                console.log(err);
            }else{
                let dataArray = data.split('\n');
    
                if(file.toLowerCase().includes('pub')){
                    dataArray = dataArray.slice(1, dataArray.length - 4);

                    let theadDOM = document.createElement('thead');
                    theadDOM.className = 'thead-dark';
                    
                    let trDOM = document.createElement('tr');

                    let latencyThDOM = document.createElement('th');
                    latencyThDOM.scope = 'col';
                    latencyThDOM.textContent = 'One-Way Latency (us)';

                    trDOM.appendChild(latencyThDOM);

                    theadDOM.appendChild(trDOM);

                    analysisTableDOM.appendChild(theadDOM);

                    let latencyArray = [];

                    let tbodyDOM = document.createElement('tbody');

                    dataArray.forEach(row => {
                        let dataTrDOM = document.createElement('tr');
                        let latencyTdDOM = document.createElement('td');

                        latencyTdDOM.textContent = row;

                        dataTrDOM.appendChild(latencyTdDOM);

                        tbodyDOM.appendChild(dataTrDOM);
                    });

                    analysisTableDOM.appendChild(tbodyDOM);

                }else{
                    let totalPacketsArray = [];
                    let packetsPerSecArray = [];
                    let throughputArray = [];
                    let packetsLostArray = [];

                    dataArray = dataArray.slice(1, dataArray.length - 2);  

                    dataArray.forEach(row => {
                        let rowData = row.split(',');

                        totalPacketsArray.push(rowData[1]);
                        packetsPerSecArray.push(rowData[2]);
                        throughputArray.push(rowData[3]);
                        packetsLostArray.push(rowData[4]);
                    });

                    let theadDOM = document.createElement('thead');
                    theadDOM.className = 'thead-dark';

                    let trDOM = document.createElement('tr');

                    let totalPacketsThDOM = document.createElement('th');
                    totalPacketsThDOM.scope = 'col';
                    totalPacketsThDOM.textContent = 'Total Packets';

                    let packetsPerSecThDOM = document.createElement('th');
                    packetsPerSecThDOM.scope = 'col';
                    packetsPerSecThDOM.textContent = 'Packets Per Sec';

                    let throughputThDOM = document.createElement('th');
                    throughputThDOM.scope = 'col';
                    throughputThDOM.textContent = 'Throughput';

                    let packetsLostThDOM = document.createElement('th');
                    packetsLostThDOM.scope = 'col';
                    packetsLostThDOM.textContent = 'Packets Lost';

                    trDOM.appendChild(totalPacketsThDOM);
                    trDOM.appendChild(packetsPerSecThDOM);
                    trDOM.appendChild(throughputThDOM);
                    trDOM.appendChild(packetsLostThDOM);

                    theadDOM.appendChild(trDOM);

                    analysisTableDOM.appendChild(theadDOM);

                    let tbodyDOM = document.createElement('tbody');

                    for(var i = 0; i < totalPacketsArray.length; i ++){
                        let dataTrDOM = document.createElement('tr');
                        let totalPacketsTdDOM = document.createElement('td');
                        let packetsPerSecTdDOM = document.createElement('td');
                        let throughputTdDOM = document.createElement('td');
                        let packetsLostTdDOM = document.createElement('td');

                        totalPacketsTdDOM.textContent = totalPacketsArray[i];
                        packetsPerSecTdDOM.textContent = packetsPerSecArray[i];
                        throughputTdDOM.textContent = throughputArray[i];
                        packetsLostTdDOM.textContent = packetsLostArray[i];

                        dataTrDOM.appendChild(totalPacketsTdDOM);
                        dataTrDOM.appendChild(packetsPerSecTdDOM);
                        dataTrDOM.appendChild(throughputTdDOM);
                        dataTrDOM.appendChild(packetsLostTdDOM);

                        tbodyDOM.appendChild(dataTrDOM);
                    }

                    analysisTableDOM.appendChild(tbodyDOM);

                }
                
                // console.log(dataArray);
    
            }
        });

    }

}
