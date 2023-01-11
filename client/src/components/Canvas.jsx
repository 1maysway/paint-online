import React, {useEffect, useRef, useState} from 'react';
import "../styles/canvas.css"
import {observer} from "mobx-react-lite";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import {Modal, Button} from "react-bootstrap";
import {useParams} from "react-router-dom"
import Rect from "../tools/Rect";
import axios from 'axios'
import Circle from "../tools/Circle";
import Eraser from "../tools/Eraser";
import Line from "../tools/Line";

const Canvas = observer(() => {
    const canvasRef = useRef()
    const usernameRef = useRef()
    const [modal, setModal] = useState(true)
    const params = useParams()

    useEffect(() => {
        //if(params.id){
        canvasState.setCanvas(canvasRef.current)
        let ctx = canvasRef.current.getContext('2d')
        const img = new Image()

        try {
            axios.get(`http://localhost:5000/image?id=${params.id}`)
                .then(response => {

                    img.src = response.data
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
                    }
                })
        } catch (e) {
            console.log(e)
        }

        if(!img.src){

        }
        //}

    }, [])

    useEffect(() => {

        if (canvasState.username !== '') {
            console.log('USERNAME CHANGED', canvasState.username)
            const socket = new WebSocket(`ws://localhost:5000/`);
            canvasState.setSocket(socket)
            canvasState.setSessionId(params.id)
            toolState.setTool(new Brush(canvasRef.current, socket, params.id))
            socket.onopen = () => {
                console.log('Подключение установлено')
                socket.send(JSON.stringify({
                    id: params.id,
                    username: canvasState.username,
                    method: "connection"
                }))
            }
            socket.onmessage = (event) => {
                let msg = JSON.parse(event.data)
                switch (msg.method) {
                    case "connection":
                        console.log(`пользователь ${msg.username} присоединился`)
                        break
                    case "draw":
                        canvasState.redoList=[];
                        drawHandler(msg)
                        break
                    case 'undo':
                        console.log('undo')
                        console.log(msg.username !== canvasState.username)
                        //if (msg.username !== canvasState.username) {
                        canvasState.undo(msg.image)
                        //}
                        break;
                    case 'redo':
                        console.log(msg.username !== canvasState.username)
                        //if (msg.username !== canvasState.username) {
                        canvasState.redo(msg.image)
                        //}
                        break;
                }
            }
        } else {
            usernameRef.current.value = makeid(10);
            connectHandler();
        }
    }, [canvasState.username])

    const drawHandler = (msg) => {
        const figure = msg.figure
        const ctx = canvasRef.current.getContext('2d')
        switch (figure.type) {
            case "brush":

                if (!canvasState.drawing && canvasState.username!==msg.username) {
                    console.log('not drawing')
                    canvasState.setDrawing(true)
                    canvasState.pushToUndo(canvasRef.current.toDataURL());
                    toolState.setStrokeColor(figure.strokeColor)
                    toolState.setFillColor(figure.fillColor)
                    toolState.setLineWidth(figure.lineWidth)
                }

                console.log(figure.lineWidth, ' <- figure line width')

                Brush.draw(ctx, figure.x, figure.y)
                break
            case "eraser":

                if (!canvasState.drawing && canvasState.username!==msg.username) {
                    canvasState.setDrawing(true)
                    canvasState.pushToUndo(canvasRef.current.toDataURL());
                    toolState.setStrokeColor('white')
                    toolState.setFillColor('white')
                    toolState.setLineWidth(figure.lineWidth)
                }

                Eraser.draw(ctx, figure.x, figure.y)
                break
            case "rect":

                if (canvasState.username !== msg.username)
                    canvasState.pushToUndo(canvasRef.current.toDataURL());

                toolState.setStrokeColor(figure.strokeColor)
                toolState.setFillColor(figure.fillColor)
                toolState.setLineWidth(figure.lineWidth)

                console.log('colors -> '+figure.strokeColor,figure.fillColor)
                console.log('prev colors -> ' + toolState.prevStrokeColor, toolState.prevFillColor)

                Rect.staticDraw(ctx, figure.x, figure.y, figure.width, figure.height, figure.color)

                toolState.setStrokeColor(toolState.prevStrokeColor);
                toolState.setFillColor(toolState.prevFillColor);
                toolState.setLineWidth(toolState.prevLineWidth);
                ctx.beginPath()
                break
            case "circle":

                if (canvasState.username !== msg.username)
                    canvasState.pushToUndo(canvasRef.current.toDataURL());

                toolState.setStrokeColor(figure.strokeColor)
                toolState.setFillColor(figure.fillColor)
                toolState.setLineWidth(figure.lineWidth)

                console.log('prev colors -> ' + toolState.prevStrokeColor, toolState.prevFillColor)

                Circle.staticDraw(ctx, figure.x, figure.y, figure.radius)

                toolState.setStrokeColor(toolState.prevStrokeColor);
                toolState.setFillColor(toolState.prevFillColor);
                toolState.setLineWidth(toolState.prevLineWidth);
                ctx.beginPath()
                break
            case "line":

                if (canvasState.username!==msg.username)
                    canvasState.pushToUndo(canvasRef.current.toDataURL());

                toolState.setStrokeColor(figure.strokeColor)
                toolState.setFillColor(figure.fillColor)
                toolState.setLineWidth(figure.lineWidth)

                console.log('prev colors -> ' + toolState.prevStrokeColor, toolState.prevFillColor)

                Line.staticDraw(ctx, figure.fromX, figure.fromY, figure.toX,figure.toY)

                toolState.setStrokeColor(toolState.prevStrokeColor);
                toolState.setFillColor(toolState.prevFillColor);
                toolState.setLineWidth(toolState.prevLineWidth);
                ctx.beginPath()

                break;
            case "finish":
                console.log(toolState.prevLineWidth + ' <- prev line width')
                //if(msg.username!==canvasState.username)
                canvasState.setDrawing(false)
                //canvasState.pushToUndo(canvasRef.current.toDataURL())
                console.log('prev colors -> ' + toolState.prevStrokeColor, toolState.prevFillColor)
                if(canvasState.username!==msg.username){
                    toolState.setStrokeColor(toolState.prevStrokeColor);
                    toolState.setFillColor(toolState.prevFillColor);
                    toolState.setLineWidth(toolState.prevLineWidth);
                }
                ctx.beginPath()

                break
        }
    }


    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const mouseUpHandler = () => {
        console.log('mouse up')

        axios.post(`http://localhost:5000/image?id=${params.id}`, {img: canvasRef.current.toDataURL()})
            .then(response => console.log(response.data))
    }
    const mouseDownHandler = () => {
        console.log('mouse down')
        //canvasState.pushToUndo(canvasRef.current.toDataURL())
    }

    const connectHandler = () => {
        canvasState.setUsername(usernameRef.current.value)
        setModal(false)
    }

    return (
        <div className="canvas">
            <Modal show={modal} onHide={() => {
            }}>
                <Modal.Header>
                    <Modal.Title>Введите ваше имя</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input autoFocus type="text" ref={usernameRef}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => connectHandler()}>
                        Войти
                    </Button>
                </Modal.Footer>
            </Modal>
            <canvas onMouseUp={() => mouseUpHandler()} onMouseDown={() => mouseDownHandler()} ref={canvasRef}
                    width={600} height={400}/>
        </div>
    );
});

export default Canvas;