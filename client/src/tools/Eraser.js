import Tool from "./Tool";
import Brush from "./Brush";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";

export default class Eraser extends Brush{
    constructor(canvas,socket,id) {
        super(canvas,socket,id);
    }

    draw(ctx,x,y){
        ctx.lineTo(x,y);
        ctx.stroke();
    }

    mouseDownHandler(e){
        //canvasState.pushToUndo(canvasState.canvas.toDataURL())

        toolState.setStrokeColor('white');
        this.mouseDown=true;
        this.ctx.beginPath();
        this.ctx.moveTo(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop)
    }
    mouseUpHandler(e){
        if(this.mouseDown){
            toolState.setStrokeColor();
            console.log('UP UP')
            this.mouseDown=false;

            this.socket.send(JSON.stringify({
                method:'draw',
                id:this.id,
                figure:{
                    type:'finish',
                },
                username:canvasState.username
            }))
        }

    }
    mouseMoveHandler(e){
        if(this.mouseDown){
            this.socket.send(JSON.stringify({
                method:'draw',
                id:this.id,
                figure:{
                    type:'eraser',
                    x:e.pageX - e.target.offsetLeft,
                    y:e.pageY - e.target.offsetTop,
                    lineWidth:this.ctx.lineWidth||1
                },
                username:canvasState.username
            }))
        }
    }
}