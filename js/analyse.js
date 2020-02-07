// Reset the analysis window and hide it and show the analysis selection window
$('#analysis-back-button').on('click', e => {
    // Reset analysis window:
    /*
        Clear #analysis-data-table
        Clear #analyse-summary-table-container
        Hide .analysis-window
        Show .analyse-selection-window
    */

    clearChildren(document.querySelector('#analysis-data-table'));
    clearChildren(document.querySelector('#analyse-summary-table-container'));

    clearChildren(document.querySelector('#analysis-data-table'));
    $('.analysis-window').hide();
    $('.analyse-selection-window').show();

})

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
                    let summaryTableContainerDOM = document.querySelector('#analyse-summary-table-container');

                    dataArray = dataArray.slice(1, dataArray.length - 4);

                    // Calculate average:
                    let totalLatency = 0;
                    let nonZeroCount = 0;
                    let zeroCount = 0;

                    dataArray.forEach(item => {
                        totalLatency += parseInt(item);
                        if(parseInt(item) != 0){
                            nonZeroCount ++;
                        }else{
                            zeroCount ++;
                        }
                    });

                    let zeroAverage = totalLatency / zeroCount;
                    let nonZeroAverage = totalLatency / nonZeroCount;

                    let summaryTableDOM = createTable('Summary');

                    let summaryTbodyDOM = document.createElement('tbody');

                    addTableRow(summaryTbodyDOM, 'Average with Zero', commaFormatNumber(zeroAverage.toFixed(2)));
                    addTableRow(summaryTbodyDOM, 'Average', commaFormatNumber(nonZeroAverage.toFixed(2)));
                    addTableRow(summaryTbodyDOM, 'No. of Zeros', commaFormatNumber(zeroCount.toFixed(2)));
                    addTableRow(summaryTbodyDOM, 'Zero %', commaFormatNumber((( zeroCount / ( nonZeroCount + zeroCount ) ) * 100).toFixed(2)));

                    summaryTableDOM.appendChild(summaryTbodyDOM);

                    summaryTableContainerDOM.appendChild(summaryTableDOM);

                    // <thead class='thead-dark'></thead>
                    let theadDOM = document.createElement('thead');
                    theadDOM.className = 'thead-dark';
                    
                    // <tr></tr>
                    let trDOM = document.createElement('tr');

                    // <th scope='col'>One-Way Latency (us)</th>
                    let latencyThDOM = document.createElement('th');
                    latencyThDOM.scope = 'col';
                    latencyThDOM.textContent = 'One-Way Latency (us)';

                    /*
                        <tr>
                            <th scope='col'>One-Way Latency (us)</th>
                        </tr>
                    */
                    trDOM.appendChild(latencyThDOM);

                    /*
                        <thead class='thead-dark'>
                            <tr>
                                <th scope='col'>One-Way Latency (us)</th>
                            </tr>
                        </thead>
                    */
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

                        totalPacketsTdDOM.textContent = parseInt(totalPacketsArray[i]);
                        packetsPerSecTdDOM.textContent = parseInt(packetsPerSecArray[i]);
                        throughputTdDOM.textContent = parseInt(throughputArray[i]);
                        packetsLostTdDOM.textContent = parseInt(packetsLostArray[i]);

                        dataTrDOM.appendChild(totalPacketsTdDOM);
                        dataTrDOM.appendChild(packetsPerSecTdDOM);
                        dataTrDOM.appendChild(throughputTdDOM);
                        dataTrDOM.appendChild(packetsLostTdDOM);

                        tbodyDOM.appendChild(dataTrDOM);
                    }

                    analysisTableDOM.appendChild(tbodyDOM);

                    // -------------------------------------------------------------------------------------------------

                    let summaryTableContainerDOM = document.querySelector('#analyse-summary-table-container');

                    let throughputSummaryTableDOM = createTable('Throughput Summary');

                    // Calculate throughput average
                    let totalThroughput = 0;
                    throughputArray.forEach(item => {
                        totalThroughput += parseInt(item);
                    });
                    
                    let throughputAverage = parseInt((totalThroughput / throughputArray.length)).toFixed(2);
                    let throughputLowerQuartile = parseInt(throughputArray[ (throughputArray.length / 4) - 1 ]).toFixed(2);
                    let throughputMedian = parseInt(throughputArray[ (throughputArray.length / 2) - 1 ]).toFixed(2);
                    let throughputUpperQuartile = parseInt(throughputArray[ ( 3 * (throughputArray.length) / 4) - 1 ]).toFixed(2);
                    
                    let totalPacketsValue = parseInt(totalPacketsArray[totalPacketsArray.length - 1]);
                    let packetsLostValue = parseInt(packetsLostArray[packetsLostArray.length - 1]);
                    let packetsLostPercentage = (( packetsLostValue / (totalPacketsValue + packetsLostValue) ) * 100).toFixed(2);
                    
                    let generalSummaryTableDOM = createTable('General Summary');
                    let generalTbodyDOM = document.createElement('tbody');
                    addTableRow(generalTbodyDOM, 'No. of packets sent', commaFormatNumber(totalPacketsValue + packetsLostValue));
                    addTableRow(generalTbodyDOM, 'No. of packets received', commaFormatNumber(totalPacketsValue));
                    addTableRow(generalTbodyDOM, 'No. of packets lost', commaFormatNumber(packetsLostValue));
                    addTableRow(generalTbodyDOM, 'Lost %', commaFormatNumber(packetsLostPercentage) + '%');

                    generalSummaryTableDOM.appendChild(generalTbodyDOM);

                    let tBodyDOM = document.createElement('tbody');
                    
                    addTableRow(tBodyDOM, 'Average', throughputAverage);
                    addTableRow(tBodyDOM, 'Lower Quartile', throughputLowerQuartile);
                    addTableRow(tBodyDOM, 'Median', throughputMedian);
                    addTableRow(tBodyDOM, 'Upper Quartile', throughputUpperQuartile);
                    
                    throughputSummaryTableDOM.appendChild(tBodyDOM);

                    summaryTableContainerDOM.appendChild(generalSummaryTableDOM);
                    summaryTableContainerDOM.appendChild(throughputSummaryTableDOM);

                }
                
            }
        });

    }

}

function createTable(headTitle){
    let tableDOM = document.createElement('table');
    tableDOM.className = 'table table-bordered';

    let theadDOM = document.createElement('thead');
    theadDOM.className = 'thead-dark';

    let trDOM = document.createElement('tr');
    let thDOM = document.createElement('th');
    thDOM.colSpan = '4';
    thDOM.textContent = headTitle;

    trDOM.appendChild(thDOM);
    theadDOM.appendChild(trDOM);
    tableDOM.appendChild(theadDOM);

    return tableDOM;
}

function addTableRow(tableBody, title, value){
    let trDOM = document.createElement('tr');
    let titleTd = document.createElement('td');
    let valueTd = document.createElement('td');

    titleTd.textContent = title;
    valueTd.textContent = value;

    trDOM.appendChild(titleTd);
    trDOM.appendChild(valueTd);

    tableBody.appendChild(trDOM);
}

function commaFormatNumber(number){
    return String(number).replace(/(.)(?=(\d{3})+$)/g,'$1,');
}

function clearChildren(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}