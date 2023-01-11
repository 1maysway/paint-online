import Tool from "./Tool";
import canvasState from "../store/canvasState";


export default class Line extends Tool {
    constructor(canvas,socket,id) {
        super(canvas,socket,id);
        this.listen()
        this.name = 'Line'
    }

    listen() {
        this.canvas.onmousedown = this.mouseDownHandler.bind(this)
        this.canvas.onmouseup = this.mouseUpHandler.bind(this)
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this)
    }

    mouseDownHandler(e) {
        this.mouseDown = true
        this.currentX = e.pageX-e.target.offsetLeft
        this.currentY = e.pageY-e.target.offsetTop
        this.ctx.beginPath()
        this.ctx.moveTo(this.currentX, this.currentY )
        this.saved = this.canvas.toDataURL()
        canvasState.pushToUndo(this.canvas.toDataURL());
    }

    mouseUpHandler(e) {
        if(this.mouseDown){
            this.mouseDown = false

            this.socket.send(JSON.stringify({
                method: 'draw',
                id: this.id,
                figure: {
                    type: 'line',
                    fromX: this.currentX,
                    fromY: this.currentY,
                    toX:e.pageX-e.target.offsetLeft,
                    toY:e.pageY-e.target.offsetTop,
                    fillColor: this.ctx.fillStyle||'#000000',
                    strokeColor: this.ctx.strokeStyle||'#000000',
                    lineWidth:this.ctx.lineWidth||1
                },
                username:canvasState.username
            }))
        }
    }

    mouseMoveHandler(e) {
        if (this.mouseDown) {
            this.draw(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
        }
    }


    draw(x,y) {
        const img = new Image()
        img.src = this.saved
        img.onload = async function () {
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            this.ctx.beginPath()
            this.ctx.moveTo(this.currentX, this.currentY )
            this.ctx.lineTo(x, y)
            this.ctx.stroke()
        }.bind(this)

    }
    static staticDraw(ctx, fromX,fromY,toX,toY) {
        ctx.beginPath();
        ctx.moveTo(fromX,fromY)
        ctx.lineTo(toX, toY);
        ctx.stroke()
    }
}