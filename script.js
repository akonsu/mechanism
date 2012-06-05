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

function delay(f) {
    var _arguments = Array.prototype.slice.call(arguments, 1);
    return function () { f.apply(window, _arguments) };
}

(function (window) {
    var dragging = false;
    var forwards = false;
    var frame_num = 0;
    var frame_orig;
    var rotating = false;
    var rotating_prev;
    var rotimation;
    var x_orig;

    var adImages = new Array("shoeImages/A.png","shoeImages/B.png","shoeImages/C.png","shoeImages/D.png","shoeImages/E.png","shoeImages/F.png","shoeImages/G.png","shoeImages/H.png","shoeImages/I.png","shoeImages/J.png","shoeImages/K.png","shoeImages/L.png","shoeImages/M.png","shoeImages/N.png","shoeImages/O.png","shoeImages/P.png");

    function animate(prev_time) {
        var UPDATE_INTERVAL = 1000 / 2;
        var time = +new Date(); // same as new Date().getTime()

        if (time > prev_time + UPDATE_INTERVAL) {
            frame_num = forwards
                ? (frame_num + 1) % adImages.length
                : (frame_num || adImages.length) - 1;
            rotimation.src = adImages[frame_num];
            prev_time = time;
        }
        if (rotating) {
            window.requestAnimationFrame(delay(animate, prev_time));
        }
    }

    window.onload = function () {
        var f =  function (b) {
            if (!rotating) {
                rotating = true;
                animate(+new Date());
            }
            forwards = b;
        };

        document.getElementById("rotate-back").onclick = delay(f, false);
        document.getElementById("rotate-for").onclick = delay(f, true);
        document.getElementById("rotate-stop").onclick = function () { rotating = false };

        rotimation = document.getElementById("rotimation");

        rotimation.onmousedown = function (e) {
            if (!dragging) {
                dragging = true;
                frame_orig = frame_num;
                x_orig = e.screenX;
                rotating_prev = rotating;
                rotating = false;
                return false;
            }
        };

        document.onmousemove = function (e) {
            if (dragging) {
                var PIXELS_PER_FRAME = 10;
                var d = Math.floor((e.screenX - x_orig) / PIXELS_PER_FRAME);

                if (d > 0) {
                    frame_num = (frame_orig + d) % adImages.length;
                    rotimation.src = adImages[frame_num];
                }
                return false;
            }
        };

        document.onmouseup = function (e) {
            if (dragging) {
                dragging = false;
                rotating = rotating_prev;

                if (rotating) {
                    animate(+new Date());
                }
                return false;
            }
        };

        rotimation.src = adImages[frame_num];
    };
})(window);
