// priority: 0

const $VariableHandler = Java.loadClass("de.keksuccino.fancymenu.customization.variables.VariableHandler")

NetworkEvents.dataReceived("set_fm_variable", event => {
    let { data } = event
    $VariableHandler.setVariable(data.key, data.value)
})