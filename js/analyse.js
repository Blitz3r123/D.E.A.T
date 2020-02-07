// cdf function code: https://stackoverflow.com/questions/5259421/cumulative-distribution-function-in-javascript

// Hide graphs titles on start
$('#general-graph-title').hide();
$('#non-zero-graph-title').hide();
$('#cdf-graph-title').hide();
$('#throughput-graph-title').hide();
$('#packets-per-sec-graph-title').hide();

// Reset the analysis window and hide it and show the analysis selection window
$('#analysis-back-button').on('click', e => {
    // Reset analysis window:
    /*
        Clear #analysis-data-table
        Clear #analyse-summary-table-container
        Hide .analysis-window
        Show .analyse-selection-window
        Empty graph containers
        Hide graph titles
    */

    clearChildren(document.querySelector('#analysis-data-table'));
    clearChildren(document.querySelector('#analyse-summary-table-container'));

    clearChildren(document.querySelector('#analysis-data-table'));
    
    clearChildren(document.querySelector('#general-graph-container'));
    clearChildren(document.querySelector('#nonzero-graph-container'));
    clearChildren(document.querySelector('#cdf-graph-container'));
    clearChildren(document.querySelector('#throughput-graph-container'));
    clearChildren(document.querySelector('#packets-per-sec-graph-container'));
    
    $('#general-graph-title').hide();
    $('#non-zero-graph-title').hide();
    $('#cdf-graph-title').hide();
    $('#throughput-graph-title').hide();
    $('#packets-per-sec-graph-title').hide();
    
    $('#general-graph-container').hide();
    $('#non-zero-graph-container').hide();
    $('#cdf-graph-container').hide();
    $('#throughput-graph-container').hide();
    $('#packets-per-sec-graph-container').hide();
    
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

        // console.log(path.join(path.basename(pathValue), file));

        item.addEventListener('click', e => {
            analyseFile(path.join(pathValue, file));
        });

        item.textContent = path.join(path.basename(pathValue), file);

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
                dataArray.forEach(item => {
                    item = parseInt(item);
                });
    
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

                    let tbodyDOM = document.createElement('tbody');

                    dataArray.forEach(row => {
                        let dataTrDOM = document.createElement('tr');
                        let latencyTdDOM = document.createElement('td');

                        latencyTdDOM.textContent = row;

                        dataTrDOM.appendChild(latencyTdDOM);

                        tbodyDOM.appendChild(dataTrDOM);
                    });

                    analysisTableDOM.appendChild(tbodyDOM);

                    let nonZeroArray = [];

                    dataArray.forEach(item => {
                        if(parseInt(item) != 0){
                            nonZeroArray.push(parseInt(item));
                        }
                    });

                    nonZeroArray.unshift('Latency');

                    // Create graph:
                    var chart = c3.generate({
                        bindto: '#nonzero-graph-container',
                        data: {
                          columns: [
                            nonZeroArray
                          ]
                        }
                    });
                    
                    /*
                        CDF ALGORITHM:
                        1. Sort array from smallest to largest
                        2. Count how many times each item appears
                        3. Set count as fraction (count / length)
                        4. Plot count / length on y axis
                        5. Plot each unique value on x axis
                    */
                    
                    let cdfArray = [];
                    let cdfXValues = [];
                    let cdfYValues = [];

                    nonZeroArray = nonZeroArray.slice(1, nonZeroArray.length - 1 );

                    cdfArray = nonZeroArray.sort((a, b) => parseInt(a) - parseInt(b));

                    cdfArray.forEach((item, index) => {
                        if(item !== cdfArray[index - 1]){
                            cdfXValues.push(item);
                            cdfYValues.push(1);
                        }else{
                            cdfYValues[cdfYValues.length-1]++;
                        }
                    });

                    for(var i = 0; i < cdfYValues.length; i++){
                        cdfYValues[i] = parseInt(cdfYValues[i]) / parseInt(cdfYValues.length);
                    }

                    for(var j = 1; j < cdfYValues.length; j++){
                        cdfYValues[j] += cdfYValues[j - 1];
                    }

                    dataArray.unshift('Latency');
                    var chartTwo = c3.generate({
                        bindto: '#general-graph-container',
                        data: {
                          columns: [
                            dataArray
                          ]
                        }
                    });

                    let tickArray = [];

                    for(var k = 0; k < cdfXValues.length; k ++){
                        tickArray[k] = (cdfXValues[length] / k);
                    }

                    cdfXValues.unshift('x');
                    cdfYValues.unshift('CDF');

                    var chartTwo = c3.generate({
                        bindto: '#cdf-graph-container',
                        data: {
                            x: 'x',
                            y: 'CDF',
                            columns: [
                                cdfXValues,
                                cdfYValues
                            ]
                        },
                        axis: {
                            x: {
                                type: 'category',
                                tick: {
                                    count: 1
                                }
                            }
                        }
                    });

                    $('#general-graph-title').show();
                    $('#non-zero-graph-title').show();
                    $('#cdf-graph-title').show();

                    $('#general-graph-container').show();
                    $('#nonzero-graph-container').show();
                    $('#cdf-graph-container').show();

                    $('#throughput-graph-container').hide();
                    $('#throughput-graph-title').hide();

                    $('#packets-per-sec-graph-container').hide();
                    $('#packets-per-sec-graph-title').hide();

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

                    throughputArray.unshift('Throughput');
                    var chart = c3.generate({
                        bindto: '#throughput-graph-container',
                        data: {
                            columns: [
                                throughputArray
                            ]
                        }
                    });

                    packetsPerSecArray.unshift('Packets/s');
                    var chart = c3.generate({
                        bindto: '#packets-per-sec-graph-container',
                        data: {
                            columns: [
                                packetsPerSecArray
                            ]
                        }
                    });

                    $('#throughput-graph-title').show();
                    $('#throughput-graph-container').show();
                    $('#packets-per-sec-graph-title').show();
                    $('#packets-per-sec-graph-container').show();

                    $('#general-graph-title').hide();
                    $('#non-zero-graph-title').hide();
                    $('#cdf-graph-title').hide();

                    $('#general-graph-container').hide();
                    $('#nonzero-graph-container').hide();
                    $('#cdf-graph-container').hide();

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