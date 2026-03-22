// priority: 0

const DIALOG_STAGES_TAG = "dialogStages"
const SKIN_TO_NPC_ID = {
    "G_cat101": "gcat",
    "stillweighting": "frog"
}

const RANGE_TO_RAISE_FROG = 5
const MAX_FROG_SIZE = 1

let frogSize
let frogEntity

ItemEvents.entityInteracted(event => {
    let { target, player, server } = event
    let dialogStages = server.persistentData.getCompound("dialogStages")
    if (player.shiftKeyDown || target.type != "easy_npc:humanoid") return

    let npc = SKIN_TO_NPC_ID[target.nbt.getCompound("SkinData").getString("Name")]
    let stage = dialogStages.getInt(npc)

    server.runCommandSilent(`execute in ${player.level.dimension.toString()} run dialog ${target.stringUuid} show ${player.name.string} ${npc}_${stage}`)
    if (stage == 1) server.scheduleInTicks(10, () => dialogStages.putInt(npc, 2))
})
ServerEvents.tick(event => {
    let pData = event.server.persistentData
    if (pData.contains(DIALOG_STAGES_TAG)) return

    let data = {}
    Object.keys(SKIN_TO_NPC_ID).forEach(npc => data[SKIN_TO_NPC_ID[npc]] = 0)
    pData.put(DIALOG_STAGES_TAG, data)
})

PlayerEvents.tick(event => {
    let { server, level, player } = event
    let dim = level.dimension.toString()
    if (server.persistentData.contains("frogRisen") && server.persistentData.getBoolean("frogRisen")) return

    if (frogSize != null) {
        frogSize.update()
        let size = frogSize.get()

        server.runCommandSilent(`execute in ${dim} run data merge entity ${frogEntity.stringUuid} {ModelData:{Scale: {Root: [${size}f, ${size}f, ${size}f]}}}`)
        frogEntity.refreshDimensions()

        if (size == MAX_FROG_SIZE) {
            server.persistentData.putBoolean("frogRisen", true)
            server.playerList.players
                .filter(p => p.distanceToEntity(frogEntity) <= RANGE_TO_RAISE_FROG)
                .forEach(p => server.runCommandSilent(`execute in ${dim} run dialog ${frogEntity.stringUuid} show ${p.name.string} frog_welcome`))

            frogSize = null
            frogEntity = null
        }

        return
    }

    let matchingEntities = level.getEntitiesWithin(AABB.of(
        player.x - RANGE_TO_RAISE_FROG,
        player.y - RANGE_TO_RAISE_FROG,
        player.z - RANGE_TO_RAISE_FROG,
        player.x + RANGE_TO_RAISE_FROG,
        player.y + RANGE_TO_RAISE_FROG,
        player.z + RANGE_TO_RAISE_FROG
    )).filter(e => e.type == "easy_npc:humanoid" && e.nbt.getCompound("SkinData").getString("Name") == "stillweighting")
    if (!matchingEntities.size()) return

    frogEntity = matchingEntities.get(0)
    frogSize = new global.tweened(0, {duration: 20, easing: global.easings.expoInOut})
    frogSize.set(MAX_FROG_SIZE)
})