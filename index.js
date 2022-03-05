const urlParams = new URLSearchParams(window.location.search);
const stage = urlParams.get('o');
let fix_stage = stage;
if (!stage) fix_stage = 'dumontcityskateboard';
fix_stage = fix_stage.toLowerCase().replace(/[^A-Za-z]/g, '');
if (!fix_stage) fix_stage = 'dumontcityskateboard';
if (fix_stage.length > 40) fix_stage = fix_stage.slice(0, 40);

const index_alphax =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const oo = [];

for (let i = 0; i < fix_stage.length; ++i) {
    let index = index_alphax.indexOf(fix_stage.charAt(i));
    if (index < 0) index = 0;
    oo.push(index);
    //oo.push(Phaser.Math.Between(0, 62));
}

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
        this.maxSpeed = 600;
        this.currentSpeed = 0;
        this.jumping = false;
        this.allTime = 0;
        this.timer = new Phaser.Time.TimerEvent();
    }

    preload() {
        this.load.setBaseURL('//localhost:88/miolo/');
        this.load.image('back', 'assets/back.png');

        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.image('tiles2', 'assets/ground.png');
        this.load.tilemapTiledJSON('map2', 'assets/ground.json');

        this.load.spritesheet('obstacle', 'assets/obstacle.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('obstacle2', 'assets/obstacle.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('player', 'assets/rod.png', {
            frameWidth: 64,
            frameHeight: 32,
        });

        this.load.spritesheet('end', 'assets/end.png', {
            frameWidth: 32,
            frameHeight: 96,
        });
    }

    create() {
        this.add
            .tileSprite(0, 16, 10000, 240, 'back')
            .setOrigin(0, 0)
            .setScrollFactor(0.2);

        const map = this.make.tilemap({ key: 'map2' });

        const tileset = map.addTilesetImage('ground', 'tiles2');
        const ground = map.createLayer('ground', tileset, 0, 0);
        //const collider = map.createLayer('colider', tileset, 0, 0);
        //const fundo = map.createLayer('fundo', tileset, 0, 0);
        //fundo.setDepth(10);

        ground.setCollisionByProperty({ collider: true });

        this.physics.world.setFPS(44);
        this.physics.world.bounds.width = ground.width;
        this.physics.world.bounds.height = ground.height;

        this.player = this.physics.add.sprite(40, 240, 'player');
        //this.player.body.bounce.set(0.3);
        this.player.setCollideWorldBounds(true);

        //collider.setCollisionByProperty({ collider: true });
        //this.physics.add.collider(this.player, collider);
        this.physics.add.collider(this.player, ground);

        this.cameras.main.startFollow(this.player, false, 1, 1, -100);

        this.cameras.main.setBounds(
            0,
            0,
            ground.layer.widthInPixels,
            ground.layer.heightInPixels,
            true
        );

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

        const platforms = this.physics.add.staticGroup();

        let last_obstacle = 300;

        oo.forEach((cc) => {
            let x = 300;
            let y = 280;
            let obs = 'obstacle';

            if (cc > 0 && cc < 16) {
                x = 300;
                y = 280;
                obs = 'obstacle';
            }

            if (cc > 16 && cc < 30) {
                x = 600;
                y = 260;
                obs = 'obstacle2';
            }

            if (cc > 30 && cc < 45) {
                x = 800;
                y = 230;
                obs = 'obstacle';
            }

            if (cc > 45) {
                x = 800;
                y = 215;
                obs = 'obstacle2';
            }

            last_obstacle += x;

            const platform = platforms.create(last_obstacle, y, obs);
            const body = platform.body;
            body.updateFromGameObject();
        });

        this.physics.add.collider(platforms, this.player, () => {
            this.currentSpeed = 0;
            this.player.setVelocityX(0);
            this.allTime = 0;
            this.scene.restart();
        });

        let end = this.physics.add.staticSprite(
            last_obstacle + 300,
            240,
            'end'
        );

        this.physics.add.collider(end, this.player, () => {
            if (record === null || this.allTime < Number(record)) {
                record = this.allTime;
                window.localStorage.setItem(stage, String(record));
            }
            this.currentSpeed = 0;
            this.player.setVelocityX(0);
            this.allTime = 0;
            this.scene.start('Intro');
        });

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
                this.currentSpeed += 1;
                this.player.setVelocityX(this.currentSpeed);
            }
        }

        if (this.cursors.right.isUp) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 0.5;
                this.player.setVelocityX(this.currentSpeed);
            } else {
                this.currentSpeed = 0;
            }
        }

        if (this.cursors.left.isDown) {
            if (this.currentSpeed !== 0) {
                this.currentSpeed -= 2;
                if (this.currentSpeed < 0) {
                    this.currentSpeed = 0;
                }
            }
        }

        if (this.cursors.jump.isDown) {
            if (!this.jumping && this.player.body.onFloor()) {
                this.jumping = true;
                this.player.body.setVelocityY(
                    this.currentSpeed > 200 ? -400 : -280
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
                .setSize(22, 36, false)
                .setOffset(this.player.frame.x + 5, this.player.frame.y + 26);
        }

        if (this.cursors.down.isUp) {
            this.player.body
                .setSize(22, 48, false)
                .setOffset(this.player.frame.x + 5, this.player.frame.y + 14);
        }

        if (this.cursors.replay.isDown) {
            this.currentSpeed = 0;
            this.player.setVelocityX(0);
            this.allTime = 0;
            this.scene.restart();
        }
    }

    update() {
        this.update_player();
    }
}

const config = {
    type: Phaser.CANVAS,
    pixelArt: true,
    width: 384,
    height: 240,
    zoom: 2,
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
