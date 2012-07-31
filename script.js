/* -*- mode:javascript; coding:utf-8; -*- Time-stamp: <script.js - root> */

function add_mod(value, delta, count) {
    var n = (value + delta) % count;
    return n < 0 ? count + n : n;
}

(function (window) {
    var click;
    var container;
    var dragging = false;
    var dx;
    var dy;
    var frame_num = 0;
    var frames = [];
    var x_prev;

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

    function load_frame(index) {
        if (index < loadOrder.length) {
            var image = new Image();

            image.onload = function () {
                var count = frames.length;
                var path = this.src;

                // BEGIN--REMOVE FROM PRODUCTION CODE
                var ul = document.getElementById("downloadIndicator");
                var li = document.createElement("li");
                li.innerHTML = path.replace(/^https?:\/\/(?:[^\/]+\/)*/, "").replace(/\..*$/, "");
                ul.appendChild(li);
                // END--REMOVE FROM PRODUCTION CODE

                // insert path in order
                for (var i = 0; i < count && frames[i].src < path; i++);
                frames.splice(i, 0, this);

                // make sure the current frame stays intact
                if (i <= frame_num && frame_num < count) {
                    frame_num++;
                }

                // insert element
                this.style.display = this === frames[frame_num] ? "" : "none";
                container.appendChild(this);

                // load next frame
                load_frame(index + 1);
            };
            image.src = loadOrder[index];
        }
    }

    function rotate_onmousedown(e) {
        if (!dragging) {
            var v = e || window.event;

            click = true;
            dragging = true;
            x_prev = v.screenX;

            return false;
        }
    }

    function rotate_onmousemove(e) {
        if (dragging && frames.length > 0) {
            var v = e || window.event;
            var d = v.screenX - x_prev;

            if (Math.abs(d) > 0) {
                frames[frame_num].style.display = "none";
                frame_num = add_mod(frame_num, d ? d > 0 ? 1 : -1 : 0, frames.length);
                frames[frame_num].style.display = "";
                x_prev = v.screenX;
            }
            click = false;
            return false;
        }
    }

    function rotate_onmouseup() {
        if (dragging) {
            if (click) {
                var frame = frames[frame_num];

                container.left_orig = frame.style.left;
                container.top_orig = frame.style.top;
                container.width_orig = frame.style.width;

                frame.style.width = "auto";
                frame.style.height = "auto";

                container.onmousedown = zoom_onmousedown;
                document.onmousemove = zoom_onmousemove;
                document.onmouseup = zoom_onmouseup;
            }
            dragging = false;
            return false;
        }
    }

    function zoom_onmousedown(e) {
        if (!dragging) {
            var v = e || window.event;
            var frame = frames[frame_num];

            click = true;
            dragging = true;

            dx = parseInt(frame.style.left + 0) - v.clientX;
            dy = parseInt(frame.style.top + 0) - v.clientY;

            return false;
        }
    }

    function zoom_onmousemove(e) {
        if (dragging) {
            var v = e || window.event;
            var frame = frames[frame_num];

            var r0 = container.getBoundingClientRect();
            var r1 = frame.getBoundingClientRect();

            var W = r0.right - r0.left;
            var H = r0.bottom - r0.top;
            var w = r1.right - r1.left;
            var h = r1.bottom - r1.top;

            var x = Math.min(0, Math.max(W - w, dx + v.clientX));
            var y = Math.min(0, Math.max(H - h, dy + v.clientY));

            frame.style.left = x + "px";
            frame.style.top = y + "px";

            click = false;
            return false;
        }
    }

    function zoom_onmouseup() {
        if (dragging) {
            if (click) {
                var frame = frames[frame_num];

                frame.style.left = container.left_orig;
                frame.style.top = container.top_orig;
                frame.style.width = container.width_orig;

                container.onmousedown = rotate_onmousedown;
                document.onmousemove = rotate_onmousemove;
                document.onmouseup = rotate_onmouseup;
            }
            dragging = false;
            return false;
        }
    }

    window.onload = function () {
        container = document.getElementById("container");
        container.onmousedown = rotate_onmousedown;
        document.onmousemove = rotate_onmousemove;
        document.onmouseup = rotate_onmouseup;

        // remove existing elements
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }
        load_frame(0);
    };
})(window);
