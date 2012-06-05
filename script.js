//
// fix window.requestAnimationFrame
//
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (window.webkitRequestAnimationFrame
                                    || window.mozRequestAnimationFrame
                                    || window.oRequestAnimationFrame
                                    || window.msRequestAnimationFrame
                                    || function (callback) { window.setTimeout(callback, 1000 / 60) });
}

(function (window) {
    var frame = 0;
    var forwards = false;
    var rotate = false;
    var rotimation;

    function delay(f) {
        var _arguments = Array.prototype.slice.call(arguments, 1);
        return function () { f.apply(window, _arguments) };
    }

    window.onload = function () {
        document.getElementById("rotate").onclick = rotateFor;
        document.getElementById("rotateBack").onclick = rotateBack;
        document.getElementById("rotateStop").onclick = function () { rotate = false };
        rotimation = document.getElementById("rotimation");
    };

    var adImages = new Array("shoeImages/A.png","shoeImages/B.png","shoeImages/C.png","shoeImages/D.png","shoeImages/E.png","shoeImages/F.png","shoeImages/G.png","shoeImages/H.png","shoeImages/I.png","shoeImages/J.png","shoeImages/K.png","shoeImages/L.png","shoeImages/M.png","shoeImages/N.png","shoeImages/O.png","shoeImages/P.png");

    function animate(prev_time) {
        var UPDATE_INTERVAL = 1000 / 2;
        var time = +new Date(); // same as new Date().getTime()

        if (time > prev_time + UPDATE_INTERVAL) {
            frame = forwards
                ? (frame + 1) % adImages.length
                : (frame || adImages.length) - 1;
            rotimation.src = adImages[frame];
            prev_time = time;
        }
        if (rotate) {
            window.requestAnimationFrame(delay(animate, prev_time));
        }
    }

    function rotateFor() {
        if (!rotate) {
            rotate = true;
            animate(+new Date());
        }
        forwards = true;
    }

    function rotateBack() {
        if (!rotate) {
            rotate = true;
            animate(+new Date());
        }
        forwards = false;
    }
})(window);
