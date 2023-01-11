import React, {useState} from 'react';
import '../styles/toolbar.css'
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import Rect from "../tools/Rect";
import Circle from "../tools/Circle";
import Line from "../tools/Line";
import Eraser from "../tools/Eraser";
import {useParams} from "react-router-dom";
import axios from "axios";

const Toolbar = () => {
    const params = useParams()
    const [toolType,setToolType]=useState('brush')
    const changeColor = e => {
        toolState.setFillColor(e.target.value)
    }
    const download = () => {
        const dataUrl = canvasState.canvas.toDataURL();
        console.log(dataUrl)
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = canvasState.sessionId + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a)
    }

    const undo = () => {
        let undoLength = canvasState.undoList.length;
        //canvasState.undo()
        //setTimeout(()=>{
        if (undoLength > 0) {
            canvasState.socket.send(JSON.stringify({
                id: params.id,
                method: "undo",
                image: canvasState.undoList[canvasState.undoList.length-1], //canvasState.canvas.toDataURL(),
                username: canvasState.username
            }));

            axios.post(`http://localhost:5000/image?id=${params.id}`, {img: canvasState.undoList[canvasState.undoList.length-1]})
                .then(response => console.log(response.data))
        }
        //},1000)
    }
    const redo = () => {
        let redoLength = canvasState.redoList.length;
        //canvasState.redo()
        //setTimeout(()=>{
        if (redoLength > 0) {
            canvasState.socket.send(JSON.stringify({
                id: params.id,
                method: "redo",
                image: canvasState.redoList[canvasState.redoList.length-1], //canvasState.canvas.toDataURL(),
                username: canvasState.username
            }));

            axios.post(`http://localhost:5000/image?id=${params.id}`, {img: canvasState.redoList[canvasState.redoList.length-1]})
                .then(response => console.log(response.data))
        }
        //},1000)
    }

    const onToolClickHandler=(e)=>{
        console.log(e.target.value)
        switch (e.target.value){
            case 'brush':
                toolState.setTool((new Brush(canvasState.canvas, canvasState.socket, canvasState.sessionId)))
                break;
            case 'rect':
                toolState.setTool((new Rect(canvasState.canvas, canvasState.socket, canvasState.sessionId)))
                break;
            case 'circle':
                toolState.setTool((new Circle(canvasState.canvas, canvasState.socket, canvasState.sessionId)))
                break;
            case 'eraser':
                toolState.setTool((new Eraser(canvasState.canvas, canvasState.socket, canvasState.sessionId)))
                break;
            case 'line':
                toolState.setTool((new Line(canvasState.canvas, canvasState.socket, canvasState.sessionId)))
                break;
        }
        if(toolType!==e.target.value)
            setToolType(e.target.value)
    }

    return (
        <div className='toolbar'>
            <button className={`toolbar__btn brush ${toolType==='brush'?'active':''}`} value={'brush'}
                    onClick={onToolClickHandler}></button>
            <button className={`toolbar__btn rect ${toolType==='rect'?'active':''}`} value={'rect'}
                    onClick={onToolClickHandler}></button>
            <button className={`toolbar__btn circle ${toolType==='circle'?'active':''}`} value={'circle'}
                    onClick={onToolClickHandler}></button>
            <button className={`toolbar__btn eraser ${toolType==='eraser'?'active':''}`} value={'eraser'}
                    onClick={onToolClickHandler}></button>
            <button className={`toolbar__btn line ${toolType==='line'?'active':''}`} value={'line'}
                    onClick={onToolClickHandler}></button>
            <input onChange={e => changeColor(e)} type="color" style={{marginLeft: 10}}/>
            <button className='toolbar__btn undo' onClick={() => undo()}></button>
            <button className='toolbar__btn redo' onClick={() => redo()}></button>
            <button className='toolbar__btn save' onClick={() => download()}></button>
        </div>
    );
};

export default Toolbar;