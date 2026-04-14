// importing local code, code we have written
import {IdleUpWidgetState, PressedWidgetState } from "../core/ui";
import {Window, Widget, RoleType, EventArgs} from "../core/ui";
// importing code from SVG.js library
import {Rect, Text, Box} from "../core/ui";

class Button extends Widget{
    private _rect: Rect;
    private _text: Text;
    private _input: string;
    private _fontSize: number;
    private _text_y: number;
    private _text_x: number;
    private defaultText: string= "Button";
    private defaultFontSize: number = 18;
    private defaultWidth: number = 80;
    private defaultHeight: number = 30;

    private colors = {
        idleup:       { fill: "#4F46E5", stroke: "#3730A3", text: "#FFFFFF" },
        hover:        { fill: "#6366F1", stroke: "#4F46E5", text: "#FFFFFF" },
        pressed:      { fill: "#3730A3", stroke: "#312E81", text: "#E0E7FF" },
        hoverPressed: { fill: "#3730A3", stroke: "#312E81", text: "#E0E7FF" },
        idledown:     { fill: "#6366F1", stroke: "#4F46E5", text: "#FFFFFF" },
        pressedout:   { fill: "#818CF8", stroke: "#6366F1", text: "#FFFFFF" },
        disabled:     { fill: "#C7D2FE", stroke: "#A5B4FC", text: "#6B7280" },
    };
    private _clickCallback: ((e: EventArgs) => void) | null = null;

    constructor(parent:Window){
        super(parent);
        // set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        this._input = this.defaultText;
        this._fontSize = this.defaultFontSize;
        // set Aria role
        this.role = RoleType.button;
        // render widget
        this.render();
        // set default or starting state
        this.setState(new IdleUpWidgetState());
        // prevent text selection
        this.selectable = false;
    }

    // Label & Size
    get label(): string {
        return this._input;
    }
    set label(value: string) {
        this._input = value;
        this.update();
    }
 
    get size(): [number, number] {
        return [this.width, this.height];
    }

    set size(value: [number, number]) {
        this.width = value[0];
        this.height = value[1];
        this.update();
    }


    set fontSize(size:number){
        this._fontSize= size;
        this.update();
    }

    private positionText(){
        let box:Box = this._text.bbox();
        // in TS, the prepending with + performs a type conversion from string to number
        this._text_y = (+this._rect.y() + ((+this._rect.height()/2)) - (box.height/2));
        this._text.x(+this._rect.x() + 4);
        if (this._text_y > 0){
            this._text.y(this._text_y);
        }
    }
    
    render(): void {
        this._group = (this.parent as Window).window.group();
        this._rect = this._group.rect(this.width, this.height);
        this._rect.stroke("black");
        this._text = this._group.text(this._input);
        // Set the outer svg element 
        this.outerSvg = this._group;
        // Add a transparent rect on top of text to 
        // prevent selection cursor and to handle mouse events
        let eventrect = this._group.rect(this.width, this.height).opacity(0).attr('id', 0);

        // register objects that should receive event notifications.
        // for this widget, we want to know when the group or rect objects
        // receive events
        this.registerEvent(eventrect);
    }

    override update(): void {
        if(this._text != null)
            this._text.font('size', this._fontSize);
            this._text.text(this._input);
            this.positionText();

        if(this._rect != null)
            this._rect.fill(this.backcolor);
        
        super.update();
    }
    
    pressReleaseState(): void {
        if (this.previousState instanceof PressedWidgetState) {
            const args = new EventArgs(this);
            this.raise(args);
            if (this._clickCallback) {
                this._clickCallback(args);
            }
        }
    }

    // implement the onClick event using a callback passed as a parameter
    onClick(callback: (e: EventArgs) => void): void {
        this._clickCallback = callback;
    }

    
    // give the states something to do! Use these methods to control the visual appearance of your widget
    idleupState(): void {
        const c = this.colors.idleup;
        this.backcolor = c.fill;
        this._rect?.stroke({ color: c.stroke, width: 1.5 });
        this._rect?.radius(8);
        this._text?.fill(c.text);
        this._group?.transform({ scale: 1 });
    }
    idledownState(): void {
        const c = this.colors.idledown;
        this.backcolor = c.fill;
        this._rect?.stroke({ color: c.stroke, width: 1.5 });
        this._text?.fill(c.text);
    }
 
    pressedState(): void {
        const c = this.colors.pressed;
        this.backcolor = c.fill;
        this._rect?.stroke({ color: c.stroke, width: 2 });
        this._text?.fill(c.text);
    }
 
    hoverState(): void {
        const c = this.colors.hover;
        this.backcolor = c.fill;
        this._rect?.stroke({ color: c.stroke, width: 1.5 });
        this._text?.fill(c.text);
        this._group?.transform({ scale: 1 });
    }
    hoverPressedState(): void {
        const c = this.colors.hoverPressed;
        this.backcolor = c.fill;
        this._rect?.stroke({ color: c.stroke, width: 2 });
        this._text?.fill(c.text);
        this._group?.transform({ scale: 0.97, origin: "center" });
    }
 
    pressedoutState(): void {
        const c = this.colors.pressedout;
        this.backcolor = c.fill;
        this._rect?.stroke({ color: c.stroke, width: 1.5 });
        this._text?.fill(c.text);
        this._group?.transform({ scale: 1 });
    }
 
    moveState(): void {
        this.hoverState();
    }
    keyupState(keyEvent?: KeyboardEvent): void {
        // Trigger click on Space or Enter for keyboard accessibility
        if (keyEvent?.key === " " || keyEvent?.key === "Enter") {
            const args = new EventArgs(this);
            this.raise(args);
            if (this._clickCallback) {
                this._clickCallback(args);
            }
        }
        this.idleupState();
    }
}

export {Button}