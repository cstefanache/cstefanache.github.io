import { area, curveMonotoneX, scaleLinear } from "d3v4";
import { color, width } from "./constants";

const x = scaleLinear()
    .range([-1, 1])
    .range([0, -100]),
  y = scaleLinear()
    .domain([0, 41])
    .range([0, width]);

const sentimentArea = area()
  .curve(curveMonotoneX)
  .y0(x(0))
  .y1(d => {
    return x(d === 0 ? 0.02 : d);
  })
  .x((d, index) => y(index));

export default (root, config) => {
  const { data, main } = config;
  let ep;

  const getSentimentsForEpisode = episode => {
    const sentiments = {};
    ep = episode;

    main.forEach(character => {
      const episodeData = data.characters[character].episodes[episode];
      if (episodeData) {
        sentiments[character] = episodeData.sentiment;
      } else {
        sentiments[character] = [];
      }
    });
    return sentiments;
  };

  const sentimentsGraph = root.append("g").attr("class", ".sentiment");
  const textsGroup = root.append("g").attr("transform", "translate(0, -200)");

  sentimentsGraph
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .text("Sentiment")
    .attr("transform", "translate(-5, 0)rotate(-90)");

  const paths = sentimentsGraph
    .selectAll("path")
    .data(main)
    .enter()
    .append("path")
    .attr("stroke", d => color[d])
    .attr("fill", d => `${color[d]}50`);

  const displayForEpisode = episode => {
    const sentiments = getSentimentsForEpisode(episode);

    paths
      .transition()
      .duration(300)
      .attr("d", d => {
        return sentimentArea(sentiments[d]);
      });
  };

  const onSectionSelect = section => {
    const texts = [];
    main.forEach(character => {
      const episodeData = data.characters[character].episodes[ep];
      if (episodeData) {
        const text = episodeData.sentimentLine[section];

        if (text && text.length > 0) {
          texts.push({ character, text });
        }
      }
    });

    textsGroup.selectAll("text").remove();
    const maxText = 120;
    for (let i = 0; i < texts.length; i++) {
      const { character, text } = texts[i];
      textsGroup
        .append("text")
        .attr("title", text)
        .attr("stroke", color[character])
        .text(
          `[${character}]: ${
            text.length > maxText ? text.substr(0, maxText) + "..." : text
          }`
        )
        .attr("transform", `translate(0, ${i * 20})`);
    }
  };

  sentimentsGraph
    .append("rect")
    .attr("stroke", "none")
    .attr("x", 0)
    .attr("y", 1)
    .attr("width", 74)
    .attr("height", 20)
    .attr("fill", "rgba(255,255,255,.5)");

  sentimentsGraph
    .append("rect")
    .attr("stroke", "none")
    .attr("x", 0)
    .attr("y", -21)
    .attr("width", 74)
    .attr("height", 20)
    .attr("fill", "rgba(255,255,255,.5)");

  sentimentsGraph
    .append("text")
    .attr("alignment-baseline", "central")
    .attr("font-size", 14)
    .text("😁 Positive")
    .attr("transform", "translate(2, -10)");

  sentimentsGraph
    .append("text")
    .attr("alignment-baseline", "central")
    .attr("font-size", 14)
    .text("🤬 Negative")
    .attr("transform", "translate(2, 10)");

  return {
    sentimentsGraph,
    displayForEpisode,
    onSectionSelect,
    onCharacterMouseEnter: d => {
      paths
        .transition()
        .duration(200)
        .attr("opacity", ch => (d !== ch ? 0.1 : 1));
    },
    onCharacterMouseOut: d => {
      paths
        .transition()
        .duration(200)
        .attr("opacity", 1);
    }
  };
};
