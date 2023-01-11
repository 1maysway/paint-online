import Tool from "./Tool";
import canvasState from "../store/canvasState";

export default class Circle extends Tool{
    constructor(canvas,socket,id) {
        super(canvas,socket,id);
        this.listen()
    }

    listen(){
        this.canvas.onmousedown=this.mouseDownHandler.bind(this);
        this.canvas.onmouseup=this.mouseUpHandler.bind(this);
        this.canvas.onmousemove=this.mouseMoveHandler.bind(this);
    }

    mouseUpHandler(e){
        if (this.mouseDown) {
            this.mouseDown = false;

            this.socket.send(JSON.stringify({
                method: 'draw',
                id: this.id,
                figure: {
                    type: 'circle',
                    x: this.startX,
                    y: this.startY,
                    radius: this.radius,
                    fillColor: this.ctx.fillStyle||'#000000',
                    strokeColor: this.ctx.strokeStyle||'#000000',
                    lineWidth:this.ctx.lineWidth||1
                },
                username:canvasState.username
            }))
        }
    }
    mouseDownHandler(e){
        this.mouseDown=true;
        this.ctx.beginPath();
        this.startX=e.pageX-e.target.offsetLeft;
        this.startY=e.pageY-e.target.offsetTop;
        this.saved=this.canvas.toDataURL();
        canvasState.pushToUndo(this.canvas.toDataURL());
    }
    mouseMoveHandler(e){
        if(this.mouseDown){
            let currentX=e.pageX-e.target.offsetLeft
            let currentY=e.pageY-e.target.offsetTop;
            //console.log(e.pageX,e.target.offsetLeft)
            let width=currentX-this.startX;
            let height=currentY-this.startY;
            //let radius = Math.sqrt((currentX*currentX) + (currentY*currentY));
            //console.log((currentX),(currentY))
            console.log(((currentX<this.startX ?this.startX-currentX:currentX-this.startX)+(currentY<this.startY?this.startY-currentY:currentY-this.startY))/2)
            this.radius = Math.sqrt(((currentX<this.startX ?this.startX-currentX:currentX-this.startX)*(currentY<this.startY?this.startY-currentY:currentY-this.startY))/2);

            let xLine=Math.abs(this.startX-currentX);
            let Yline=Math.abs(this.startY-currentY);

            //radius=(this.startX+this.startY)-(currentX+currentY)
            //radius=Math.abs(radius)
            console.log(this.startX,this.startY,currentX,currentY)
            //radius=(xLine+Yline)/1.5
            this.radius = Math.sqrt(width**2+height**2)
            console.log(this.radius)
            //radius=radius<0?radius*-1:radius
            this.draw(this.startX,this.startY,this.radius);
        }
    }

    draw(x,y,r){
        const img=new Image();
        img.src=this.saved;
        img.onload=()=>{
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
            this.ctx.drawImage(img,0,0,this.canvas.width,this.canvas.height)
            this.ctx.beginPath();
            this.ctx.arc(x,y,r,0,2*Math.PI);
            this.ctx.fill()
            this.ctx.stroke()
        }
        this.ctx.arc(x,y,r,0,2*Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }
    static staticDraw(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r,0,2*Math.PI);
        ctx.fill()
        ctx.stroke()
    }
}