// global ======================================================================

const width = window.innerWidth;
const height = window.innerHeight;

let stage = null;
let score = null;
let record = null;

// controls ====================================================================

const keyboard_find = (that) => {
    const keys = [
        'a',
        'alt',
        'backspace',
        'c',
        'ctrl',
        'd',
        'e',
        'enter',
        'esc',
        'q',
        'r',
        's',
        'shift',
        'space',
        'tab',
        'w',
        'x',
        'z',
    ];
    const map = [];
    keys.forEach((key) => {
        map[key] = Phaser.Input.Keyboard.KeyCodes[key.toUpperCase()];
    });
    return that.input.keyboard.addKeys(map);
};

const keyboard_press = (keyboard, button) => {
    if (keyboard && keyboard[button] && keyboard[button].isDown) return true;
    else return false;
};

const gamepad_find = (that) => {
    let found = false;
    if (that.input.gamepad.total !== 0) {
        const pads = that.input.gamepad.gamepads;
        // const pad = this.input.gamepad.getPad(0);
        for (let i = 0; i < pads.length; i++) {
            if (pads[i]) {
                found = pads[i];
                break;
            }
        }
    }
    return found;
};

const gamepad_press = (gamepad, button) => {
    if (gamepad) {
        if (gamepad?.buttons) {
            const buttons = gamepad.buttons;
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

        if (button === 'down') return gamepad.down;
        if (button === 'left') return gamepad.left;
        if (button === 'right') return gamepad.right;
        if (button === 'up') return gamepad.up;

        if (button === 'axis1y') return gamepad.leftStick.y;
        if (button === 'axis1x') return gamepad.leftStick.x;
        if (button === 'axis2y') return gamepad.rightStick.y;
        if (button === 'axis2x') return gamepad.rightStick.x;
    }
    return 0;
};

// utils =======================================================================

const convert_time = (time) => {
    const fix = new Date(time * 10);
    const min = String(fix.getMinutes()).padStart(2, '0');
    const sec = String(fix.getSeconds()).padStart(2, '0');
    const mil = String(fix.getMilliseconds()).slice(0, 2).padStart(2, '0');
    return min + ':' + sec + ',' + mil;
};

const stage_from_url = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('o')) {
        let stage = urlParams.get('o').replace(/[^0-9|]/g, '');
        if (stage.length > 120) stage = stage.slice(0, 119);
        return stage;
    }
    return null;
};

const stage_from_create = () => {
    let stageTemp = '';
    for (let i = 0; i < 22; i++) {
        const number = Phaser.Math.Between(1, 6);
        stageTemp = stageTemp + '' + number;
        const zeros = Phaser.Math.Between(0, 3);
        for (z = 0; z < zeros; z++) stageTemp = stageTemp + '0';
    }
    stage = stageTemp;
    record = window.localStorage.getItem(stageTemp);
    window.history.pushState(null, null, '/miolo?o=' + stageTemp);
};

// scene : preload =============================================================

class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        // progress ------------------------------------------------------------
        this.cameras.main.setBackgroundColor(0x222222);
        let progress = this.add.graphics();
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xdddddd, 1);
            progress.fillRect(0, 0, width * value, height);
        });
        // load ----------------------------------------------------------------
        this.load.image('sky', 'assets/sky.png');
        this.load.image('tiles', 'assets/map.png');
        this.load.image('first', 'assets/first.png');
        this.load.image('mount', 'assets/mount.png');
        this.load.spritesheet('ground', 'assets/ground.png', {
            frameWidth: 500,
            frameHeight: 50,
        });
        this.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 50,
            frameHeight: 100,
        });
        this.load.spritesheet('finish', 'assets/finish.png', {
            frameWidth: 300,
            frameHeight: 300,
        });
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
        // preload stage -------------------------------------------------------
        stage = stage_from_url();
        if (!stage) stage = stage_from_create();
        record = window.localStorage.getItem(stage);
        // redirect to menu ----------------------------------------------------
        this.scene.start('Menu');
    }
}

// scene : menu ================================================================

