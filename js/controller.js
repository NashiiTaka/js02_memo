import { Folder, activeFolder, setActiveFolder } from "./Folder.js";
import { File, setActiveFile, removeFound, activeFile } from "./File.js";

// localStorage.clear();
const explorer = $('#explorer-container');
const rootFolder = new Folder(
    JSON.parse(localStorage.getItem('fileTree')),
    null,
    $('#explorer-container'),
    // onActiveFolderChangedイベントを実装
    activeFolderChanged,
    // onActiveFileChangedイベントを実装
    activeFileChanged
);
setActiveFolder(rootFolder, true);

// const folder1 = rootFolder.appendChildFolder({name: 'testFolder1'});
// const file1 = folder1.appendChildFile({name: 'testFile1'});
// const file2 = folder1.appendChildFile({name: 'testFile2'});

// const folder2 = folder1.appendChildFolder({name: 'testFolder2'});
// const file3 = folder2.appendChildFile({name: 'testFile3'});
// const file4 = folder2.appendChildFile({name: 'testFile4'});
// const file5 = folder2.appendChildFile({name: 'testFile5'});

// const folder3 = folder2.appendChildFolder({name: 'testFolder3'});
// const file6 = folder3.appendChildFile({name: 'testFile6'});

// 初期化処理
$(() => {

});

$('#folder-add').on('click', () => {
    const folder = activeFolder.appendChildFolder({ name: null });
    setActiveFolder(folder);
    localStorage.setItem('fileTree', JSON.stringify(rootFolder));
});

$('#file-add').on('click', () => {
    const file = activeFolder.appendChildFile({ name: null });
    setActiveFile(file);
    localStorage.setItem('fileTree', JSON.stringify(rootFolder));
});

let preSeachWord = null;
$('.find').on('keyup', execFind);
$('.find').on('keydown', execFind);
$('.find').on('keychange', execFind);

function execFind(){
    let v = $('.find').val();
    if(!v){
        removeFound();
        return;
    }

    if(preSeachWord != v){
        removeFound();
        findRecursive(rootFolder, v);
        preSeachWord = v;
    }
}

let preMemo = null;
let preSavedTime = null;
let timerID = null;
$('#memo').on('keyup', autoSave);
$('#memo').on('keydown', autoSave);
$('#memo').on('change', autoSave);
function autoSave(){
    let v = $('#memo').val();

    if(v == preMemo){ return; }
    if(timerID){
        clearTimeout(timerID);
    }
    let currentFile = activeFile;
    timerID = setTimeout(() => {
        localStorage.setItem(currentFile.uniquePath, v);
        $('#lastsaved').html('saved: ' + new Date().toLocaleString());
        $('#lastsaved').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300);
        preMemo = v;
    }, 1000);
}

function findRecursive(folder, word){
    for(const file of folder.files){
        const v = localStorage.getItem(file.uniquePath) || '';
        if(v.indexOf(word) >= 0){
            // console.log(`found: [${word}] search[${v}]`);
            file.markFound();
        }else{
            // console.log(`not found: [${word}] search[${v}]`);
        }
    }
    for(const subFolder of folder.folders){
        findRecursive(subFolder, word);
    }
}

function activeFolderChanged(folder, folderOnly){
    console.log('controller: activeFolderChanged: ' + folder.name);
    $('#memo').prop('disabled', folderOnly);
}

function activeFileChanged(file, preFile){
    console.log('controller: activeFileChanged: ' + (file || {}).name + '  preFile: ' + (preFile || {}).name);
    $('#memo').prop('disabled', file == null);

    if(preFile){
        if(timerID){
            clearTimeout(timerID);
        }
        localStorage.setItem(preFile.uniquePath, $('#memo').val());
    }
    $('#memo').val('');
    $('#lastsaved').html('');
    if(file){
        $('#memo').val(localStorage.getItem(file.uniquePath));
    }
}