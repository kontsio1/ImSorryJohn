import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import { MainMenu } from './Scenes/MainMenu'
import { Level1 } from './Scenes/Level1Stable'
import { WaveCompleteScene } from './Scenes/WaveCompleteScene'
import { StatisticsScene } from './Scenes/StatisticsScene'

export const GameHolder = () => {
    const gameRef = useRef(null)

    useEffect(() => {
        if (gameRef.current) {
            return undefined
        }

        const config = {
            type: Phaser.AUTO,
            title: "I'm sorry John",
            parent: 'game-container',
            width: window.innerWidth,
            height: window.innerHeight,
            pixelArt: true,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false,
                },
            },
            scene: [new MainMenu(), new Level1(), new WaveCompleteScene(), new StatisticsScene()],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                zoom: 1,
            },
        }

        gameRef.current = new Phaser.Game(config)

        return () => {
            gameRef.current?.destroy(true)
            gameRef.current = null
        }
    }, [])

    return <div id='game-container' />
}
