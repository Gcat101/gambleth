// priority: 0

const CHIP_ITEM_TAG = "gambleth:poker_chip"
const CHIP_COUNT_DATA_KEY = "chipCount"

ServerEvents.tick(event => {
    let pData = event.server.persistentData
    if (!pData.contains(CHIP_COUNT_DATA_KEY)) pData.putInt(CHIP_COUNT_DATA_KEY, 0)
})

ItemEvents.pickedUp(event => {
    let { item, player, server } = event
    let pData = server.persistentData
    if (!item.hasTag(CHIP_ITEM_TAG)) return

    let chipCount = pData.getInt(CHIP_COUNT_DATA_KEY) + item.count
    pData.putInt(CHIP_COUNT_DATA_KEY, chipCount)
    player.inventory.clear(item)

    global.showChipCountToast(server)

    // DEBUG
    // player.tell(Component.string("Chip Count: ").bold().append(Component.yellow(chipCount)))
})