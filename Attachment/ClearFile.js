let fs = require('fs');
let path = require('path');

let filterFile = ['static','WeixinRun.php','WeixinRun.html','node_modules']
var deleteFolder = function(p) {
    var files = [];
    if( fs.existsSync(p) ) {
        files = fs.readdirSync(p);
        files.forEach(function(file,index){
            var curPath = p + "/" + file;
            let del = true;
            
            for(let item of filterFile){
                if(path.resolve(curPath) === path.resolve(__dirname,"../",item)){
                    del = false;
                }
            }
            
            if(del){
                if(fs.statSync(curPath).isDirectory()) { 
                    // recurse
                    deleteFolder(curPath);
                } else { // delete file
                     fs.unlinkSync(curPath);
                }
            }
            
        });
         if(p!=path.resolve(__dirname,"../")) fs.rmdirSync(p);
    }
};

deleteFolder(path.resolve(__dirname,"../"));
// filterFile = ['src_temp']
// deleteFolder(path.resolve(__dirname,"../"));
// fs.rename(path.resolve(__dirname,'../src_temp'),path.resolve(__dirname,'../src'),function(err){ 
//     if(err){ 
//         console.log(err,"重命名失败！"); 
//     }else{ 
//         console.log("重命名成功！"); 
//     } 
// });
