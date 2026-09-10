import Phaser from 'phaser';
import { useEffect, useRef } from 'react'
import { MainMenu } from './Scenes/MainMenu';
import { Level1 } from './Scenes/Level1';
import { WaveCompleteScene } from './Scenes/WaveCompleteScene';
import { StatisticsScene } from './Scenes/StatisticsScene';

export const GameHolder = () => {
    const gameRef = useRef(null)

    useEffect(()=>{
        if (gameRef.current) {
            return undefined
        }

        const goMainMenu = new MainMenu()
        const goLevel1 = new Level1()
        const waveComplete = new WaveCompleteScene()
        const statistics = new StatisticsScene()

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
                    gravity: {y:0},
                    debug: false,
                    useTree: false,
                },
            },
            scene: [goMainMenu, goLevel1, waveComplete, statistics],
            scale: {
                zoom: 1
            }
        }

        gameRef.current = new Phaser.Game(config)

        return ()=>{
            gameRef.current?.destroy(true)
            gameRef.current = null
        }
    },[])
    //UseEffect-end

    return(
        <div id='game-container'>
            {/* Phaser renders here */}
        </div>
    )
}