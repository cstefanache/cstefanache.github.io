import {
  select,
  rgb,
  chord,
  scaleOrdinal,
  schemeCategory10,
  arc,
  descending,
  ribbon
} from "d3v4";
import interaction from "../../interaction.json";

let all = [];
Object.values(interaction).forEach(elem => {
  all = all.concat(elem);
});

interaction["All"] = all;

import { width, leftPadding } from "./constants";

export default root => {
  const interactionGroup = root.append("g");

  const displayForEpisode = episodeName => {
    interactionGroup.selectAll("*").remove();
    const episodeData = interaction[episodeName];

    if (episodeData) {
      const characters = {};
      const order = [];
      let totalLines = 0;
      episodeData.forEach(item => {
        const [from, to] = item;
        if (from !== "" && to !== "") {
          if (order.indexOf(from) === -1) {
            order.push(from);
          }
          let fromChar = characters[from];
          if (!fromChar) {
            fromChar = characters[from] = { lines: 0, to: {} };
          }

          fromChar.lines++;

          if (!fromChar.to[to]) {
            fromChar.to[to] = 0;
          }

          fromChar.to[to] += 1;
        }
        totalLines += 1;
      });

      const toRemove = [];

      if (episodeName === "All") {


        Object.keys(characters).forEach(chr => {
          if (characters[chr].lines < 40) {
            toRemove.push(chr);
          }
        });

        toRemove.forEach(key => {
          delete characters[key];
          const orderIndex = order.indexOf(key);
          if (orderIndex !== -1) {
            order.splice(orderIndex, 1);
          }
        });
      }

      let matrix = order.reduce((memo, item) => {
        const line = [];
        order.forEach(from => {
          if (toRemove.indexOf(from) === -1 && toRemove.indexOf(item) === -1) {
            if (item === from) {
              line.push(0);
            } else {
              line.push(characters[from].to[item] || 0);
            }
          }
        });

        memo.push(line);
        return memo;
      }, []);

      const localChord = chord()
        .padAngle(0.02)
        .sortSubgroups(descending)
        .sortChords(descending);

      const chords = localChord(matrix);

      const innerRadius = 180;

      const group = interactionGroup
        .append("g")
        .selectAll("g")
        .data(chords.groups)
        .enter();

      const color = scaleOrdinal(schemeCategory10);

      const localArc = arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + 20);

      group
        .append("path")
        .attr("fill", d => color(d.index))
        .attr("stroke", d => color(d.index))
        .attr("d", localArc);

      group
        .append("text")
        .each(d => {
          d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("dy", ".35em")
        .attr(
          "transform",
          d => `
          rotate(${(d.angle * 180) / Math.PI - 90})
          translate(${innerRadius + 26})
          ${d.angle > Math.PI ? "rotate(180)" : ""}
        `
        )
        .attr("text-anchor", d => (d.angle > Math.PI ? "end" : null))
        .text(d => order[d.index]);

      const localRibbon = ribbon().radius(innerRadius);

      const ribbonGroup = group
        .append("g")
        // .attr("fill-opacity", 0.)
        .selectAll("path")
        .data(chords)
        .enter()
        .append("path");

      ribbonGroup
        .attr("stroke", d => rgb(color(d.source.index)).darker())
        .attr("fill", d => color(d.source.index))
        .attr("opacity", 0.1)

        .attr("d", localRibbon);
    }
  };

  return {
    interactionGroup,
    displayForEpisode
  };
};
