class Example extends Phaser.Scene {
    constructor() {
        super('Example');
    }

    preload() {}

    create() {
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.heigh;
        this.keyboard = keyboard_find(this);
    }

    update() {
        if (!this.gamepad) this.gamepad = gamepad_find(this);

        if (
            gamepad(this.gamepad, 'start') ||
            keyboard(this.keyboard, 'enter')
        ) {
            this.time.addEvent({
                delay: 1000,
                loop: false,
                callback: () => {
                    this.scene.start('Menu');
                },
            });
        }
    }
}
