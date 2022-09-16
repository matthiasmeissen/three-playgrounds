export const cp = {
    w: 400,
    h: 400,
    s: 0.2,
}

export const ctx = document.createElement('canvas').getContext('2d')
ctx.canvas.width = cp.w
ctx.canvas.height = cp.h

export const drawCanvas = function (time) {
    ctx.fillStyle = 'hsl(0, 0%, 10%)'
    ctx.fillRect(0, 0, cp.w, cp.h)

    const gradient = ctx.createLinearGradient(Math.abs(Math.sin(time * 0.2)) * cp.w, 0, cp.w, Math.abs(Math.sin(time * 0.4)) * cp.h)

    gradient.addColorStop(0, 'hsl(' + Math.abs(Math.sin(time * 0.28) * 360) + ', 100%, 50%)')
    gradient.addColorStop(0.5, 'hsl(' + Math.abs(Math.sin(time * 0.48) * 360) + ', 100%, 50%)')
    gradient.addColorStop(1, 'hsl(' + Math.abs(Math.sin(time * 0.14) * 360) + ', 100%, 50%)')

    ctx.fillStyle = gradient
    ctx.fillRect(cp.w * (cp.s * 0.5), cp.h * (cp.s * 0.5), cp.w - (cp.w * cp.s), cp.h - (cp.h * cp.s))
}
