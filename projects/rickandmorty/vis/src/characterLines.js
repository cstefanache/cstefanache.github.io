import { area, event, scaleLinear, select, curveMonotoneX } from "d3v4";
import { color, width, sections } from "./constants";
import { addElement } from "./utils";
const y = scaleLinear()
  .domain([0, sections])
  .range([0, width]);

export default (root, config) => {
  const { data, main, onSectionSelect } = config;
  const mainGroup = root.append("g");
  const characterLinesGroup = mainGroup.append("g");
  const timelineContent = mainGroup.append("g");
  let charGroup, toRender;
  let linesCountPath, mouseleave, mouseenter, chars;

  const timelineGroup = mainGroup.append("g");

  linesCountPath = timelineGroup
    .append("path")
    .attr("stroke", "none")
    .attr("fill", "rgba(135, 167, 255, .5)");
  //

  const timeline = timelineGroup
    .append("rect")
    .attr("x", 0)
    .attr("width", width)
    .attr("y", -10)
    .attr("height", 10)
    .attr("stroke", "#000")
    .attr("stroke-width", 0)
    .attr("fill", "rgba(135, 167, 255, .5)");

  const rect = mainGroup
    .append("rect")
    .attr("x", 0)
    .attr("width", width)
    .attr("y", -100)
    .attr("height", 100)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("opacity", 0.2)
    .attr("pointer-events", "none")
    .attr("fill", "rgba(0,0,0,.2)");

  const displayForEpisode = ep => {
    toRender = [];
    chars = [];
    const allCharacters = Object.keys(data.characters);
    const allCounts = new Array(sections).fill(0);

    allCharacters.forEach((char, index) => {
      const { episodes } = data.characters[char];
      const episode = episodes[ep];
      if (episode) {
        toRender.push({ char, time: episode.time });
        for (let i = 0; i < episode.time.length; i++) {
          allCounts[i] = allCounts[i] + episode.time[i];
        }
        chars.push(char);
      }
    });

    const areaX = scaleLinear()
        .domain([0, Math.max(...allCounts)])
        .range([-10, -60]),
      areaY = scaleLinear()
        .domain([0, 41])
        .range([0, width]);

    const linesArea = area()
      .curve(curveMonotoneX)
      .y0(areaX(0))
      .y1(d => {
        return areaX(d);
      })
      .x((d, index) => areaY(index));

    linesCountPath.attr("d", linesArea(allCounts));

    characterLinesGroup.selectAll("*").remove();

    const charIterator = characterLinesGroup
      .selectAll(".characterGroup")
      .data(toRender)
      .enter();

    mouseenter = d => {
      charGroup
        .transition()
        .duration(200)
        .attr("opacity", chD => {
          return chD.char === d.char ? 1 : 0.1;
        });

      linesCountPath
        .transition()
        .duration(200)
        .attr("d", linesArea(d.time));

      let min = sections,
        max = 0;
      d.time.forEach((time, index) => {
        if (time !== 0) {
          min = Math.min(min, index);
          max = Math.max(max, index);
        }
      });

      rect
        .transition()
        .duration(100)
        .attr("opacity", 1)
        .attr("x", min * sectionWidth)
        .attr("width", (max + 1 - min) * sectionWidth);
    };

    mouseleave = () => {
      linesCountPath
        .transition()
        .duration(200)
        .attr("d", linesArea(allCounts));
      charGroup
        .transition()
        .duration(100)
        .attr("opacity", 1);
      rect
        .transition()
        .duration(200)
        .attr("x", 0)
        .attr("width", width)
        .attr("opacity", 0.2);
    };

    charGroup = charIterator
      .append("g")
      .attr("character", d => d.char)
      .on("mouseenter", d => mouseenter(d))
      .on("mouseleave", d => mouseleave(d));

    const spacing = 20;
    const leftOffset = (width - chars.length * spacing) / 2;

    addElement(mainGroup, "line", {
      stroke: "rgba(0,0,0,0.5)",
      "stroke-width": 1,
      x1: 0,
      x2: width,
      y1: 0,
      y2: 0
    });

    for (let i = 0; i < width; i += width / 100) {
      addElement(mainGroup, "line", {
        stroke: "rgba(0,0,0,0.5)",
        "stroke-width": 1,
        x1: i,
        x2: i,
        y1: -5,
        y2: 0,
        "pointer-events": "none"
      });
    }

    charGroup
      .append("text")
      .text(d => d.char)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "central")
      .attr(
        "transform",
        (d, chIndex) =>
          `translate(${leftOffset + chIndex * spacing}, ${205})rotate(-45)`
      );

    charGroup
      .selectAll("path")
      .data(d => d.time)
      .enter()
      .append("path")
      .attr("opacity", 0.6)
      .attr("stroke", function() {
        const character = select(this.parentNode).datum().char;
        return color[character] ? color[character] : "rgba(0,0,0)";
      })
      .attr("fill", "none")
      .attr("d", function(d, index) {
        const chIndex = chars.indexOf(select(this.parentNode).datum().char);
        return d
          ? `
        M${leftOffset + chIndex * spacing} ${200}
        C${leftOffset + chIndex * spacing} ${100}
         ${y(index) + 10} 100
         ${y(index) + 10} 0`
          : "";
      });
  };

  mainGroup
    .append("text")
    .attr("font-size", 12)
    .text("Lines Count")
    .attr("transform", "translate(0, -40)");

  let lastIndex = -1;
  const sectionWidth = width / sections;
  timelineGroup
    .on("mousemove", d => {
      const index = Math.floor((event.offsetX * sections) / width);
      rect
        .transition()
        .duration(100)
        .attr("opacity", 1)
        .attr("x", index * sectionWidth)
        .attr("width", sectionWidth);
      if (lastIndex !== index) {
        lastIndex = index;
        onSectionSelect(lastIndex);
        charGroup
          .selectAll("text")
          .transition()
          .duration(100)
          .attr("opacity", d => (d.time[index] ? 1 : 0.1));

        charGroup
          .transition()
          .duration(100)
          .selectAll("path")
          .attr("opacity", (d, lindex) => (d && lindex === index ? 1 : 0.1));
      }
    })
    .on("mouseleave", () => {
      lastIndex = -1;
      onSectionSelect(lastIndex);
      rect
        .transition()
        .duration(100)
        .attr("x", 0)
        .attr("width", width)
        .attr("opacity", 0.1);
      charGroup
        .transition()
        .duration(100)
        .selectAll("text")
        .attr("opacity", 1);
      charGroup
        .transition()
        .duration(100)
        .selectAll("path")
        .attr("opacity", 0.6);
    });

  const onOutsideMouseOver = on => {
    const found = toRender.find(char => char.char === on);
    if (found) {
      mouseenter(found);
    }
  };

  const onOutsideMouseOut = on => {
    mouseleave();
  };

  return {
    mainGroup,
    displayForEpisode,
    onOutsideMouseOver,
    onOutsideMouseOut
  };
};

/*
export default (root, config) => {
  const { data, main, onSectionSelect } = config;
  const mainGroup = root.append("g");
  const characterLinesGroup = mainGroup.append("g");
  const timelineContent = mainGroup.append("g");

  const displayForEpisode = ep => {


  };

  return {
    mainGroup,
    displayForEpisode
  };
};

*/
