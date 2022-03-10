// import Phaser from 'phaser';

/*

TODO:

- salvar ranking passado do desafiador junto do share mas encryptado
- base64 no cenario e ranking vencedor?
- so fazer os objetos andarem quando o personagem começa a correr ( para o tempo começar a contar)
- gerar novo cenário tem de abrir /miolo automatica
- criar ferramenta de compartilhamento
- aprender adicionar sons
- colocar cenário de fundo e de frente alem do ceu
*/

// stage by url ================================================================

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('o')) {
    let stageParam = urlParams.get('o').replace(/[^0-9]/g, '');
    if (stageParam.length > 120) stageParam = stageParam.slice(0, 119);
    window.localStorage.setItem('stage', stageParam);
}

// stage by storage ============================================================

let stage = window.localStorage.getItem('stage')
    ? window.localStorage.getItem('stage')
    : '';

// record by stage =============================================================

let record = window.localStorage.getItem(stage);

let score = null;

function stage_create() {
    let stageTemp = '';
    for (let i = 0; i < 30; i++) {
        const number = Phaser.Math.Between(1, 6);
        stageTemp = stageTemp + '' + number;
        const zeros = Phaser.Math.Between(0, 3);
        for (z = 0; z < zeros; z++) stageTemp = stageTemp + '0';
    }
    window.localStorage.setItem('stage', stageTemp);
    stage = stageTemp;
    record = window.localStorage.getItem(stageTemp);
    window.history.pushState(null, null, '/miolo?o=' + stageTemp);
}

if (stage === '') {
    stage_create();
}

function convert_time(time) {
    const fix = new Date(time * 10);
    const min = String(fix.getMinutes()).padStart(2, '0');
    const sec = String(fix.getSeconds()).padStart(2, '0');
    const mil = String(fix.getMilliseconds()).slice(0, 2).padStart(2, '0');
    return min + ':' + sec + ',' + mil;
}

const gamepad_find = (__this) => {
    let found = false;
    if (__this.input.gamepad.total !== 0) {
        const pads = __this.input.gamepad.gamepads;
        for (let i = 0; i < pads.length; i++) {
            if (pads[i]) {
                found = pads[i];
                console.log(found);
                break;
            }
        }
    }
    return found;
};

const gamepad = (gamepad, button) => {
    if (gamepad) {
        const buttons = gamepad.buttons;
        if (buttons[0]?.pressed && button === 'a') return true;
        if (buttons[1]?.pressed && button === 'b') return true;
        if (buttons[2]?.pressed && button === 'x') return true;
        if (buttons[3]?.pressed && button === 'y') return true;
        if (buttons[4]?.pressed && button === 'l1') return true;
        if (buttons[5]?.pressed && button === 'r1') return true;
        if (buttons[6]?.pressed && button === 'l2') return true;
        if (buttons[7]?.pressed && button === 'r2') return true;
        if (buttons[8]?.pressed && button === 'select') return true;
        if (buttons[9]?.pressed && button === 'start') return true;
        if (buttons[10]?.pressed && button === 'l3') return true;
        if (buttons[11]?.pressed && button === 'r3') return true;
        if (gamepad.left && button === 'left') return true;
        if (gamepad.left && button === 'left') return true;
        if (gamepad.right && button === 'right') return true;
        if (gamepad.up && button === 'up') return true;
        if (gamepad.down && button === 'down') return true;
    }
    return false;
};

const keyboard_find = (__this) => {
    return __this.input.keyboard.addKeys({
        a: Phaser.Input.Keyboard.KeyCodes.A,
        c: Phaser.Input.Keyboard.KeyCodes.C,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
        esc: Phaser.Input.Keyboard.KeyCodes.ESC,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        w: Phaser.Input.Keyboard.KeyCodes.W,
    });
};

