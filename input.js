class Gamepad {
    constructor(scene) {
        this.scene = scene;
        setInterval(() => {
            if (!this.gamepad) {
                if (this.scene.input.gamepad.total !== 0) {
                    //this.gamepad = this.scene.input.gamepad.getPad(0);
                    const pads = this.scene.input.gamepad.gamepads;
                    for (let i = 0; i < pads.length; i++) {
                        if (pads[i]) {
                            this.gamepad = pads[i];
                            break;
                        }
                    }
                }
            }
        }, 400);
    }

    press(button) {
        if (this.gamepad) {
            // buttons
            if (this.gamepad?.buttons) {
                const buttons = this.gamepad.buttons;
                if (buttons[0]?.pressed && button === 'a') return 1;
                if (buttons[1]?.pressed && button === 'b') return 1;
                if (buttons[2]?.pressed && button === 'x') return 1;
                if (buttons[3]?.pressed && button === 'y') return 1;
                if (buttons[4]?.pressed && button === 'l1') return 1;
                if (buttons[5]?.pressed && button === 'r1') return 1;
                if (buttons[6]?.pressed && button === 'l2') return 1;
                if (buttons[7]?.pressed && button === 'r2') return 1;
                if (buttons[8]?.pressed && button === 'select') return 1;
                if (buttons[9]?.pressed && button === 'start') return 1;
                if (buttons[10]?.pressed && button === 'l3') return 1;
                if (buttons[11]?.pressed && button === 'r3') return 1;
            }
            // arrows
            if (button === 'down') return this.gamepad.down;
            if (button === 'left') return this.gamepad.left;
            if (button === 'right') return this.gamepad.right;
            if (button === 'up') return this.gamepad.up;
            // axis
            if (button === 'axis1y') return this.gamepad.leftStick.y;
            if (button === 'axis1x') return this.gamepad.leftStick.x;
            if (button === 'axis2y') return this.gamepad.rightStick.y;
            if (button === 'axis2x') return this.gamepad.rightStick.x;
        }
        return 0;
    }
}

class Keyboard {
    constructor(scene) {
        this.scene = scene;
        const keys = [
            // letters
            'q',
            'w',
            'e',
            'r',
            'a',
            's',
            'd',
            'f',
            'z',
            'x',
            'c',
            'v',
            // arrows
            'up',
            'down',
            'left',
            'right',
            // specials
            'esc',
            'tab',
            'shift',
            'ctrl',
            'alt',
            'space',
            'enter',
            'backspace',
        ];
        const map = [];
        keys.forEach((key) => {
            map[key] = Phaser.Input.Keyboard.KeyCodes[key.toUpperCase()];
        });
        this.keyboard = this.scene.input.keyboard.addKeys(map);
    }

    press(button) {
        if (
            this.keyboard &&
            this.keyboard[button] &&
            this.keyboard[button].isDown
        ) {
            return true;
        } else {
            return false;
        }
    }
}

/*
class Example extends Phaser.Scene {
    constructor() {
        super('Example');
    }

    create() {
        this.gamepad = new Gamepad(this);
        this.keyboard = new Keyboard(this);
    }

    update() {
        const keyboard = (button) => this.keyboard.press(button);
        const gamepad = (button) => this.gamepad.press(button);

        if (gamepad('a') || keyboard('enter')) {
            console.log('a');
        }
    }
}
*/
