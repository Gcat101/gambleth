// priority: 5000

/**
 * @callback EasingFunction
 * @param {number} x
 * @returns {number}
 */
/**
 * @callback EasingFunctionConstructor
 * @param {number} arg 
 * @returns {EasingFunction}
 */

const _bounceConst = 1.70158
const _bounceInOutConst = _bounceConst * 1.525
const _elasticConst = (2 * JavaMath.PI) / 3
const _elasticInOutConst = (2 * JavaMath.PI) / 4.5

/** @type {EasingFunctionConstructor} */
let step = arg => x => Math.floor(arg * x) / arg

/** @type {EasingFunctionConstructor} */
let polyIn = arg => x => Math.pow(x, arg)
/** @type {EasingFunctionConstructor} */
let polyOut = arg => x => 1 - (Math.pow(1 - x, arg))
/** @type {EasingFunctionConstructor} */
let polyInOut = arg => x => (
    x < .5 ? Math.pow(2, arg - 1) * Math.pow(x, arg) : 1 - (Math.pow((-2 * x) + 2, arg) / 2)
)

/**
 * Dear fucking god...
 * Thanks {@link https://easings.net/en#easeOutBounce Easings} for the implementation
 * 
 * @type {EasingFunction}
 */
let bounce = x => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

/**
 * @type {Object.<string, (EasingFunction|EasingFunctionConstructor)>}
 */
const _easings = {
    linear: x => x,

    step: step,
    steps: step,

    sineIn: x => 1 - Math.cos((JavaMath.PI / 2) * x),
    sineOut: x => Math.sin((JavaMath.PI / 2) * x),
    sineInOut: x => -(Math.cos(JavaMath.PI * x) - 1) / 2,

    polyIn: polyIn,
    polyOut: polyOut,
    polyInOut: polyInOut,

    quadIn: polyIn(2),
    quadOut: polyOut(2),
    quadInOut: polyInOut(2),
    cubicIn: polyIn(3),
    cubicOut: polyOut(3),
    cubicInOut: polyInOut(3),
    quartIn: polyIn(4),
    quartOut: polyOut(4),
    quartInOut: polyInOut(4),
    quintIn: polyIn(5),
    quintOut: polyOut(5),
    quintInOut: polyInOut(5),

    expoIn: x => x == 0 ? 0 : Math.pow(JavaMath.E, (10 * x) - 10),
    expoOut: x => x == 1 ? 1 : 1 - Math.pow(JavaMath.E, -10 * x),
    expoInOut: x => (
        x == 0 ? 0 : 
        x == 1 ? 1 :
        x < .5 ? Math.pow(JavaMath.E, 20 * x - 10) / 2 :
        (2 - Math.pow(JavaMath.E, -20 * x + 10)) / 2
    ),

    circIn: x => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    circOut: x => Math.sqrt(1 - Math.pow(x - 1, 2)),
    circInOut: x => (
        x < 0.5 ?
        (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 :
        (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
    ),

    backIn: x => ((_bounceConst + 1) * Math.pow(x, 3)) - (_bounceConst * Math.pow(x, 2)),
    backOut: x => 1 + ((_bounceConst + 1) * Math.pow(x - 1, 3)) + (_bounceConst * Math.pow(x - 1, 2)),
    backInOut: x => (
        x < 0.5 ?
        (Math.pow(2 * x, 2) * ((_bounceInOutConst + 1) * 2 * x - _bounceInOutConst)) / 2 :
        (Math.pow(2 * x - 2, 2) * ((_bounceInOutConst + 1) * (x * 2 - 2) + _bounceInOutConst) + 2) / 2
    ),

    elasticIn: x => (
        x == 0 ? 0 :
        x == 1 ? 1 :
        -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * _elasticConst)
    ),
    elasticOut: x => (
        x == 0 ? 0 :
        x == 1 ? 1 :
        Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * _elasticConst) + 1
    ),
    elasticInOut: x => (
        x == 0 ? 0 :
        x == 1 ? 1 :
        x < .5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * _elasticInOutConst)) / 2 :
        (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * _elasticInOutConst)) / 2 + 1
    ),

    bounceIn: x => 1 - bounce(1 - x),
    bounceOut: bounce,
    bounceInOut: x => (
        x < 0.5 ?
        (1 - bounce(1 - 2 * x)) / 2 :
        (1 + bounce(2 * x - 1)) / 2
    )
}
global.easings = _easings