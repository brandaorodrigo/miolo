const urlParams = new URLSearchParams(window.location.search);

let o = urlParams.get('o') ?? '';
let stage = o.replace(/[^0-9]/g, '');
if (stage.length > 120) stage = stage.slice(0, 119);

console.log(stage);

let record = window.localStorage.getItem(stage)
    ? Number(window.localStorage.getItem(stage))
    : null;

class Intro extends Phaser.Scene {
    constructor() {
        super('Intro');
    }

    create() {
        this.recordText = this.add.text(160, 120, record, {
            font: '30px Courier New',
            fill: '#000',
        });
        this.cursors = this.input.keyboard.addKeys({
            start: Phaser.Input.Keyboard.KeyCodes.ENTER,
        });
    }

    update() {
        if (this.cursors.start.isDown) {
            this.recordText.setText('READY...');
            this.time.addEvent({
                delay: 2000,
                loop: false,
                callback: () => {
                    this.scene.start('MyGame');
                },
            });
        }
    }
}

class MyGame extends Phaser.Scene {
    constructor() {
        super('MyGame');
        this.maxSpeed = 2600;
        this.currentSpeed = 0;
        this.jumping = false;
        this.allTime = 0;
        this.timer = new Phaser.Time.TimerEvent();
    }

    preload() {
        this.load.setBaseURL('//localhost:88/miolo2/');
        this.load.image('back', 'assets/back.png');

        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.image('tiles2', 'assets/ground.png');
        this.load.tilemapTiledJSON('map2', 'assets/ground.json');

        this.load.image('ground', 'assets/ground.png');

        this.load.image('sky', 'assets/sky.png');

        this.load.image('first', 'assets/first.png');
        this.load.image('mount', 'assets/mount.png');

        this.load.spritesheet('player', 'assets/sk8r.png', {
            frameWidth: 100,
            frameHeight: 200,
        });

        this.load.spritesheet('finish', 'assets/finish.png', {
            frameWidth: 400,
            frameHeight: 400,
        });

        // obstacle ============================================================

        this.load.spritesheet('1x1', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });

        this.load.spritesheet('2x2', 'assets/obstacle.png', {
            frameWidth: 200,
            frameHeight: 200,
        });

