var summaryFilePaths = [];

$('#graph-loader').hide();

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
    
    // clearChildren(document.querySelector('#general-graph-container'));
    // clearChildren(document.querySelector('#nonzero-graph-container'));
    // clearChildren(document.querySelector('#cdf-graph-container'));
    // clearChildren(document.querySelector('#throughput-graph-container'));
    // clearChildren(document.querySelector('#packets-per-sec-graph-container'));

    clearChildren(document.querySelector('#analyse-publisher-graphs-container'));
    
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

        item.addEventListener('mouseenter', e => {showFullPath(e, path.join(pathValue, file))});
        item.addEventListener('mouseleave', e => {showFullPath(e, path.join(path.basename(pathValue), file))});

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
        let summaryTableContainerDOM = document.querySelector('#analyse-summary-table-container');

        let data = fs.readFileSync(file, 'utf8');

        let dataArray = data.split('\n');
        
        if( path.basename(file).toLowerCase().includes('pub') ){

        }else if( path.basename(file).toLowerCase().includes('sub') ){

        }else{
            console.log(`%c I can't tell if the file is a pub or sub...`, 'color: blue;');
        }
        
        let csvArray = [];

        dataArray.forEach((row, index) => {
            
            row = row.split(',');
            
            // Remove all empty elements
            row = row.filter(a => {return a != '' && a != ' ';});
            
            if(index == 0){
                
                row.forEach(item => {
                    
                    let array = [];
                    array.push(item);
                    csvArray.push(array);
                    array = [];
                    
                });

            }else{

                for(var i = 0; i < csvArray.length; i++){
                    csvArray[i].push(row[i]);
                }

            }

        });
        
        
        /*
        
            At this point csvArray consists of multiple arrays for each column in the csv file.
            We need to check this data and make sure each row is a number, if it isn't remove it.

        */

        let newCsvArray = [];
        let arrayHeaders = [];

        csvArray.forEach(array => {
            
            let arrayHeader = array[0];
            arrayHeaders.push(arrayHeader);

            array = array.filter(a => {return !( isNaN(a) )});

            array.unshift(arrayHeader);

            newCsvArray.push(array);

        });

        csvArray = newCsvArray;

        // At this point, the arrays are full of numbers :)

        let arrayAvgs = [];
        csvArray.forEach((array, index) => {
            
            avg = calcAverage(array);
            
            let newArr = [];
            newArr.push(array[0]);

            arrayAvgs.push(newArr);


            arrayAvgs[index].push(avg);


        });

        // arrayAvgs has the title followed by the average for the title

        let valueTable = createTable(arrayHeaders);

        let valueBody = document.createElement('tbody');

        for(var i = 1; i < csvArray[0].length; i++){
            
            let tr = document.createElement('tr');

            for(var j = 0; j < csvArray.length; j ++){
                let td = document.createElement('td');
                td.textContent = csvArray[j][i];
                tr.appendChild(td);
            }

            valueBody.appendChild(tr);

        }

        valueTable.appendChild(valueBody);

        analysisTableDOM.appendChild( valueTable );

        let summaryTable = createTable( ['Averages'] );
        let summBody = document.createElement('tbody');

        arrayAvgs.forEach(item => {
            addTableRow(summBody, item[0], formatNumber(item[1]));
        });

        summaryTable.appendChild(summBody);
        summaryTableContainerDOM.appendChild(summaryTable);

        let graphsContainer = document.querySelector('#analyse-publisher-graphs-container');

        $('#graph-loader').show();

        csvArray.forEach(array => {

            let graphTitle = document.createElement('p');
            graphTitle.textContent = array[0];

            graphsContainer.appendChild(graphTitle);

            let graphContainer = document.createElement('div');
            graphContainer.className = 'cdf-graph-container';
            graphContainer.id = removeWhiteSpaces( remSpecials( array[0] ) );
            
            graphsContainer.appendChild(graphContainer);

            let chart = c3.generate({
                bindto: `#${removeWhiteSpaces( remSpecials( array[0] ) )}`,
                data: {
                    columns: [
                        array
                    ]
                }
            });


        });

        $('#graph-loader').hide();
    }

}

function createTable(headTitles){
    let tableDOM = document.createElement('table');
    tableDOM.className = 'table table-bordered';

    let theadDOM = document.createElement('thead');
    theadDOM.className = 'thead-dark';

    let trDOM = document.createElement('tr');
    headTitles.forEach(title => {
        let thDOM = document.createElement('th');
        thDOM.textContent = title;
        trDOM.appendChild(thDOM);
        if(headTitles.length == 1){
            thDOM.colSpan = 10;
        }
    });

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

function showFullPath(event, pathval){
    event.target.textContent = pathval;
}