const keyboard = (keyboard, button) => {
    if (keyboard) {
        if (keyboard.a.isDown && button === 'a') return true;
        if (keyboard.c.isDown && button === 'c') return true;
        if (keyboard.d.isDown && button === 'd') return true;
        if (keyboard.enter.isDown && button === 'enter') return true;
        if (keyboard.esc.isDown && button === 'esc') return true;
        if (keyboard.s.isDown && button === 's') return true;
        if (keyboard.w.isDown && button === 'w') return true;
    }
    return false;
};

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

class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.heigh;
        this.keyboard = keyboard_find(this);

        if (record != null && String(record) === String(score)) {
            this.recordText = this.add.text(
                this.width / 2 - 300,
                100,
                'novo recorde!',
                {
                    font: '40px Courier New',
                    fill: '#000',
                }
            );
        }

        if (score !== null) {
            this.scoreText = this.add.text(
                this.width / 2 - 300,
                200,
                'seu tempo foi ' + convert_time(score),
                {
                    font: '15px Courier New',
                    fill: '#000',
                }
            );
        }

        if (record != null) {
            this.recordText = this.add.text(
                this.width / 2 - 300,
                250,
                'seu recorde atual é ' + convert_time(record),
                {
                    font: '15px Courier New',
                    fill: '#000',
                }
            );
            this.startText = this.add.text(
                this.width / 2 - 300,
                300,
                '[ENTER] / (START) tentar de novo',
                {
                    font: '20px Courier New',
                    fill: '#888',
                }
            );
            this.shareText = this.add.text(
                this.width / 2 - 300,
                350,
                '[S] / (SELECT) compartilhar percurso',
                {
                    font: '20px Courier New',
                    fill: '#888',
                }
            );
        } else {
            this.startText = this.add.text(
                this.width / 2 - 300,
                350,
                '[ENTER] / (START) começar',
                {
                    font: '20px Courier New',
                    fill: '#888',
                }
            );
        }

        this.createText = this.add.text(
            this.width / 2 - 300,
            500,
            '[C] / (Y) gerar novo percurso',
            {
                font: '30px Courier New',
                fill: '#888',
            }
        );
    }

    update() {
        if (!this.gamepad) this.gamepad = gamepad_find(this);

        if (
            gamepad(this.gamepad, 'start') ||
            keyboard(this.keyboard, 'enter')
        ) {
            this.startText?.setText('prepare-se . . .');
            this.time.addEvent({
                delay: 1000,
                loop: false,
                callback: () => {
                    this.scene.start('Game');
                },
            });
        }

        if (gamepad(this.gamepad, 'y') || keyboard(this.keyboard, 'r')) {
            this.startText?.setText('gerando novo percurso . . .');
            this.recordText?.setText('');
            stage_create();
            record = null;
            score = null;
            this.time.addEvent({
                delay: 1000,
                loop: false,
                callback: () => {
                    this.scene.restart();
                },
            });
        }
    }
}

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.maxSpeed = 2000;
        this.currentSpeed = 0;
        this.jumping = false;
        this.allTime = 0;
    }

    preload() {
        // scenario ============================================================

        this.load.image('sky', 'assets/sky.png');
        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.image('tiles2', 'assets/ground.png');
        this.load.tilemapTiledJSON('map2', 'assets/ground.json');
        this.load.image('first', 'assets/first.png');
        this.load.image('mount', 'assets/mount.png');

        // ground ==============================================================

        this.load.spritesheet('ground', 'assets/ground.png', {
            frameWidth: 500,
            frameHeight: 50,
        });

        // player ==============================================================

        this.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 50,
            frameHeight: 100,
        });

        // finish ==============================================================

        this.load.spritesheet('finish', 'assets/finish.png', {
            frameWidth: 300,
            frameHeight: 300,
        });

        // obstacle ============================================================

        this.load.spritesheet('50x50', 'assets/obstacle.png', {
            frameWidth: 50,
            frameHeight: 50,
        });

        this.load.spritesheet('100x100', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });

        this.load.spritesheet('50x50_air', 'assets/obstacle.png', {
            frameWidth: 50,
            frameHeight: 50,
        });

        this.load.spritesheet('100x100_air', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });

        this.load.spritesheet('200x100', 'assets/obstacle.png', {
            frameWidth: 200,
            frameHeight: 100,
        });

        this.load.spritesheet('100x50_run', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 50,
        });
    }

    create() {
        // config ==============================================================
        this.keyboard = keyboard_find(this);
        const { width, height } = this.sys.game.canvas;

        // player ==============================================================

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0],
            }),
            frameRate: 1,
            repeat: -1,
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [1],
            }),
            frameRate: 1,
            repeat: -1,
        });

        const playerX = width / 3;
        //this.player = this.physics.add.sprite(playerX, height - 100, 'player');
        this.player = this.physics.add.sprite(playerX, height - 100);
        this.cameras.main.startFollow(this.player, false, 1, 1, playerX * -1);
        this.player.setCollideWorldBounds(true).setDepth(30);

        // ground ==============================================================

        const ground = this.physics.add.staticGroup();
        let groundWidth = 250;
        for (let i = 0; i < 200; i++) {
            const current = ground.create(groundWidth, height - 25, 'ground');
            current.body.updateFromGameObject();
            groundWidth += 500;
        }
        this.cameras.main.setBounds(0, 0, groundWidth - 500, height);
        this.physics.world.bounds.width = groundWidth - 500;
        this.physics.world.bounds.height = height;
        this.physics.add.collider(this.player, ground);
        ground.setDepth(20);

        // obstacle ============================================================

        let obstacleX = 2500;
        let countZeros = 0;
        for (let i = 0; i < stage.length; i++) {
            const number = Number(stage[i]);

            let x = 0;
            let y = 0;
            let speed = 0;
            let obs = '';

            if (number === 1) {
                x = 25 + 250;
                y = 75;
                obs = '50x50';
                speed = 0;
            }

            if (number === 2) {
                x = 50 + 350;
                y = 100;
                obs = '100x100';
                speed = 0;
            }

            if (number === 3) {
                x = 25 + 250;
                y = 150;
                obs = '50x50_air';
                speed = 0;
            }

            if (number === 4) {
                x = 50 + 250;
                y = 175;
                obs = '100x100_air';
                speed = 0;
            }

            if (number === 5) {
                x = 100 + 350;
                y = 100;
                obs = '200x100';
                speed = 0;
            }

            if (number === 6) {
                x = 50;
                y = 75;
                obs = '100x50_run';
                speed = -250;
            }

            if (number === 0 && countZeros < 3) {
                countZeros += 1;
                obstacleX += 250;
            }

            if (number > 0 && number < 5 && obs !== '') {
                countZeros = 0;
                obstacleX += x;
                const current = this.physics.add
                    .staticSprite(obstacleX, height - y, obs)
                    .setDepth(20);
                this.physics.add.collider(current, this.player, () => {
                    this.update_reset();
                });
                obstacleX += x;
            }

            if (number > 5 && obs !== '') {
                countZeros = 0;
                obstacleX += x;
                const current = this.physics.add
                    .sprite(obstacleX, height - y, obs)
                    .setDepth(20)
                    .setVelocityX(speed);
                current.setCollideWorldBounds(true).setDepth(20);
                this.physics.add.collider(current, ground);
                this.physics.add.collider(current, this.player, () => {
                    this.update_reset();
                });
                obstacleX += x;
            }
        }

        // finish ==============================================================

        const finish = this.physics.add.staticSprite(
            obstacleX + 1500,
            height - 200,
            'finish'
        );
        finish.setDepth(20);
        this.physics.add.collider(finish, this.player, () => {
            score = this.allTime;
            if (record === null || Number(score) < Number(record)) {
                record = score;
                window.localStorage.setItem(stage, String(score));
            }
            this.update_reset();
            this.scene.start('Menu');
        });

        // sky =================================================================

        this.cameras.main.setBackgroundColor(0xdcdcdc);
        this.add
            .tileSprite(0, height - 300, width * 10, 500, 'sky')
            .setScrollFactor(0.05)
            .setDepth(10);

        // text ================================================================

        this.scoreText = this.add
            .text(40, 40, '00:00,0', {
                font: '28px Courier New',
                fill: '#555',
            })
            .setDepth(70)
            .setScrollFactor(0);

        this.recordText = this.add
            .text(40, 70, convert_time(record), {
                font: '13px Courier New',
                fill: '#aaa',
            })
            .setDepth(70)
            .setScrollFactor(0);

        this.time.addEvent({
            callback: () => {
                if (this.currentSpeed > 0) {
                    this.allTime += 1;
                    this.scoreText?.setText(convert_time(this.allTime));
                }
            },
            callbackScope: this,
            delay: 10,
            loop: true,
        });
    }

    update() {
        if (!this.gamepad) this.gamepad = gamepad_find(this);

        this.update_player();

        if (keyboard(this.keyboard, 'enter') || gamepad(this.gamepad, 'y')) {
            this.update_reset();
        }

        if (keyboard(this.keyboard, 'esc') || gamepad(this.gamepad, 'start')) {
            this.update_reset();
            score = null;
            this.time.addEvent({
                delay: 1000,
                loop: false,
                callback: () => {
                    this.scene.start('Menu');
                },
            });
        }
    }

    update_player() {
        // if ((keyboard(this.keyboard, 'd') || gamepad(this.gamepad, 'right')) && this.player.body.onFloor()) {
        if (keyboard(this.keyboard, 'd') || gamepad(this.gamepad, 'right')) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += 2;
                console.log(this.currentSpeed);
            }
        }

        // if (this.cursors.right.isUp && this.player.body.onFloor()) {
        if (!keyboard(this.keyboard, 'd') && !gamepad(this.gamepad, 'right')) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 1;
                console.log(this.currentSpeed);
            } else {
                this.currentSpeed = 0;
            }
        }

        //if (this.cursors.left.isDown && this.player.body.onFloor()) {
        if (keyboard(this.keyboard, 'a') || gamepad(this.gamepad, 'left')) {
            if (this.currentSpeed !== 0) {
                this.currentSpeed -= 4;
                console.log(this.currentSpeed);
                if (this.currentSpeed < 0) {
                    this.currentSpeed = 0;
                }
            }
        }

        if (keyboard(this.keyboard, 'w') || gamepad(this.gamepad, 'a')) {
            if (!this.jumping && this.player.body.onFloor()) {
                this.jumping = true;
                this.player.body.setVelocityY(
                    this.currentSpeed > 300 ? -528 : -428
                );
            }
        }

        if (!keyboard(this.keyboard, 'w') && !gamepad(this.gamepad, 'a')) {
            if (this.jumping && this.player.body.onFloor()) {
                this.jumping = false;
            }
        }

        if (keyboard(this.keyboard, 's') || gamepad(this.gamepad, 'down')) {
            this.player.body
                .setSize(50, 70, false)
                .setOffset(this.player.frame.x, this.player.frame.y + 30);
            this.player.play('down');
        }

        if (!keyboard(this.keyboard, 's') && !gamepad(this.gamepad, 'down')) {
            this.player.body
                .setSize(50, 100, false)
                .setOffset(this.player.frame.x, this.player.frame.y);
            this.player.play('up');
        }

        this.player.setVelocityX(this.currentSpeed);
    }

    update_reset() {
        this.currentSpeed = 0;
        this.player.setVelocityX(0);
        this.allTime = 0;
        this.scene.restart();
    }
}

const config = {
    backgroundColor: '0xdcdcdc',
    fps: {
        target: 60,
        forceSetTimeOut: true,
    },
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    input: {
        gamepad: true,
    },
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false,
        },
    },
    render: {
        pixelArt: true,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Menu, Game],
    type: Phaser.CANVAS,
};

const game = new Phaser.Game(config);
