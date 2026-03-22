// priority: 0

BlockEvents.broken("gambleth:unique_room_signifier", event => {
    let sigData = event.server.persistentData.getCompound("roomSignifiers")
    let sigId = event.block.entity.serializeNBT().getCompound("data").getString("signifierId")

    sigData.remove(sigId)
})