        this.load.spritesheet('1x1_air', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });

        this.load.spritesheet('2x2_air', 'assets/obstacle.png', {
            frameWidth: 200,
            frameHeight: 200,
        });

        this.load.spritesheet('4x2', 'assets/obstacle.png', {
            frameWidth: 400,
            frameHeight: 200,
        });

        this.load.spritesheet('6x1', 'assets/obstacle.png', {
            frameWidth: 600,
            frameHeight: 100,
        });
    }

    reset() {
        this.currentSpeed = 0;
        this.player.setVelocityX(0);
        this.allTime = 0;
        this.scene.restart();
    }

    create() {
        // config ==============================================================

        const { width, height } = this.sys.game.canvas;
        this.physics.world.setFPS(44);

        // player ==============================================================

        const playerX = width / 3;
        this.player = this.physics.add.sprite(playerX, height - 300, 'player');
        this.cameras.main.startFollow(this.player, false, 1, 1, playerX * -1);
        this.player.setCollideWorldBounds(true).setDepth(30);

        // ground ==============================================================

        const ground = this.physics.add.staticGroup();
        let groundWidth = 0;
        for (let i = 0; i < 200; i++) {
            const current = ground.create(groundWidth, height - 50, 'ground');
            current.body.updateFromGameObject();
            groundWidth += 800;
        }
        this.cameras.main.setBounds(0, 0, groundWidth - 800, height);
        this.physics.world.bounds.width = groundWidth - 800;
        this.physics.world.bounds.height = height;
        this.physics.add.collider(this.player, ground);
        ground.setDepth(20);

        // obstacle ============================================================

        const obstacle = this.physics.add.staticGroup();
        let obstacleWidth = 2000;
        let countZeros = 0;
        for (let i = 0; i < stage.length; i++) {
            const number = Number(stage[i]);

            let x = 0;
            let y = 0;
            let obs = '';

            if (number === 1) {
                x = 50;
                y = 150;
                obs = '1x1';
            }
            if (number === 2) {
                x = 100;
                y = 200;
                obs = '2x2';
            }
            if (number === 3) {
                x = 50;
                y = 300;
                obs = '1x1_air';
            }
            if (number === 4) {
                x = 100;
                y = 350;
                obs = '2x2_air';
            }
            if (number === 5) {
                x = 200;
                y = 200;
                obs = '4x2';
            }
            if (number === 6) {
                x = 300;
                y = 150;
                obs = '6x1';
            }
            if (number !== 0 && obs !== '') {
                countZeros = 0;
                obstacleWidth += x;
                const current = obstacle.create(obstacleWidth, height - y, obs);
                current.body.updateFromGameObject();
                obstacleWidth += x;
            }
            if (number === 0 && countZeros < 4) {
                countZeros += 1;
                obstacleWidth += 800;
            }
        }
        this.physics.add.collider(obstacle, this.player, () => {
            this.reset();
        });
        obstacle.setDepth(20);

        // finish ==============================================================

        const finish = this.physics.add.staticSprite(
            obstacleWidth + 600,
            height - 300,
            'finish'
        );
        finish.setDepth(20);
        this.physics.add.collider(finish, this.player, () => {
            if (record === null || this.allTime < Number(record)) {
                record = this.allTime;
                window.localStorage.setItem(stage, String(record));
            }
            this.scene.start('Intro');
        });

        // sky =================================================================

        this.cameras.main.setBackgroundColor(0xdcdcdc);
        this.add
            .tileSprite(0, height - 500, width * 10, 800, 'sky')
            .setScrollFactor(0.05)
            .setDepth(10);

        // cursors =============================================================

        this.cursors = this.input.keyboard.addKeys({
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W,
            replay: Phaser.Input.Keyboard.KeyCodes.R,
        });

        /*
        this.cursors = this.input.keyboard.addKeys({
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            replay: Phaser.Input.Keyboard.KeyCodes.R,
        });
        */

        // text ================================================================

        this.scoreText = this.add.text(6, 85, '00:00,0', {
            font: '30px Courier New',
            fill: '#000',
        });

        this.recordText = this.add.text(320, 85, record, {
            font: '10px Courier New',
            fill: '#000',
        });

        this.trigger = this.time.addEvent({
            callback: this.timer_score,
            callbackScope: this,
            delay: 10,
            loop: true,
        });
    }

    timer_score() {
        this.allTime += 1;
        const fix_allTime = new Date(this.allTime * 10);
        this.scoreText.setText(
            fix_allTime.getMinutes() +
                ':' +
                fix_allTime.getSeconds() +
                ',' +
                String(fix_allTime.getMilliseconds()).slice(0, 1)
        );
    }

    update_player() {
        if (this.currentSpeed !== 0) {
            this.scoreText.setPosition(this.player.x - 30, 85);
            this.recordText.setPosition(this.player.x + 100, 85);
        }

        if (this.cursors.right.isDown) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += 6;
                this.player.setVelocityX(this.currentSpeed);
            }
        }

        if (this.cursors.right.isUp) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 3;
                this.player.setVelocityX(this.currentSpeed);
            } else {
                this.currentSpeed = 0;
            }
        }

        if (this.cursors.left.isDown) {
            if (this.currentSpeed !== 0) {
                this.currentSpeed -= 6;
                if (this.currentSpeed < 0) {
                    this.currentSpeed = 0;
                }
            }
        }

        if (this.cursors.jump.isDown) {
            if (!this.jumping && this.player.body.onFloor()) {
                this.jumping = true;
                this.player.body.setVelocityY(
                    this.currentSpeed > 600 ? -740 : -400
                );
            }
        }

        if (this.cursors.jump.isUp) {
            if (this.jumping && this.player.body.onFloor()) {
                this.jumping = false;
            }
        }

        if (this.cursors.down.isDown) {
            this.player.body
                .setSize(100, 140, false)
                .setOffset(this.player.frame.x, this.player.frame.y + 60);
        }

        if (this.cursors.down.isUp) {
            this.player.body
                .setSize(100, 200, false)
                .setOffset(this.player.frame.x, this.player.frame.y);
        }

        if (this.cursors.replay.isDown) {
            this.reset();
        }
    }

    update() {
        this.update_player();
    }
}

const _width = window.innerWidth * window.devicePixelRatio;
const _height = window.innerHeight * window.devicePixelRatio;

const config = {
    type: Phaser.CANVAS,
    pixelArt: true,
    scale: {
        // Fit to window
        mode: Phaser.Scale.FIT,
        // Center vertically and horizontally
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: _width,
    height: _height,
    //renderer: resize(Number(_width), Number(_height)),
    backgroundColor: '0xffffff',
    parent: 'game',
    scene: [Intro, MyGame],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: true,
        },
    },
};

const game = new Phaser.Game(config);
