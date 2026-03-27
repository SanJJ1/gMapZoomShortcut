console.log('gMapZoomShortcut loaded v12 (MAIN world)');

const ZOOM_KEYS = ['=', '-', '+', '_', 'i', 'o'];
const PAN_KEYS = ['h', 'j', 'k', 'l'];
const ALL_KEYS = [...ZOOM_KEYS, ...PAN_KEYS];
const PAN_STEP_MIN = 6;
const PAN_STEP_MAX = 50;
const RAMP_FRAMES = 20;
const POINTER_ID = 10088;

// Patch pointer capture so Maps doesn't hijack our synthetic drags
const origSetPC = Element.prototype.setPointerCapture;
Element.prototype.setPointerCapture = function (id) {
    if (id === POINTER_ID) return;
    return origSetPC.call(this, id);
};
const origReleasePC = Element.prototype.releasePointerCapture;
Element.prototype.releasePointerCapture = function (id) {
    if (id === POINTER_ID) return;
    return origReleasePC.call(this, id);
};

function getMapCanvas() {
    return document.querySelector('canvas');
}

// Track ongoing drag state
let dragging = false;
let dragTarget = null;
let curX = 0;
let curY = 0;
let activeKeys = new Set();
let animFrameId = null;
let frameCount = 0;

function dispatchPair(target, mouseType, pointerType, opts) {
    target.dispatchEvent(new MouseEvent(mouseType, opts));
    target.dispatchEvent(new PointerEvent(pointerType, { pointerId: POINTER_ID, isPrimary: true, ...opts }));
}

function startDrag() {
    dragTarget = getMapCanvas();
    if (!dragTarget) return;

    const rect = dragTarget.getBoundingClientRect();
    curX = rect.left + rect.width / 2;
    curY = rect.top + rect.height / 2;
    dragging = true;
    frameCount = 0;

    dispatchPair(dragTarget, 'mousedown', 'pointerdown', {
        bubbles: true, cancelable: true, view: window,
        detail: 1, clientX: curX, clientY: curY, button: 0, buttons: 1
    });

    animLoop();
}

function animLoop() {
    if (!dragging || activeKeys.size === 0) return;

    frameCount++;
    const t = Math.min(frameCount / RAMP_FRAMES, 1);
    const step = PAN_STEP_MIN + (PAN_STEP_MAX - PAN_STEP_MIN) * t;

    let dx = 0, dy = 0;
    if (activeKeys.has('h')) dx += step;
    if (activeKeys.has('l')) dx -= step;
    if (activeKeys.has('k')) dy += step;
    if (activeKeys.has('j')) dy -= step;

    curX += dx;
    curY += dy;

    dispatchPair(dragTarget, 'mousemove', 'pointermove', {
        bubbles: true, cancelable: false, view: window,
        detail: 88, clientX: curX, clientY: curY, button: 0, buttons: 1
    });

    animFrameId = requestAnimationFrame(animLoop);
}

function endDrag() {
    if (!dragging || !dragTarget) return;
    cancelAnimationFrame(animFrameId);

    // Send a final move + up at the same position = zero velocity = no momentum
    dispatchPair(dragTarget, 'mousemove', 'pointermove', {
        bubbles: true, cancelable: false, view: window,
        detail: 88, clientX: curX, clientY: curY, button: 0, buttons: 1
    });
    dispatchPair(dragTarget, 'mouseup', 'pointerup', {
        bubbles: true, cancelable: true, view: window,
        detail: 1, clientX: curX, clientY: curY, button: 0, buttons: 0
    });

    dragging = false;
    dragTarget = null;
}

function isTextInput(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
    if (el.isContentEditable) return true;
    return false;
}

function blockKey(event) {
    if (isTextInput(document.activeElement)) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (ALL_KEYS.includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}

document.addEventListener('keypress', blockKey, true);
document.addEventListener('keyup', function (event) {
    if (isTextInput(document.activeElement)) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (ALL_KEYS.includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    if (PAN_KEYS.includes(event.key)) {
        activeKeys.delete(event.key);
        if (activeKeys.size === 0) endDrag();
    }
}, true);

document.addEventListener('keydown', function (event) {
    if (isTextInput(document.activeElement)) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    if (ZOOM_KEYS.includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const zoomInButton = document.querySelector('#widget-zoom-in')
            || document.querySelector('button[aria-label="Zoom in"]');
        const zoomOutButton = document.querySelector('#widget-zoom-out')
            || document.querySelector('button[aria-label="Zoom out"]');

        if (event.key === '=' || event.key === '+' || event.key === 'i') {
            if (zoomInButton) zoomInButton.click();
        } else {
            if (zoomOutButton) zoomOutButton.click();
        }
    }

    if (PAN_KEYS.includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();

        activeKeys.add(event.key);
        if (!dragging) startDrag();
    }
}, true);
