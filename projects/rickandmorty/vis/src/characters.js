import { main, color } from "./constants";
import { select, arc, interpolate } from "d3v4";
import jerry from "../../assets/jerry.jpeg";
import beth from "../../assets/beth.jpeg";
import morty from "../../assets/morty.jpeg";
import rick from "../../assets/rick.jpeg";
import summer from "../../assets/summer.jpeg";

const chars = { jerry, beth, morty, rick, summer };

export default (root, config, onLegendMouseEnter, onLegendMouseLeave) => {
  const { data } = config;
  const charactersGroup = root.append("g");

  const legendItem = charactersGroup
    .selectAll(".legend")
    .data(main)
    .enter()
    .append("g")
    .attr("transform", (d, index) => `translate(${index * 70}, 0)`)
    .on("mouseenter", d => {
      if (onLegendMouseEnter) {
        onLegendMouseEnter(d);
      }
    })
    .on("mouseleave", d => {
      if (onLegendMouseEnter) {
        onLegendMouseLeave(d);
      }
    });

  const arcFn = arc()
    .innerRadius(25)
    .outerRadius(26)
    .startAngle(0);

  legendItem
    .append("text")
    .text(d => d[0].toUpperCase() + d.substr(1))
    .attr("stroke", d => color[d])
    .attr("text-anchor", "middle")
    .attr("transform", "translate(25, 60)");

  legendItem
    .append("image")
    .attr("href", d => chars[d])
    .attr("width", 50)
    .attr("height", 50)

    .attr("clip-path", "url(#clipCircle)");

  legendItem
    .append("circle")
    .attr("cx", 25)
    .attr("cy", 20)
    .attr("r", 22)
    .attr("stroke-width", 2)
    .attr("stroke", d => color[d])
    .attr("fill", "none");

  legendItem
    .append("path")
    .attr("stroke-width", 2)
    .attr("stroke", d => color[d])
    .attr("fill", "none")
    .attr("transform", "translate(25, 20)");

  const displayForEpisode = episodeName => {
    const linesCount = {};

    let maxLines = 0;

    main.forEach(character => {
      const episodeData = data.characters[character].episodes[episodeName];
      const value = episodeData ? episodeData.linesCount : 0;
      linesCount[character] = { count: value };
      maxLines = Math.max(maxLines, value);
    });

    function arcTween(newAngle) {
      return function(d) {
        var interpolateFn = interpolate(linesCount[d].endAngle || 0, newAngle);
        return function(t) {
          linesCount[d].endAngle = interpolateFn(t);
          return arcFn(linesCount[d]);
        };
      };
    }

    legendItem.selectAll("path").each(function(path) {
      const angle = (linesCount[path].count * 2 * Math.PI) / maxLines;
      select(this)
        .transition()
        .duration(750)
        .attrTween("d", arcTween(angle));
    });
  };

  return {
    charactersGroup,
    displayForEpisode
  };
};
