alert("Studybuddy is taking notes now!");
class Rect {
  constructor(x, y, width, height, value = null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.value = value;
  }

  repr() {
    return `${this.value}${this.x}${this.y}`;
  }
}

class Canvas {
  constructor(canvas_id, onSelected) {
    this.canvas_id = canvas_id;
    this.selecting = false;
    this.start_coord = { x: 0, y: 0 };
    this.onSelected = onSelected;

    this.selectedRect = new Rect(0, 0, 0, 0);
    this.rects = [];
    this.renderedRects = [];
  }

  // getDimensions() {
  //   // let canvas = document.getElementById(this.canvas_id);
  //   return { width: canvas.offsetWidth, height: canvas.offsetHeight };
  // }

  showRects(rects) {
    this.clear();
    let video = document.querySelector("video");
    for (var i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (rect.value) {
        let text = document.createElement("div");
        text.style.position = "absolute";
        text.innerHTML = rect.value;
        text.style.left = rect.x + video.getBoundingClientRect().left + "px";
        text.style.top = rect.y + video.getBoundingClientRect().top + "px";
        text.style.textAlign = "center";
        text.style.color = "transparent";

        // text.style.backgroundColor = "rgba(0, 0, 255, 0.2)";

        text.style.setProperty("z-index", "2147483638", "important");
        text.style.userSelect = "text";
        text.style.fontSize = `${rect.height}px`;
        document.body.appendChild(text);
        // text.style.transform = `scale(${rect.width / text.offsetWidth}, 1)`;
        this.renderedRects.push(text);
      }
      //   ctx.fillStyle = "rgba(129, 207, 224, 0.4)";

      //   ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    this.rects = rects;
  }

  clear() {
    this.renderedRects.forEach((val) => {
      document.body.removeChild(val);
    });
    this.renderedRects = [];
    this.rects = [];
    this.selectedRect = new Rect(0, 0, 0, 0);
  }

  startSelection(event) {
    // this.selecting = true;
    let canvas = document.getElementById(this.canvas_id);
    this.start_coord.x = event.clientX - canvas.getBoundingClientRect().left;
    this.start_coord.y = event.clientY - canvas.getBoundingClientRect().top;
  }

  whileSelecting(event) {
    if (!this.selecting) return;
    let canvas = document.getElementById(this.canvas_id);
    let ctx = canvas.getContext("2d");
    canvas.style.pointerEvents = "auto";

    let width = event.clientX - canvas.getBoundingClientRect().left - this.start_coord.x;
    let height = event.clientY - canvas.getBoundingClientRect().top - this.start_coord.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(129, 207, 224, 0.4)";
    ctx.fillRect(this.start_coord.x, this.start_coord.y, width, height);
  }

  endSelection(event) {
    this.selecting = false;
    // let canvas = document.getElementById(this.canvas_id);
    // canvas.style.pointerEvents = "none";

    // let ctx = canvas.getContext("2d");
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // let width = event.clientX - canvas.getBoundingClientRect().left - this.start_coord.x;
    // let height = event.clientY - canvas.getBoundingClientRect().top - this.start_coord.y;

    // // Error margin (for clicks)
    // if ((-5 < width && width < 5) || (-5 < height && height < 5)) {
    //   this.selectedRect = new Rect(0, 0, 0, 0);
    //   // this.rects = [];
    //   return;
    // }

    // this.selectedRect = new Rect(this.start_coord.x, this.start_coord.y, width, height);
    // this.onSelected(this.selectedRect);
  }
}

async function getAPI(data) {
  data = data.substr(22);
  let res = await fetch("http://localhost:8000/process", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData: data }),
  });
  const content = await res.json();
  return content;
}

function isDifferent(seen, incoming) {
  for (var i = 0; i < incoming.length; i++) {
    let val = incoming[i];
    // console.log(val.repr(), seen);
    if (!seen.hasOwnProperty(val.repr())) {
      return true;
    }
  }

  return false;
}

var seen = {};
function main() {
  var ghost = document.createElement("canvas");
  ghost.id = "ghost";
  ghost.style.position = "absolute";
  ghost.style.display = "none";
  document.body.appendChild(ghost);

  let canvas = new Canvas("CursorLayer", (r) => {
    console.log(r);
  });

  setInterval(async function () {
    let video = document.querySelector("video");
    if (video == null) return;

    // resize_canvas(video);
    let stream = video.captureStream();
    let imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
    let frame = await imageCapture.grabFrame();

    var offScreenCanvas = document.getElementById("ghost");
    var context = offScreenCanvas.getContext("bitmaprenderer");
    const [frameWidth, frameHeight] = [frame.width, frame.height];
    context.transferFromImageBitmap(frame);
    var dataURL = offScreenCanvas.toDataURL();
    var selectedRects = [];
    let response = await getAPI(dataURL);
    chrome.runtime.sendMessage(response, function (response) {
      console.log("sending message");
    });
    response.lines.forEach((line) => {
      const boundaryBox = line.bounding_box;
      const [width, height] = [video.offsetWidth, video.offsetHeight];
      const wScale = width / frameWidth;
      const hScale = height / frameHeight;
      selectedRects.push(
        new Rect(
          Math.round(boundaryBox.x * wScale),
          Math.round(boundaryBox.y * hScale),
          boundaryBox.width * wScale,
          boundaryBox.height * hScale,
          line.text
        )
      );
    });

    // console.log(seen);
    if (isDifferent(seen, selectedRects)) {
      seen = {};
      selectedRects.forEach((val) => {
        seen[val.repr()] = true;
      });
      console.log("IS DIFFERENT");
      canvas.showRects(selectedRects);
    }
  }, 3000);
}
main();
