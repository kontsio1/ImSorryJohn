import Phaser from 'phaser';
import { useEffect, useRef } from 'react'
import { MainMenu } from './Scenes/MainMenu';
import { Level1 } from './Scenes/Level1';

export const GameHolder = () => {
    const gameRef = useRef(null)

    useEffect(()=>{
        if (gameRef.current) {
            return undefined
        }

        const goMainMenu = new MainMenu()
        const goLevel1 = new Level1()

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
            scene: [goMainMenu, goLevel1],
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