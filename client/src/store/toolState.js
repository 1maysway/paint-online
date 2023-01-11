import {makeAutoObservable} from "mobx";

class ToolState {
    tool = null;
    prevFillColor = '';
    prevStrokeColor = '';
    prevLineWidth = 1;

    constructor() {
        makeAutoObservable(this)

    }

    setTool(tool) {
        this.tool = tool;
    }

    setFillColor(color=this.prevFillColor) {
        this.prevFillColor = this.tool.ctx.fillStyle;

        this.tool.fillColor = color;
    }

    setStrokeColor(color=this.prevStrokeColor) {
        this.prevStrokeColor = this.tool.ctx.strokeStyle;

        this.tool.strokeColor = color;
    }

    setLineWidth(width=this.prevLineWidth) {
        this.prevLineWidth = this.tool.ctx.lineWidth;
        this.tool.lineWidth = width;
    }
}

export default new ToolState();