class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        this.keyboard = keyboard_find(this);
        this.gamepad = null;

        if (record != null && String(record) === String(score)) {
            this.recordText = this.add.text(100, 100, 'NOVO RECORDE!', {
                font: '19px verdana',
                fill: '#000',
            });
        }

        if (score !== null) {
            this.scoreText = this.add.text(
                100,
                200,
                'SEU TEMPO FOI ' + convert_time(score),
                {
                    font: '10px verdana',
                    fill: '#000',
                }
            );
        }

        if (record != null) {
            this.recordText = this.add.text(
                100,
                250,
                'SEU RECORDE ATUAL É ' + convert_time(record),
                {
                    font: '10px verdana',
                    fill: '#000',
                }
            );
            this.startText = this.add.text(
                100,
                300,
                '(A) OU [ENTER] TENTAR DE NOVO\n\n(Y) OU [S]  COMPARTILHAR PERCURSO\n\n(X) OU [X]  GERAR NOVO PERCURSO',
                {
                    font: '10px verdana',
                    fill: '#777',
                }
            );
        } else {
            this.startText = this.add.text(
                100,
                350,
                '(A) OU [ENTER] COMEÇAR\n\n(X) OU [X] GERAR NOVO PERCURSO',
                {
                    font: '10px verdana',
                    fill: '#777',
                }
            );
        }
    }

    update() {
        if (!this.gamepad) this.gamepad = gamepad_find(this);
        const keyboard = (button) => keyboard_press(this.keyboard, button);
        const gamepad = (button) => gamepad_press(this.gamepad, button);

        if (gamepad('a') || keyboard('enter')) {
            this.startText?.setText('CARREGANDO...');
            setTimeout(() => {
                this.scene.start('Game');
            }, 200);
        }

        if (gamepad('x') || keyboard('x')) {
            this.startText?.setText('GERANDO NOVO PERCURSO...');
            this.recordText?.setText('');
            stage = stage_from_create();
            score = null;
            record = null;
            setTimeout(() => {
                this.scene.restart();
            }, 200);
        }
    }
}

