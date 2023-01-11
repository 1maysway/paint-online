import Tool from "./Tool";
import toolState from "../store/toolState";
import canvasState from "../store/canvasState";

export default class Brush extends Tool {
    constructor(canvas, socket, id) {
        super(canvas, socket, id);
        this.listen()
    }

    listen() {
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
        this.canvas.onmouseup = this.mouseUpHandler.bind(this);
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    }

    mouseUpHandler(e) {
        if (this.mouseDown) {
            console.log('UP UP')
            this.mouseDown = false;

            this.socket.send(JSON.stringify({
                method: 'draw',
                id: this.id,
                figure: {
                    type: 'finish',
                },
                username: canvasState.username
            }))
        }

    }
    mouseDownHandler(e) {
        canvasState.pushToUndo(canvasState.canvas.toDataURL())


        this.mouseDown = true;
        this.ctx.beginPath();
        this.ctx.moveTo(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop)
    }
    mouseMoveHandler(e) {
        //console.log(this.socket)
        if (this.mouseDown) {
            //this.draw(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
            console.log(this.ctx.lineWidth)
            this.socket.send(JSON.stringify({
                method: 'draw',
                id: this.id,
                figure: {
                    type: 'brush',
                    x: e.pageX - e.target.offsetLeft,
                    y: e.pageY - e.target.offsetTop,
                    fillColor: this.ctx.fillStyle || '#000000',
                    strokeColor: this.ctx.strokeStyle || '#000000',
                    lineWidth: this.ctx.lineWidth || 1
                },
                username: canvasState.username
            }))
        }
    }

    static draw(ctx, x, y) {

        //toolState.tool.prevStrokeColor=toolState.tool.strokeColor;
        //toolState.tool.prevFillColor=toolState.tool.fillColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        //ctx.fill();
    }
}