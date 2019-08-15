import { rgb } from "d3-color";

function createSvg(boxWidth, boxHeight) {
  const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
  svgElem.setAttributeNS(null, "width", boxWidth);
  svgElem.setAttributeNS(null, "height", boxHeight);
  svgElem.style.display = "block";
  svgElem.style.margin = "0 auto";
  svgElem.innerHTML = `
    <defs>
      <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>`;
  return svgElem;
}

function iso(px, py, pz = 0) {
  const x =
      Math.round(((-Math.sqrt(3) / 2) * py + (Math.sqrt(3) / 2) * px) * 100) /
      100,
    y = Math.round((+0.5 * py + 0.5 * px - pz) * 100) / 100;
  return [x, y];
}

function getTranslate(x, y, z) {
  return `translate(${iso(x, y, z).join(",")})`;
}

function transform(root, x, y, z) {
  root.attr("transform", `translate(${iso(x, y, z).join(",")})`);
}

function revIso(px, py, pz = 0) {
  return iso(py, -px, pz);
}

function isoArr(arr) {
  const [px, py, pz] = arr;
  return iso(px, py, pz);
}

function generatePath(pointsArr) {
  return `M${pointsArr.map(p => p.join(" ")).join("L")}z`;
}

function generatePoints(d) {
  return d.reduce((memo, item) => `${memo}${item[0]}, ${item[1]} `, "");
}

function setAttributes(root, attr) {
  Object.keys(attr).forEach(key => {
    root.attr(key, attr[key]);
  });
}

function addElement(root, elem, attrs) {
  const element = root.append(elem);
  setAttributes(element, attrs);
  return element;
}

function text(root, txt, x, y, z, orientation = 1) {
  const group = root.append("g");
  const text = group
    .append("text")
    .text(txt)
    .attr(
      "transform",
      orientation === 1
        ? `scale(1, 0.5773502691896258) rotate(45)`
        : `scale(1, 0.5773502691896258) rotate(-45)`
    );

  transform(group, x, y, z);

  return { group, text };
}

function getIsoPoints(arr) {
  return generatePoints(
    arr.reduce((memo, item) => {
      memo.push(isoArr(item));
      return memo;
    }, [])
  );
}

function drawPoly(root, arr, stroke = "#000", fill = "none") {
  return root
    .append("polyline")
    .attr("points", getIsoPoints(arr))
    .attr("stroke", stroke)
    .attr("stroke-width", 1)
    .attr("fill", fill);
}

function rect(root, x, y, z, width, length, stroke = "#000", fill = "none") {
  const mlb = iso(x + width, y, z),
    nb = iso(x + width, y + length, z),
    mrb = iso(x, y + length, z),
    bb = iso(x, y, z);
  const arr = [mrb, nb, mlb, bb, mrb];

  return root
    .append("polyline")
    .attr("points", generatePoints(arr))
    .attr("stroke", stroke)
    .attr("stroke-width", 1)
    .attr("fill", fill);
}

function isoColor(r, g, b, a) {
  const col = {
    shadow: a !== 1 ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)",
    face_left: rgb(r, g, b).darker(0.5),
    face_right: rgb(r, g, b).darker(0.7),
    face_top: rgb(r, g, b),
    outline: rgb(r, g, b).darker(0.9),
    inline: rgb(r, g, b).darker(-0.6)
  };

  if (a !== 1) {
    col.face_top.opacity = a;
    col.face_left.opacity = a;
    col.face_right.opacity = a;
  }

  return col;
}

function debounce(func, wait = 300, immediate = false, maxTicks = -1) {
  let timeout;
  let currentTicks = maxTicks;
  return function() {
    const context = this,
      args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) {
        currentTicks = maxTicks;
        func.apply(context, args);
      }
    };
    const callNow = currentTicks-- === 0 || (immediate && !timeout);
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      currentTicks = maxTicks;
      func.apply(context, args);
    }
  };
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y
  ].join(" ");

  return d;
}

function arcTween(d, new_score) {
  var new_startAngle = Math.random() * 2 * Math.PI
  var new_endAngle = new_startAngle + new_score * 2 * Math.PI
  var interpolate_start = d3.interpolate(d.startAngle, new_startAngle)
  var interpolate_end = d3.interpolate(d.endAngle, new_endAngle)
  return function(t) {
    d.startAngle = interpolate_start(t)
    d.endAngle = interpolate_end(t)
    return arc(d)
  }
}

export default {
  debounce,
  iso,
  isoArr,
  generatePath,
  generatePoints,
  isoColor,
  revIso,
  createSvg,
  rect,
  drawPoly,
  getIsoPoints,
  transform,
  getTranslate,
  text,
  addElement,
  setAttributes,
  describeArc,
  arcTween
};
