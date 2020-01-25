$('#defPerftestLoc').on('change', e => {
    let newPath = e.target.files[0].path;
    let oldData = readData(path.join(__dirname, '../data/GeneralSettings.json'));

    oldData.defPerftestLoc = newPath;

    fs.writeFile(path.join(__dirname, '../data/GeneralSettings.json'), JSON.stringify(oldData), err => {
        if(err){
            console.log(err);
        }else{
            console.log('Written to file!');
        }
    });
})
