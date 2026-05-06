// priority: 0

PlayerEvents.tick(event => {
    let { player, server } = event

    let pData = server.persistentData
    if (!pData.contains("attributes")) pData.put("attributes", {})

    let attrs = pData.getCompound("attributes")
    attrs.allKeys.forEach(attr => {
        player.getAttribute(attr).baseValue = attrs.getInt(attr)
    })
})