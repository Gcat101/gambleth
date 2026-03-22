// priority: 0

const ATTRIBUTES_TO_SAVE = [
    "tinyinv:slots"
]

PlayerEvents.tick(event => {
    let { player } = event

    let data = {}
    ATTRIBUTES_TO_SAVE.forEach(a => data[a] = player.getAttribute("tinyinv:slots").baseValue)
    player.persistentData.put("attributes", data)
})
PlayerEvents.respawned(event => {
    let { player } = event
    if (!player.persistentData.contains("attributes")) return

    let attrs = player.persistentData.getCompound("attributes")
    Object.keys(attrs).forEach(a => {
        player.getAttribute(a).baseValue = attrs[a]
    })
})