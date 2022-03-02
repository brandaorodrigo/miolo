let player;
let cursors;
let cam;

class MyGame extends Phaser.Scene {
    constructor() {
        super();
        this.maxSpeed = 1000;
        this.currentSpeed = 0;
        this.jumping = false;
    }

    preload() {
        this.load.setBaseURL('http://localhost:88/miolo');
        this.load.image('back', 'assets/back.png');

        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.spritesheet('player', 'assets/rod.png', {
            frameWidth: 48,
            frameHeight: 48,
        });
    }

    create() {
        //const back = this.add.image(0, 0, 'back').setScale(3);
        this.back = this.add
            .tileSprite(0, 0, 3000, 600, 'back')
            .setScale(3)
            .setOrigin(0, 0);

        const map = this.make.tilemap({ key: 'map' });

        const tileset = map.addTilesetImage('map', 'tiles');
        const ground = map.createLayer('chao', tileset, 0, 0);
        //const collider = map.createLayer('colider', tileset, 0, 0);
        //const fundo = map.createLayer('fundo', tileset, 0, 0);
        ground.setCollisionByProperty({ collider: true });
        //fundo.setDepth(10);

        this.physics.world.setFPS(44);
        this.physics.world.bounds.width = ground.width;
        this.physics.world.bounds.height = ground.height;

        this.player = this.physics.add.sprite(100, 300, 'player');
        this.player.setScale(3).setOrigin(0, 0);
        this.player.setCollideWorldBounds(true);

        //collider.setCollisionByProperty({ collider: true });
        //this.physics.add.collider(this.player, collider);
        this.physics.add.collider(this.player, ground);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(
            0,
            0,
            ground.layer.widthInPixels,
            ground.layer.heightInPixels,
            true
        );
    }

    update() {
        // configura controles
        cursors = this.input.keyboard.addKeys({
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W,
            replay: Phaser.Input.Keyboard.KeyCodes.R,
        });

        // acelera skate até 1000 se para de apertar vai freiando em -0.2
        if (cursors.right.isDown) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += 4;
                this.player.setVelocityX(this.currentSpeed);
            }
        } else {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 0.5;
                this.player.setVelocityX(this.currentSpeed);
            } else {
                this.currentSpeed = 0;
            }
        }

        // se aperta para trás o skate freia em -0.6
        if (cursors.left.isDown && this.currentSpeed !== 0) {
            this.currentSpeed -= 1.4;
            if (this.currentSpeed < 0) this.currentSpeed = 0;
        }

        // o pulo acontece somente um de cada vez em velocidade -500
        if (
            cursors.jump.isDown &&
            !this.jumping &&
            this.player.body.onFloor()
        ) {
            this.jumping = true;
            this.player.body.setVelocityY(
                this.currentSpeed > 400 ? -600 : -300
            );
        }

        // libera pulo de novo depois que o anterior terminou
        if (cursors.jump.isUp && this.jumping && this.player.body.onFloor()) {
            this.jumping = false;
        }

        // abaixar
        if (cursors.down.isDown) {
            var f = this.player.frame;
            this.player.body.setSize(30, 30, false).setOffset(f.x, f.y + 16);
        } else {
            var f = this.player.frame;
            this.player.body.setSize(30, 46, false).setOffset(f.x, f.y);
        }

        // replay
        if (cursors.replay.isDown) {
            this.currentSpeed = 0;
            this.player.setVelocityX(-4000);
        }
    }
}

const config = {
    type: Phaser.CANVAS,
    parent: 'phaser-example',
    width: 1280,
    frames: 12,
    height: 720,
    backgroundColor: '0xffffff',
    scene: MyGame,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            bounce: 0.5,
            debug: true,
        },
    },
};

const game = new Phaser.Game(config);
