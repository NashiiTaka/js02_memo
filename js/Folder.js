import { File, setActiveFile } from "./File.js";
const SKIP_KEYS = ['folders', 'files'];

export let activeFolder = null;

export function setActiveFolder(folder, folderOnly){
    if(activeFolder != folder){
        $('.selected-folder').removeClass('selected-folder');
        if(folder.jqElem){
            folder.jqElem.children('span:first-child').addClass('selected-folder');
        }
        activeFolder = folder;
        if(folder.onActiveFolderChanged){
            folder.onActiveFolderChanged(folder, folderOnly);
        }
        if(folderOnly){
            setActiveFile(null);
        }
    }
}

export class Folder {
    #parentFolder = null;
    #jqElem = null;
    #jqElemChildAppnedTo = null;
    #jqElemTextSpan = null;
    onActiveFolderChanged = null;
    onActiveFileChanged = null;
    name = null;
    folders = [];
    files = [];

    /**
     * コンストラクタ
     * @param {JSON} jsonSource JSONデータ
     * @param {Folder} parentFolder 親フォルダ
     * @param {jq} jqElem 対応エレメント
     * @param {*} onActiveFolderChanged フォルダ変更時のイベント
     * @param {*} onActiveFileChanged フォルダ変更時のイベント
     */
    constructor(jsonSource, parentFolder, jqElemChildAppnedTo, onActiveFolderChanged, onActiveFileChanged) {
        jsonSource ||= { name: 'root' };

        for (const key in jsonSource) {
            if (!SKIP_KEYS.includes(key)) {
                this[key] = jsonSource[key];
            }
        }

        this.#parentFolder = parentFolder;
        // jqElemChildAppnedToが設定されるのはrootフォルダのみ。
        if (jqElemChildAppnedTo == null && this.parentFolder != null && this.parentFolder.jqElemChildAppnedTo != null) {
            const jqElem = $('<li></li>', {
                'class': 'folder'
            }).appendTo(this.parentFolder.jqElemChildAppnedTo);
            this.#jqElem = jqElem;

            let baseName = jsonSource.name ? jsonSource.name : 'New Folder';
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
            jqElemChildAppnedTo = $('<ul></ul>',{
                'class': 'dir'
            }).appendTo(jqElem);
            span.on('click', this.folderClicked(this));
        }
        this.#jqElemChildAppnedTo = jqElemChildAppnedTo;
        this.onActiveFolderChanged = onActiveFolderChanged;
        this.onActiveFileChanged = onActiveFileChanged;

        if (jsonSource.folders != null) {
            jsonSource.folders.forEach((v) => {
                this.appendChildFolder(v);
            });
        }

        if (jsonSource.files) {
            jsonSource.files.forEach((v) => {
                this.appendChildFile(v);
            });
        }
    }

    appendChildFolder(jsonSource){
        const ret = new Folder(
            jsonSource,
            this,
            null,
            this.onActiveFolderChanged,
            this.onActiveFileChanged
        );
        this.folders.push(ret);

        return ret;
    }

    appendChildFile(jsonSource){
        const ret = new File(
            jsonSource,
            this,
            null,
            this.childFileSelectionChanged
        );
        this.files.push(ret);

        return ret;
    }

    /**
     * 親フォルダを取得する
     */
    get parentFolder() {
        return this.#parentFolder;
    }

    /**
     * 親フォルダを取得する
     */
    get jqElem() {
        return this.#jqElem;
    }

    /**
     * 子供の追加エレメントを取得する
     */
    get jqElemChildAppnedTo() {
        return this.#jqElemChildAppnedTo;
    }

    /**
     * ルートフォルダである場合、true
     */
    get isRoot() {
        return this.parentFolder == null;
    }

    folderClicked(me){
        return () => {
            setActiveFolder(me, true);
        }
    }

    childFileSelectionChanged(file, preFile){
        console.log('childFileSelectionChanged:' + (file || {}).name);
        if(file && file.parentFolder != activeFolder){
            setActiveFolder(file.parentFolder, false);
        }
        if(file && file.parentFolder.onActiveFileChanged || preFile && preFile.parentFolder.onActiveFileChanged){
            (file || preFile).parentFolder.onActiveFileChanged(file, preFile);
        }
    }
}

export default Folder;