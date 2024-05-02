import Folder from "./Folder.js";
const SKIP_KEYS = ['parentFolder'];

export let activeFile = null;

export function setActiveFile(file) {
    if(activeFile != file){
        $('.selected-file').removeClass('selected-file');
        if(file != null){
            file.jqElem.children('span:first-child').addClass('selected-file');
        }
        const preFile = activeFile;
        activeFile = file;
        if (file && file.onActiveFileChanged || preFile && preFile.onActiveFileChanged) {
            if(file && file.onActiveFileChanged){
                file.onActiveFileChanged(file, preFile);
            }else{
                preFile.onActiveFileChanged(file, preFile);
            }
        }
    }
}

export function removeFound(){
    $('.found-file').removeClass('found-file');
}

export class File {
    #parentFolder = null;
    #jqElem = null;
    onActiveFileChanged = null;
    name = null;

    /**
     * コンストラクタ
     * @param {json} jsonSource JSONデータ 
     * @param {Folder} parentFolder 親フォルダ
     * @param {jq} jqElem 対応エレメント
     * @param {*} onActiveFileChanged ファイル変更時のイベント
     */
    constructor(jsonSource, parentFolder, jqElem, onActiveFileChanged) {
        for (const key in jsonSource) {
            if (!SKIP_KEYS.includes(key)) {
                this[key] = jsonSource[key];
            }
        }

        this.#parentFolder = parentFolder;
        this.onActiveFileChanged = onActiveFileChanged;

        if (jqElem == null && this.parentFolder != null) {
            const jqElem = $('<li></li>', {
                'class': 'file'
            }).appendTo(this.parentFolder.jqElemChildAppnedTo);
            this.#jqElem = jqElem;

            let baseName = jsonSource.name ? jsonSource.name : 'New File';
            const siblings = [];
            let parentFolder = this.parentFolder || {};
            for(const folder of parentFolder.folders){
                siblings.push(folder.name);
            }
            for(const file of parentFolder.files){
                siblings.push(file.name);
            }
            let i = 1;
            let newName = baseName;
            while(siblings.includes(newName)){
                newName = `${baseName} ${++i}`;
            }
            this.name = newName;

            const span = $('<span></span>', {
                contenteditable: 'true',
                html: newName
            }).appendTo(jqElem);
            span.on('click', this.fileClicked(this));
            
        }
    }

    /**
     * 親フォルダを取得する
     */
    get parentFolder() {
        return this.#parentFolder;
    }

    /**
     * 対応するエレメントを取得する
     */
    get jqElem() {
        return this.#jqElem;
    }

    /**
     * ユニークなパスを返却する
     */
    get uniquePath(){
        let folder = this.parentFolder;
        let ret = this.name;
        while(folder != null){
            ret = folder.name + '/' + ret;
            folder = folder.parentFolder;
        }

        return ret;
    }

    fileClicked(me) {
        return (e) => {
            setActiveFile(me);
        }
    }

    markFound(){
        this.jqElem.children('span:first-child').addClass('found-file');
    }
}
