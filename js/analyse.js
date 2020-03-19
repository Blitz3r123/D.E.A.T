// Delete these after development of this component
// $('.analyse-selection-window').hide();
// $('.analyse-summary-window').show();
// $('.analyse-summary-publisher-content').hide();
// $('.analyse-summary-subscriber-content').hide();
// document.getElementById('analyse-summary-subscriber-tab').className = 'analyse-summary-tab active-tab';
// document.getElementById('analyse-summary-publisher-tab').className = 'analyse-summary-tab';

// var summaryFilePaths = ["/Users/kaleem/Documents/performance-testing/Tests/Set 14 [Set 13 Best Effort Rerun]/Best Effort Multicast/10 Subscribers/Run 1/sub1.csv", "/Users/kaleem/Documents/performance-testing/Tests/Set 14 [Set 13 Best Effort Rerun]/Best Effort Multicast/10 Subscribers/Run 2/sub1.csv", "/Users/kaleem/Documents/performance-testing/Tests/Set 14 [Set 13 Best Effort Rerun]/Best Effort Multicast/10 Subscribers/Run 3/sub1.csv"];
var summaryFilePaths = [];

// Hide analysis summary window on start
$('.analyse-summary-window').hide();

// Hide summary tabs on start
$('#analyse-current-tab').hide();

// Hide graphs titles on start
$('#general-graph-title').hide();
$('#non-zero-graph-title').hide();
$('#cdf-graph-title').hide();
$('#throughput-graph-title').hide();
$('#packets-per-sec-graph-title').hide();

$('#summary-back-button').on('click', e => {
    // Reset summary window
    /*
        Clear all pub graph containers
        Clear all pub tables
        Clear all sub graphs container
        Clear all sub tables
    */

    // Clear all pub graph containers
    clearChildren(document.querySelector('#latency-graph-container'));
    clearChildren(document.querySelector('#non-zero-graph-container'));
    clearChildren(document.querySelector('#cdf-graph-container'));
    
    // Clear all pub tables
    clearChildren(document.querySelector('#publisher-summary-table thead tr'));
    clearChildren(document.querySelector('#publisher-summary-table tbody tr'));

    // Clear all sub graph containers
    clearChildren(document.querySelector('#throughput-graph-container'));
    clearChildren(document.querySelector('#packets-per-sec-graph-container'));

    // Clear all sub tables
    clearChildren(document.querySelector('#subscriber-summary-table thead tr'));
    document.querySelector('#subscriber-summary-table thead tr').appendChild(document.createElement('th'));
    
    clearChildren(document.querySelector('#subscriber-summary-table #total-packets-row'));
    let totalPacketsRowdom = document.createElement('td');
    totalPacketsRowdom.textContent = 'Total Packets';
    document.querySelector('#subscriber-summary-table #total-packets-row').appendChild(totalPacketsRowdom);

    clearChildren(document.querySelector('#subscriber-summary-table #percent-lost-row'));
    let percentLostRowDom = document.createElement('td');
    percentLostRowDom.textContent = '% Lost';
    document.querySelector('#subscriber-summary-table #percent-lost-row').appendChild(percentLostRowDom);

    clearChildren(document.querySelector('#subscriber-summary-table #throughput-row'));
    let throughputRowDom = document.createElement('td');
    throughputRowDom.textContent = 'Throughput';
    document.querySelector('#subscriber-summary-table #throughput-row').appendChild(throughputRowDom);

    clearChildren(document.querySelector('#subscriber-summary-table #packets-per-sec-row'));
    let packetsPerSecRowDom = document.createElement('td');
    packetsPerSecRowDom.textContent = 'Packets/s';
    document.querySelector('#subscriber-summary-table #packets-per-sec-row').appendChild(packetsPerSecRowDom);

    $('.analyse-summary-window').hide();
    $('.analyse-selection-window').show();
});

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

