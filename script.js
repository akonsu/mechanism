/* -*- mode:javascript; coding:utf-8; -*- Time-stamp: <script.js - root> */

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

function add_mod(value, delta, count) {
    var n = (value + delta) % count;
    return n < 0 ? count + n : n;
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
    var frames = [];
    var rotating = false;
    var rotating_prev;
    var rotimation;
    var x_orig;

    var loadOrder = [
        "shoeImages/A.png",
        "shoeImages/I.png",
        "shoeImages/E.png",
        "shoeImages/M.png",
        "shoeImages/C.png",
        "shoeImages/K.png",
        "shoeImages/G.png",
        "shoeImages/O.png",
        "shoeImages/F.png",
        "shoeImages/N.png",
        "shoeImages/B.png",
        "shoeImages/J.png",
        "shoeImages/P.png",
        "shoeImages/H.png",
        "shoeImages/D.png",
        "shoeImages/L.png"
    ];

    function animate(prev_time) {
        var UPDATE_INTERVAL = 1000 / 2;
        var time = +new Date(); // same as new Date().getTime()

        if (time > prev_time + UPDATE_INTERVAL) {
            frame_num = add_mod(frame_num, forwards ? 1 : -1, frames.length);
            rotimation.src = frames[frame_num];
            prev_time = time;
        }
        if (rotating) {
            window.requestAnimationFrame(delay(animate, prev_time));
        }
    }

    function load_frame(index) {
        if (index < loadOrder.length) {
            var image = new Image();
            var ul = document.getElementById("downloadIndicator");

            image.onload = function (e) {
                var path = e.target.src;

                // BEGIN--REMOVE FROM PRODUCTION CODE
                var li = document.createElement("li");
                li.innerHTML = path.replace(/^https?:\/\/(?:[^\/]+\/)*/, "").replace(/\..*$/, "");
                ul.appendChild(li);
                // END--REMOVE FROM PRODUCTION CODE

                // insert path in order
                for (var i = 0, count = frames.length; i < count && frames[i] < path; i++);
                frames.splice(i, 0, path);

                // make sure the current frame stays intact
                if (i <= frame_num) {
                    frame_num++;
                }
                if (!rotimation.src) {
                    rotimation.src = path;
                }

                // load next frame
                load_frame(index + 1);
            };
            image.src = loadOrder[index];
        }
    }

    window.onload = function () {
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
            if (dragging && frames.length > 0) {
                var PIXELS_PER_FRAME = 10;
                var d = Math.floor((e.screenX - x_orig) / PIXELS_PER_FRAME);

                frame_num = add_mod(frame_orig, d, frames.length);
                rotimation.src = frames[frame_num];

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

        load_frame(0);
    };
})(window);
