function barchart (y: number, v: number, vmax: number) {
    x = 0
    leds = 0
    v = Math.min(v, vmax)
    leds = Math.trunc(v * 5 / vmax)
    while (x <= leds) {
        led.plot(x, y)
        x += 1
    }
}
input.onButtonPressed(Button.A, function () {
    OVERRIDE = 0
})
input.onButtonPressed(Button.B, function () {
    OVERRIDE = 1
})
function trend (newval: number) {
    if (!(prevval == 0)) {
        olddiff = diffs.pop()
        newdiff = newval - prevval
        diffs.push(newdiff)
        sumd = sumd - olddiff + newdiff
        serial.writeLine(convertToText("" + prevval + " " + ("" + newval) + " " + ("" + newdiff) + " " + ("" + sumd)))
    }
    prevval = newval
    if (Math.abs(sumd) >= SIGNIFICANT) {
        return sumd
    } else {
        return 0
    }
}
let t = 0
let reading = 0
let sumd = 0
let newdiff = 0
let olddiff = 0
let prevval = 0
let OVERRIDE = 0
let v = 0
let leds = 0
let x = 0
let SIGNIFICANT = 0
let diffs: number[] = []
diffs = [0, 10]
SIGNIFICANT = 11
let P0_MAX = 812
let CHARGING = images.createImage(`
    . . # # .
    . # . . .
    . # . . .
    . . # # .
    . . . . .
    `)
let DISCHARGING = images.createImage(`
    . # # . .
    . # . # .
    . # . # .
    . # # . .
    . . . . .
    `)
let GRID = images.createImage(`
    . . # # .
    . # . . .
    . # . # .
    . . # # .
    . . . . .
    `)
let RENEWABLES = images.createImage(`
    . # # . .
    . # . # .
    . # # . .
    . # . # .
    . . . . .
    `)
let BLACK = images.createImage(`
    . . # . .
    . # # # .
    . . # . .
    . . # . .
    . . . . .
    `)
basic.forever(function () {
    reading = pins.analogReadPin(AnalogPin.P0)
    basic.clearScreen()
    t = trend(reading)
    if (t < 0) {
        DISCHARGING.showImage(0)
    }
    if (t > 0) {
        CHARGING.showImage(0)
    }
    if (pins.digitalReadPin(DigitalPin.P1) == 1) {
        GRID.showImage(0)
        if (OVERRIDE != 0) {
            pins.digitalWritePin(DigitalPin.P2, 1)
        } else {
            pins.digitalWritePin(DigitalPin.P2, 0)
        }
    } else {
        if (pins.digitalReadPin(DigitalPin.P1) == 0 && OVERRIDE == 0) {
            BLACK.showImage(0)
        } else {
            RENEWABLES.showImage(0)
        }
        if (reading <= 200 && OVERRIDE) {
            pins.digitalWritePin(DigitalPin.P2, 0)
            OVERRIDE = 0
        }
        if (reading >= 800 && OVERRIDE) {
            pins.digitalWritePin(DigitalPin.P2, 1)
        }
    }
    barchart(4, reading, P0_MAX)
    serial.writeLine(convertToText(pins.analogReadPin(AnalogPin.P0)))
    basic.pause(1000)
})