// Create summary
$('#summarise-button').on('click', e => {
    if(summaryFilePaths.length == 0){
        showPopup("At least one file has to be added.");
    }else{
        $('.analyse-selection-window').hide();
        $('.analyse-summary-window').show();
        $('#folder-selection-input').hide();
        // console.log(summaryFilePaths);
        displayPubTable();
        displayPubGraphs();
        displaySubTable();
        displaySubGraphs();
    }
});

// Add files in folder to summariser array
$('#summary-folder-selection-input').on('change', e => {
    let summaryListDOM = document.querySelector('#summary-file-list');
    let folderPath = e.target.files[0].path;

    let folderFiles = readFolder(folderPath);
    let folderFilePaths = [];

    for(var i = 0; i < folderFiles.length; i ++){
        folderFilePaths[i] = path.join( folderPath, folderFiles[i] );
    }

    folderFilePaths.forEach(file => {
        let filePath = file;
        let fileName = path.basename(filePath);
        let folderName = path.basename(path.dirname(filePath));
    
        if(!fileExists(filePath) && isCsv(filePath)){
            let pdom = document.createElement('p');
            pdom.title = 'Click to Remove \n' + filePath;
            pdom.id = stringate(filePath);
            pdom.textContent = path.join(folderName, fileName);
            pdom.name = filePath;
    
            pdom.addEventListener('click', e => {
                removeFile(e.target);
            });
    
            summaryFilePaths.push(file);
            summaryListDOM.appendChild(pdom);
        }
    });
    

});

