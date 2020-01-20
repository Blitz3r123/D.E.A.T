let bestEffort = document.querySelector('#quick-create-setting-best-effort');

let path = "./../data/DefaultTestValues.json";

path = __dirname + path; 

fs.readFile(path, (err, data) => {
    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
});