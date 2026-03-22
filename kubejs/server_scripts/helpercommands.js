// priority: 0

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Argument } = event

    event.register(Commands.literal("gambleth")
        .requires(s => s.hasPermission(2))
        .then(Commands.literal("start_run").executes(() => {
            Utils.server.playerList.players.forEach(p => {
                Utils.server.runCommandSilent(`clear ${p.name.string}`)
                p.foodData.setFoodLevel(20)
                p.health = p.maxHealth
            })

            global.startRun()
            return 1
        }))
        .then(Commands.literal("next_floor").executes(() => {
            if (!Utils.server.persistentData.contains("currentRunID")) return

            global.tpPlayersToNextFloorAndPregen()
            return 1
        }))
        .then(Commands.literal("show_fake_chip_toast")
            .then(Commands.argument("player", Argument.PLAYER.create(event)).executes(ctx => {
                let fakeChipToast = new Notification()
                fakeChipToast.text = Text.string("Chip Count:\n").bold().append(Text.yellow("0").bold(false))
                fakeChipToast.itemIcon = Item.of("gambleth:poker_chip_stacked")
                fakeChipToast.backgroundColor = Color.BLACK
                fakeChipToast.borderColor = Color.GRAY

                Argument.PLAYER.getResult(ctx, "player").notify(fakeChipToast)
                return 1
            }))
        )
    )

    event.register(Commands.literal("fold")
        .executes(ctx => Utils.server.runCommandSilent(`kill ${ctx.source.player.name.string}`))
    )
})