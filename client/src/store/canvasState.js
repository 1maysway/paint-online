import {makeAutoObservable} from "mobx";
import axios from "axios";


class CanvasState {
    canvas = null;
    socket = null;
    sessionId = null;
    undoList = [];
    redoList = [];
    username = '';
    drawing=false;

    constructor() {
        makeAutoObservable(this)

    }

    setUsername(username) {
        this.username = username;
    }
    setDrawing(status){
        this.drawing=status;
    }

    setCanvas(canvas) {
        this.canvas = canvas;
    }

    setSocket(socket) {
        this.socket = socket
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }


    pushToUndo(data) {
        console.log('PUSH')
        this.undoList.push(data)
    }

    pushReUndo(data) {
        this.redoList.push(data)
    }

    getCanvasUrl(){
        return this.canvas.toDataURL();
    }


    undo(imageUrl = null) {
        let ctx = this.canvas.getContext('2d')
        console.log(this.undoList)
        //if(this.undoList.length >0){
        let dataUrl = this.undoList.pop();
        if (!dataUrl && !imageUrl)
            return //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.redoList.push(this.canvas.toDataURL());
        let img = new Image();
        img.src = imageUrl?imageUrl:dataUrl;
        img.onload = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
        }

        //}else{
        //  ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        //}
        let imgUpdate = this.canvas.toDataURL();
    }

    redo(imageUrl = null) {
        let ctx = this.canvas.getContext('2d')
        //if(this.redoList.length >0){
        console.log(this.redoList)
        let dataUrl = this.redoList.pop();
        if (!dataUrl && !imageUrl)
            return;


        this.undoList.push(this.canvas.toDataURL());
        let img = new Image();
        img.src = imageUrl?imageUrl:dataUrl;
        img.onload = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
        }
        let imgUpdate = this.canvas.toDataURL();
        //}
    }
}

export default new CanvasState();