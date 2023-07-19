import Phaser from "phaser";

const createCharacterAnims = (anims) => {
    //john
    anims.create({
        key: 'john-walk-down',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_down', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
    anims.create({
        key: 'john-walk-up',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_up', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
    anims.create({
        key: 'john-walk-east',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_east', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
    anims.create({
        key: 'john-walk-west',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_west', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })

    anims.create({
        key: 'john-idle',
        frames: anims.generateFrameNames('john', { start:1, end:2, prefix: 'idle', suffix:'.png'}),
        frameRate: 3,
        repeat: -1
    })
    anims.create({
        key: 'john-tp-out',
        frames: anims.generateFrameNames('john', { start:1, end:16, prefix: 'teleport', suffix:'.png'}),
        frameRate: 20,
        repeat: 0
    })
    anims.create({
        key: 'john-tp-in',
        frames: anims.generateFrameNames('john', { start:17, end:31, prefix: 'teleport', suffix:'.png'}),
        frameRate: 20,
        repeat: 0
    })

    //slimeball
    anims.create({
        key: 'sb-idle',
        frames: anims.generateFrameNames('slimeball', { start:1, end:4, prefix:'idle', suffix:'.png'}),
        frameRate: 5,
        repeat: -1  
    })
    anims.create({
        key: 'sb-short-jump-right',
        frames: anims.generateFrameNames('slimeball', { start:1, end:6, prefix:'shortJumpRight', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
}

export {createCharacterAnims}