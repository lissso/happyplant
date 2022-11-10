/////// mousedown: → start drawing
/////// mousemove: → if the mouseis down draw the line based
// on the position of the user's cursor. You will need to
// figure out where the user's cursor is within the canvas element.
// This will require some calculation, you will need to look at some
// property on the canvas and some property on the event object.
/////// mouseup: → finish drawing This will involve converting your canvas content
// into a DataURL - to get the image you have drawn on your canvas utilise canvas'
// toDataURL method - and setting that value to your hidden signature input tag.

(function () {
    console.log("☀︎ running ... ");

    const canvas = document.getElementById("board");
    const ctx = canvas.getContext("2d");
    let coordinates = { x: 0, y: 0 };

    canvas.addEventListener("mousedown", start);
    //canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseup", () => {
        canvas.removeEventListener("mousemove", draw);
        // to safe the picture
        let data = canvas.toDataURL();
        let signInput = document.getElementById("signature");
        console.log("sign Input: ", signInput);
        signInput.value = data;
        console.log(data);
    });

    // window.addEventListener("resize", resize);

    // function resize() {
    //     ctx.canvas.width = window.innerWidth;
    //     ctx.canvas.height = window.innerHeight;
    // }
    // resize();

    function start(e) {
        canvas.addEventListener("mousemove", draw);
        reposition(e);
    }

    function reposition(e) {
        coordinates.x = e.clientX - canvas.offsetLeft;
        coordinates.y = e.clientY - canvas.offsetTop;

        //offset border rectangle, margin checken
    }

    // function stop() {
    // canvas.removeEventListener("mousemove", draw);
    // }

    function draw(e) {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ACD3ED";
        ctx.moveTo(coordinates.x, coordinates.y);
        // console.log("coordinates", coordinates);
        reposition(e);
        ctx.lineTo(coordinates.x, coordinates.y);
        ctx.stroke();
    }
})();
