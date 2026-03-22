// priority: 0

PlayerEvents.tick(event => {
    let { player } = event
    let dim = player.level.dimension.toString()

    if (player.spectator && dim.startsWith("gambleth:floor_")) {
        if (player.y > MAX_SPECTATOR_Y) player.teleportTo(player.x, MAX_SPECTATOR_Y, player.z)
        else if (player.y < MIN_SPECTATOR_Y) player.teleportTo(player.x, MIN_SPECTATOR_Y, player.z)
    }

    if (dim == "gambleth:cobblewall") player.foodData.setFoodLevel(20)
})