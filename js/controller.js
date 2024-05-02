import { Folder, activeFolder, setActiveFolder } from "./Folder.js";
import { File, setActiveFile } from "./File.js";

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

$('#folder-add').click(function() {
    const folder = activeFolder.appendChildFolder({ name: null });
    setActiveFolder(folder);
    localStorage.setItem('fileTree', JSON.stringify(rootFolder));
});

$('#file-add').click(function() {
    const file = activeFolder.appendChildFile({ name: null });
    setActiveFile(file);
    localStorage.setItem('fileTree', JSON.stringify(rootFolder));
});

function activeFolderChanged(folder, folderOnly){
    console.log('controller: activeFolderChanged: ' + folder.name);
    $('#memo').prop('disabled', folderOnly);
}

function activeFileChanged(file, preFile){
    console.log('controller: activeFileChanged: ' + (file || {}).name + '  preFile: ' + (preFile || {}).name);
    $('#memo').prop('disabled', file == null);

    if(preFile){
        localStorage.setItem(preFile.uniquePath, $('#memo').val());
    }
    $('#memo').val('');
    if(file){
        $('#memo').val(localStorage.getItem(file.uniquePath));
    }
}