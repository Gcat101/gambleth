// priority: 0

StartupEvents.registry("item", event => {
    global.chipColors.forEach(c => {
        event.create("gambleth:poker_chip_" + c)
            .texture("gambleth:item/poker_chip_" + c)
            .displayName(Component.string("Poker Chip"))
            .tag("gambleth:poker_chip")
    })
    event.create("gambleth:poker_chip_stacked")
        .texture("gambleth:item/poker_chip_stacked")
})