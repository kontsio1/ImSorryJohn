const createCharacterAnims = (anims) => {
    const createIfMissing = (config) => {
        if (!anims.exists(config.key)) {
            anims.create(config)
        }
    }

    //john
    createIfMissing({
        key: 'john-walk-down',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_down', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
    createIfMissing({
        key: 'john-walk-up',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_up', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
    createIfMissing({
        key: 'john-walk-east',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_east', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })
    createIfMissing({
        key: 'john-walk-west',
        frames: anims.generateFrameNames('john', { start:1, end:8, prefix: 'walk_west', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })

    createIfMissing({
        key: 'john-idle',
        frames: anims.generateFrameNames('john', { start:1, end:2, prefix: 'idle', suffix:'.png'}),
        frameRate: 3,
        repeat: -1
    })
    createIfMissing({
        key: 'john-tp-out',
        frames: anims.generateFrameNames('john', { start:1, end:16, prefix: 'teleport', suffix:'.png'}),
        frameRate: 20,
        repeat: 0
    })
    createIfMissing({
        key: 'john-tp-in',
        frames: anims.generateFrameNames('john', { start:17, end:31, prefix: 'teleport', suffix:'.png'}),
        frameRate: 20,
        repeat: 0
    })

    //slimeball
    createIfMissing({
        key: 'sb-idle',
        frames: anims.generateFrameNames('slimeball', { start:1, end:4, prefix:'idle', suffix:'.png'}),
        frameRate: 5,
        repeat: -1  
    })
    createIfMissing({
        key: 'sb-short-jump-right',
        frames: anims.generateFrameNames('slimeball', { start:1, end:6, prefix:'shortJumpRight', suffix:'.png'}),
        frameRate: 15,
        repeat: -1
    })

    //heart
    createIfMissing({
        key: 'heart-full-idle',
        frames: anims.generateFrameNames('heart_full', {start:1, end:2, prefix:'myHeart',suffix:'.png'}),
        frameRate: 3,
        repeat: -1
    })
    createIfMissing({
        key: 'heart-half-idle',
        frames: anims.generateFrameNames('heart_half', {start:1, end:2, prefix:'myHeart',suffix:'.png'}),
        frameRate: 3,
        repeat: -1
    })
    createIfMissing({
        key: 'heart-empty-idle',
        frames: anims.generateFrameNames('heart_empty', {start:1, end:2, prefix:'myHeart',suffix:'.png'}),
        frameRate: 3,
        repeat: -1
    })
    createIfMissing({
        key: 'fireball-travelling',
        frames: anims.generateFrameNames('fireball', {start:1, end:3, prefix:'fireball',suffix:'.png'}),
        frameRate: 8,
        repeat: -1
    })
}

export {createCharacterAnims}