// Add files to summariser array
$('#summary-file-selection-input').on('change', e => {
    let summaryListDOM = document.querySelector('#summary-file-list');
    
    let filePath = e.target.files[0].path;
    let fileName = path.basename(filePath);
    let folderName = path.basename(path.dirname(filePath));
    
    if(!fileExists(filePath) && isCsv(filePath)){
        summaryFilePaths.push(e.target.files[0].path);
        let pdom = document.createElement('p');
        pdom.title = 'Click to Remove \n' + filePath;
        pdom.id = stringate(filePath);
        pdom.textContent = path.join(folderName, fileName);
        pdom.name = filePath;
    
        pdom.addEventListener('click', e => {
            removeFile(e.target);
        });
    
        summaryListDOM.appendChild(pdom);
    }else{
        showPopup("That file has already been added.");
    }


});

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
        item.title = pathValue;

        if(file.toLowerCase().includes('pub') && isCsv(file)){
            $('#publisher-empty-message').hide();
            analysePublisherListDOM.appendChild(item);
        }else if(file.toLowerCase().includes('sub') && isCsv(file)){
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

        let data = fs.readFileSync(file, 'utf8');

        let dataArray = data.split('\n');
                
        if(file.toLowerCase().includes('pub')){
            let summaryTableContainerDOM = document.querySelector('#analyse-summary-table-container');
            
            let latencyArray = [];

            // console.log(dataArray);`

            let latencyIndex;

            // Check if array has multiple values per row
            if(dataArray[1].includes(',')){
                dataArray[0].split(',').forEach((item, index) => {
                
                    if(item.toLowerCase().includes('latency')){
                        latencyIndex = index;
                    }

                });

                for(i = 1; i < dataArray.length; i++){
                    latencyArray.push( parseInt(dataArray[i].split(',')[latencyIndex]) );
                }

            }else{
                latencyArray = dataArray;
                
                latencyArray.forEach(item => {
                    item = parseInt(item);
                });

                latencyArray = latencyArray.slice(1, latencyArray.length - 4);
            }

            // Calculate average:
            let totalLatency = 0;
            let nonZeroCount = 0;
            let zeroCount = 0;

            latencyArray.forEach(item => {
                if(! (isNaN(parseInt(item))) ){
                    totalLatency += parseInt(item);
                    if(parseInt(item) != 0){
                        nonZeroCount ++;
                    }else{
                        zeroCount ++;
                    }
                    console.log(parseInt(item));
                }else{
                    console.log(`%c ${item} is NaN`, 'color: red;');
                }
            });

            let zeroAverage = totalLatency / (latencyArray.length - zeroCount);
            let nonZeroAverage = totalLatency / latencyArray.length;

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

            latencyArray.forEach(row => {
                let dataTrDOM = document.createElement('tr');
                let latencyTdDOM = document.createElement('td');

                latencyTdDOM.textContent = row;

                dataTrDOM.appendChild(latencyTdDOM);

                tbodyDOM.appendChild(dataTrDOM);
            });

            analysisTableDOM.appendChild(tbodyDOM);

            let nonZeroArray = [];

            latencyArray.forEach(item => {
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

            latencyArray.unshift('Latency');
            var chartTwo = c3.generate({
                bindto: '#general-graph-container',
                data: {
                    columns: [
                    latencyArray
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

        }else if(file.toLowerCase().includes('sub')){
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

        }else{
            console.log(`%c I don't know what kind of file it is....`, 'color: blue;');
        }

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

function removeFile(element){
    element.parentElement.removeChild(element);

    let index = summaryFilePaths.indexOf(element.name);

    if(index > -1){
        summaryFilePaths.splice(index, 1);
    }
}

function fileExists(pathValue){
    return summaryFilePaths.indexOf(pathValue) !== -1;
}

function isCsv(pathValue){
    return path.extname(pathValue) == '.csv';
}

function showSubscriberTab(){
    let pubTab = document.querySelector('#analyse-summary-publisher-tab');

    pubTab.className = 'analyse-summary-tab';

    let subTab = document.querySelector('#analyse-summary-subscriber-tab');

    subTab.className = 'analyse-summary-tab active-tab';

    $('.analyse-summary-publisher-content').hide();
    $('.analyse-summary-subscriber-content').show();

}

function showPublisherTab(){
    let pubTab = document.querySelector('#analyse-summary-publisher-tab');

    pubTab.className = 'analyse-summary-tab active-tab';

    let subTab = document.querySelector('#analyse-summary-subscriber-tab');

    subTab.className = 'analyse-summary-tab';

    $('.analyse-summary-publisher-content').show();
    $('.analyse-summary-subscriber-content').hide();

}

function displayPubTable(){
    summaryFilePaths.forEach(file => {
        
        let fileName = path.basename(file);
        
        if(fileName.toLowerCase().includes('pub')){
            fs.readFile(file, 'utf8', (err, data) => {
                if(err){
                    console.log(err);
                }else{
                    let dataArray = data.split('\n');
                    dataArray = dataArray.slice(1, dataArray.length - 4);
                    let total = 0;

                    dataArray.forEach(item => {
                        total += parseInt(item);
                    });

                    let average = (total / dataArray.length).toFixed(2);
                    
                    let folderName = path.basename(path.dirname(file));

                    let summaryTableTr = document.querySelector('#publisher-summary-table thead tr');
                    
                    let title = path.join(folderName, fileName);

                    let thdom = document.createElement('th');
                    thdom.textContent = title;

                    summaryTableTr.appendChild(thdom);

                    let summaryTableTbodyTr = document.querySelector('#publisher-summary-table tbody tr');
                    let tdDom = document.createElement('td');
                    tdDom.textContent = average;

                    summaryTableTbodyTr.appendChild(tdDom);


                }
            });
        }

    });
}

function displaySubTable(){
    summaryFilePaths.forEach(file => {
        
        let fileName = path.basename(file);
        let folderName = path.basename(path.dirname(file));
        
        if(fileName.toLowerCase().includes('sub')){
            fs.readFile(file, 'utf8', (err, data) => {
                if(err){
                    console.log(err);
                }else{
                    let dataArray = data.split('\n');

                    dataArray.forEach(item => {
                        item = parseInt(item);
                    });

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

                    let totalPackets = parseInt(totalPacketsArray[totalPacketsArray.length - 1]);
                    let packetsLost = parseInt(packetsLostArray[packetsLostArray.length - 1]);
                    let percentLost = ((packetsLost / (totalPackets + packetsLost)) * 100).toFixed(2);

                    let throughputTotal = 0;

                    throughputArray.forEach(item => {
                        throughputTotal += parseInt(item);
                    });

                    let throughputAverage = (throughputTotal / throughputArray.length).toFixed(2);

                    let packetsPerSecTotal = 0;

                    packetsPerSecArray.forEach(item => {
                        packetsPerSecTotal += parseInt(item);
                    });

                    let packetsPerSecAverage = (packetsPerSecTotal / packetsPerSecArray.length).toFixed(0);

                    let summaryTableTr = document.querySelector('#subscriber-summary-table thead tr');
                    
                    let title = path.join(folderName, fileName);

                    let thdom = document.createElement('th');
                    thdom.textContent = title;

                    summaryTableTr.appendChild(thdom); 
                    
                    let totalPacketsRowDom = document.querySelector('#total-packets-row');
                    let totalPacketstdDom = document.createElement('td');
                    totalPacketstdDom.textContent = commaFormatNumber(totalPackets);

                    totalPacketsRowDom.appendChild(totalPacketstdDom);

                    let percentLostRowDom = document.querySelector('#percent-lost-row');
                    let percentLosttdDom = document.createElement('td');
                    percentLosttdDom.textContent = commaFormatNumber(percentLost) + '%';

                    percentLostRowDom.appendChild(percentLosttdDom);

                    let throughputRow = document.querySelector('#throughput-row');
                    let throughputtdDom = document.createElement('td');
                    throughputtdDom.textContent = commaFormatNumber(throughputAverage);

                    throughputRow.appendChild(throughputtdDom);

                    let packetsPerSecRow = document.querySelector('#packets-per-sec-row');
                    let packetsPerRowtdDom = document.createElement('td');
                    packetsPerRowtdDom.textContent = commaFormatNumber(packetsPerSecAverage);

                    packetsPerSecRow.appendChild(packetsPerRowtdDom);

                }
            });
        }

    });
}

function displayPubGraphs(){
    summaryFilePaths.forEach(file => {
        
        let fileName = path.basename(file);
        
        if(fileName.toLowerCase().includes('pub')){
            fs.readFile(file, 'utf8', (err, data) => {
                if(err){
                    console.log(err);
                }else{
                    let dataArray = data.split('\n');
                    dataArray = dataArray.slice(1, dataArray.length - 4);
                    let total = 0;
                    
                    let folderName = path.basename(path.dirname(file));
                    
                    let title = path.join(folderName, fileName);

                    let nonZeroArray = [];

                    dataArray.forEach(item => {
                        if(parseInt(item) != 0){
                            nonZeroArray.push(parseInt(item));
                        }
                    });

                    let cdfArray = [];
                    let cdfXValues = [];
                    let cdfYValues = [];

                    let newnonZeroArray = nonZeroArray.slice(1, nonZeroArray.length - 1 );

                    cdfArray = newnonZeroArray.sort((a, b) => parseInt(a) - parseInt(b));

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

                    let tickArray = [];

                    for(var k = 0; k < cdfXValues.length; k ++){
                        tickArray[k] = (cdfXValues[length] / k);
                    }

                    cdfXValues.unshift('x');
                    cdfYValues.unshift('CDF');

                    let latencyGraphContainerDom = document.querySelector('.analyse-summary-publisher-content #latency-graph-container');
                    let nonZeroLatencyGraphContainerDom = document.querySelector('.analyse-summary-publisher-content #non-zero-graph-container');
                    let cdfGraphContainerDom = document.querySelector('.analyse-summary-publisher-content #cdf-graph-container');
                    
                    let newLatencyGraphDiv = document.createElement('div');
                    newLatencyGraphDiv.className = 'graph';
                    newLatencyGraphDiv.id = 'latency' + stringate(title);

                    let newNonZeroGraphDiv = document.createElement('div');
                    newNonZeroGraphDiv.className = 'graph';
                    newNonZeroGraphDiv.id = 'nonzero' + stringate(title);

                    let newCdfGraphDiv = document.createElement('div');
                    newCdfGraphDiv.className = 'graph';
                    newCdfGraphDiv.id = 'cdf' + stringate(title);

                    nonZeroArray.unshift(title);
                    dataArray.unshift(title);
                    cdfYValues.unshift(title);

                    latencyGraphContainerDom.appendChild(newLatencyGraphDiv);
                    nonZeroLatencyGraphContainerDom.appendChild(newNonZeroGraphDiv);
                    cdfGraphContainerDom.appendChild(newCdfGraphDiv);

                    let latencyChart = c3.generate({
                        bindto: '#latency' + stringate(title),
                        data: {
                          columns: [
                            dataArray
                          ]
                        }
                    });

                    let nonZeroChart = c3.generate({
                        bindto: '#nonzero' + stringate(title),
                        data: {
                          columns: [
                            nonZeroArray
                          ]
                        }
                    });

                    var cdfChart = c3.generate({
                        bindto: '#cdf' + stringate(title),
                        data: {
                            x: 'x',
                            y: title,
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

                }
            });
        }

    });
}

function displaySubGraphs(){
    summaryFilePaths.forEach(file => {
        
        let fileName = path.basename(file);
        let folderName = path.basename(path.dirname(file));

        if(fileName.toLowerCase().includes('sub')){
            fs.readFile(file, 'utf8', (err, data) => {
                if(err){
                    console.log(err);
                }else{
                    let totalPacketsArray = [];
                    let packetsPerSecArray = [];
                    let throughputArray = [];
                    let packetsLostArray = [];

                    let dataArray = data.split('\n');

                    let title = path.join(folderName, fileName);

                    dataArray.forEach(item => {
                        item = parseInt(item);
                    });

                    dataArray = dataArray.slice(1, dataArray.length - 2);  

                    dataArray.forEach(row => {
                        let rowData = row.split(',');

                        totalPacketsArray.push(rowData[1]);
                        packetsPerSecArray.push(rowData[2]);
                        throughputArray.push(rowData[3]);
                        packetsLostArray.push(rowData[4]);
                    });

                    let throughputGraphContainerDom = document.querySelector('.analyse-summary-subscriber-content #throughput-graph-container');
                    let packetsPerSecGraphContainerDom = document.querySelector('.analyse-summary-subscriber-content #packets-per-sec-graph-container');
                    
                    let newThroughputGraphDiv = document.createElement('div');
                    newThroughputGraphDiv.className = 'graph';
                    newThroughputGraphDiv.id = 'throughput' + stringate(title);

                    let newPacketsPerSecGraphDiv = document.createElement('div');
                    newPacketsPerSecGraphDiv.className = 'graph';
                    newPacketsPerSecGraphDiv.id = 'packetspersec' + stringate(title);

                    throughputArray.unshift(title);
                    packetsPerSecArray.unshift(title);

                    throughputGraphContainerDom.appendChild(newThroughputGraphDiv);
                    packetsPerSecGraphContainerDom.appendChild(newPacketsPerSecGraphDiv);

                    let throughputChart = c3.generate({
                        bindto: '#throughput' + stringate(title),
                        data: {
                          columns: [
                            throughputArray
                          ]
                        }
                    });

                    let packetsPerSecChart = c3.generate({
                        bindto: '#packetspersec' + stringate(title),
                        data: {
                          columns: [
                            packetsPerSecArray
                          ]
                        }
                    });

                }
            });
        }

    });
}