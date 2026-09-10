export function johnTakeDmg(scene, dmg, dir) {
    const john = scene?.john
    const heartsArr = scene?.hud?.list ?? []

    if (!john || john.isDead || john.activeHp <= 0 || john.isInvulnerable) {
        return false
    }

    john.isIdle = false
    john.setVelocity(dir.x, dir.y)
    john.setTint(0xff0000)

    scene.time.addEvent({
        delay: 100,
        callback: () => {
            if (!john.isDead) {
                john.isIdle = true
                john.clearTint()
            }
        }
    })

    const previousHp = john.activeHp
    const nextHp = Math.max(previousHp - dmg, 0)
    john.activeHp = nextHp

    for (let hp = previousHp - 1; hp >= nextHp; hp--) {
        heartsArr[hp]?.setTexture('heart_empty')
        heartsArr[hp]?.anims.stop()
    }

    return true
}