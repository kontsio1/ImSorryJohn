export function johnTakeDmg(scene, dmg, dir) {
    const HITSTUN_MS = 100
    const POST_HIT_INVULN_MS = 350

    const john = scene?.john
    const heartsArr = scene?.hud?.list ?? []

    if (!john || john.isDead || john.activeHp <= 0 || john.isInvulnerable) {
        return false
    }

    john.isIdle = false
    john.setVelocity(dir.x, dir.y)
    john.setTint(0xff0000)

    // Give John a short invulnerability window so collider overlap does not repeatedly re-apply knockback.
    if (typeof john.startInvulnerability === 'function') {
        john.startInvulnerability(POST_HIT_INVULN_MS)
    } else {
        john.isInvulnerable = true
        scene.time.delayedCall(POST_HIT_INVULN_MS, () => {
            john.isInvulnerable = false
        })
    }

    scene.time.addEvent({
        delay: HITSTUN_MS,
        callback: () => {
            if (!john.isDead) {
                john.isIdle = true
                john.setVelocity(0, 0)
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