// scene : game ================================================================

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.maxSpeed = 2000;
        this.currentSpeed = 0;
        this.monsterSpeed = 0;
        this.jumping = false;
        this.allTime = 0;
    }

    create() {
        // control -------------------------------------------------------------
        this.keyboard = keyboard_find(this);
        this.gamepad = null;

        // world ---------------------------------------------------------------
        this.cameras.main.setBackgroundColor(0xdcdcdc);
        this.add
            .tileSprite(0, height - 300, width * 10, 500, 'sky')
            .setScrollFactor(0.05)
            .setDepth(10);

        this.add
            .tileSprite(0, height - 40, width * 10, 450, 'mount')
            .setScrollFactor(0.2)
            .setDepth(12);

        this.add
            .tileSprite(0, height - 65, width * 10, 130, 'first')
            .setScrollFactor(6)
            .setDepth(80);

        // config ==============================================================
        //const { width, height } = this.sys.game.canvas;

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

        let obstacleX = 2600;
        let countZeros = 0;
        for (let i = 0; i < stage.length; i++) {
            const number = Number(stage[i]);

            let x = 0;
            let y = 0;
            let obs = '';

            if (number === 1) {
                x = 25 + 260;
                y = 75;
                obs = '50x50';
            }

            if (number === 2) {
                x = 50 + 360;
                y = 100;
                obs = '100x100';
            }

            if (number === 3) {
                x = 25 + 260;
                y = 150;
                obs = '50x50_air';
            }

            if (number === 4) {
                x = 50 + 260;
                y = 175;
                obs = '100x100_air';
            }

            if (number === 5) {
                x = 100 + 360;
                y = 100;
                obs = '200x100';
            }

            if (number === 6) {
                x = 50 + 360;
                y = 75;
                obs = '100x50_run';
            }

            if (number === 7) {
                x = 50 + 360;
                y = 75;
                obs = '50x50';
            }

            if (number === 8) {
                x = 50 + 360;
                y = 100;
                obs = '100x100';
            }

            if (number === 9) {
                x = 25 + 260;
                y = 75;
                obs = '50x50';
            }

            if (number === 0 && countZeros < 3) {
                countZeros += 1;
                obstacleX += 260;
            }

            if (number > 0 && number < 6 && obs !== '') {
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

            if (number == 6 && obs !== '') {
                countZeros = 0;
                obstacleX += x;
                const current = this.physics.add
                    .sprite(obstacleX, height - y, obs)
                    .setCollideWorldBounds(true)
                    .setDepth(20);
                this.physics.add.collider(current, ground);
                this.physics.add.collider(current, this.player, () => {
                    this.update_reset();
                });
                this.time.addEvent({
                    callback: () => {
                        if (this.currentSpeed > 0) current.setVelocityX(-360);
                    },
                    callbackScope: this,
                    delay: 100,
                    loop: true,
                });
                obstacleX += x;
            }

            if (number > 6 && number < 9 && obs !== '') {
                countZeros = 0;
                obstacleX += x;
                const current = this.physics.add
                    .sprite(obstacleX, height - y, obs)
                    .setCollideWorldBounds(true)
                    .setDepth(20);
                this.physics.add.collider(current, ground);
                this.physics.add.collider(current, this.player, () => {
                    this.update_reset();
                });
                this.time.addEvent({
                    callback: () => {
                        if (this.currentSpeed > 0) current.setVelocityY(-740);
                    },
                    callbackScope: this,
                    delay: 4000,
                    loop: true,
                });
                obstacleX += x;
            }

            if (number == 9 && obs !== '') {
                countZeros = 0;
                obstacleX += x;
                let odd = true;
                const current = this.physics.add
                    .staticSprite(obstacleX, height - y, obs)
                    .setDepth(20);
                this.physics.add.collider(current, this.player, () => {
                    this.update_reset();
                });
                this.time.addEvent({
                    callback: () => {
                        current.setY(height - (odd ? 275 : 75));
                        odd = !odd;
                    },
                    callbackScope: this,
                    delay: 1000,
                    loop: true,
                });
                obstacleX += x;
            }
        }

        // finish ==============================================================

        const start = this.physics.add
            .sprite(200, height - 200, 'finish')
            .setCollideWorldBounds(true)
            .setDepth(20);
        this.physics.add.collider(start, ground);
        this.physics.add.collider(start, this.player, () => {
            this.update_reset();
        });

        this.time.addEvent({
            callback: () => {
                start.setVelocityX(this.currentSpeed + 3);
            },
            callbackScope: this,
            delay: 10,
            loop: true,
        });

        // finish ==============================================================

        const finish = this.physics.add.staticSprite(
            obstacleX + 1600,
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
                if (this.currentSpeed > 0 || this.allTime > 1) {
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
        const keyboard = (button) => keyboard_press(this.keyboard, button);
        const gamepad = (button) => gamepad_press(this.gamepad, button);

        // if ((keyboard('d') || gamepad('right')) && this.player.body.onFloor()) {
        if (keyboard('d') || gamepad('right') || gamepad('axis1x') > 0) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += 2;
            }
        }

        // if (!keyboard('d') && !gamepad('right') && this.player.body.onFloor()) {
        if (!keyboard('d') && !gamepad('right') && gamepad('axis1x') === 0) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 1;
            } else {
                this.currentSpeed = 0;
            }
        }

        //if ((keyboard('a') || gamepad('left')) && this.player.body.onFloor()) {
        if (keyboard('a') || gamepad('left') || gamepad('axis1x') < 0) {
            if (this.currentSpeed !== 0) {
                this.currentSpeed -= 4;
                if (this.currentSpeed < 0) {
                    this.currentSpeed = 0;
                }
            }
        }

        if (keyboard('w') || gamepad('a')) {
            if (!this.jumping && this.player.body.onFloor()) {
                this.jumping = true;
                this.player.body.setVelocityY(
                    this.currentSpeed > 300 ? -528 : -428
                );
            }
        }

        if (!keyboard('w') && !gamepad('a')) {
            if (this.jumping && this.player.body.onFloor()) {
                this.jumping = false;
            }
        }

        if (keyboard('s') || gamepad('down') || gamepad('axis1y') > 0.4) {
            this.player.body
                .setSize(50, 70, false)
                .setOffset(this.player.frame.x, this.player.frame.y + 30);
            this.player.play('down');
        }

        if (!keyboard('s') && !gamepad('down') && gamepad('axis1y') < 0.4) {
            this.player.body
                .setSize(50, 100, false)
                .setOffset(this.player.frame.x, this.player.frame.y);
            this.player.play('up');
        }

        this.player.setVelocityX(this.currentSpeed);

        if (keyboard('enter') || gamepad('y')) {
            this.update_reset();
        }

        if (keyboard('esc') || gamepad('start')) {
            score = null;
            this.update_reset();
            this.scene.start('Menu');
        }
    }

    update_reset() {
        this.currentSpeed = 0;
        this.player.setVelocityX(0);
        this.allTime = 0;
        this.scene.restart();
    }
}

// config ======================================================================

const config = {
    backgroundColor: '0xdcdcdc',
    fps: {
        target: 60,
        forceSetTimeOut: true,
    },
    width: window.innerWidth,
    height: window.innerHeight,
    input: {
        gamepad: true,
    },
    zoom: window.devicePixelRatio,
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
    scene: [Preload, Menu, Game],
    type: Phaser.CANVAS,
};

const game = new Phaser.Game(config);

/*
import Phaser from 'phaser';

- salvar ranking passado do desafiador junto do share mas encryptado
- base64 no cenario e ranking vencedor?
- criar ferramenta de compartilhamento
- aprender adicionar sons
- colocar cenário de fundo e de frente alem do ceu
*/
