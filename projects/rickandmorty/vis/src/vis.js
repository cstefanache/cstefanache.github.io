import { select } from "d3v4";
import data from "../../data.json";

import utils from "./utils";
import characters from "./characters";
import timeline from "./timeline";
import sentiment from "./sentiment";
import characterLines from "./characterLines";
import interaction from "./interaction";

import { main, leftPadding, sections } from "./constants";

main.forEach(character => {
  const episodes = data.characters[character].episodes;
  const allEpisode = {
    sentiment: new Array(sections).fill(0),
    sentimentLine: new Array(sections).fill(""),
    time: new Array(sections).fill(0),
    linesCount: 0
  };

  Object.values(episodes).forEach(episode => {
    ["sentiment", "time"].forEach(key => {
      if (episode[key]) {
        episode[key].forEach((sentiment, index) => {
          if (sentiment) {
            if (key === "time") {
              allEpisode[key][index] += sentiment;
              allEpisode.linesCount += sentiment;
            } else {
              allEpisode[key][index] = allEpisode[key][index] + sentiment / 2;
            }
          }
        });
      }
    });
  });

  episodes["All"] = allEpisode;
});

const allEpisodes = [
  "Pilot",
  "Lawnmower Dog",
  "Anatomy Park",
  "M. Night Shaym-Aliens!",
  "Rick Potion 9",
  "Meeseeks and Destroy",
  "Raising Gazorpazorp",
  "Rixty Minutes",
  "Something Ricked This Way Comes",
  "Close Rick-counters of the Rick Kind",
  "Ricksy Business",
  "A Rickle in Time",
  "Mortynight Run",
  "Auto Erotic Assimilation",
  "Total Rickall",
  "Get Schwifty",
  "Big Trouble In Little Sanchez",
  "Look Who's Purging Now",
  "The Wedding Squanchers",
  "The Rickshank Redemption",
  "Rickmancing the Stone",
  "Pickle Rick",
  "The Whirly Dirly Conspiracy",
  "Morty's Mind Blowers",
  "The ABCs of Beth",
  "All"
];

export default (query, opts = { width: 960, height: 820 }) => {
  const container = document.querySelector(query);
  const { width, height } = opts;
  const svg = utils.createSvg(width, height);
  container.appendChild(svg);

  const root = select(svg);
  root
    .append("clipPath")
    .attr("id", "clipCircle")
    .append("circle")
    .attr("r", 20)
    .attr("cx", 25)
    .attr("cy", 20);

  root
    .append("text")
    .text("Episode")
    .attr("font-size", 20)
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width / 2}, 30)`);

  const episodeText = root
    .append("text")
    .attr("font-size", 24)
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width / 2}, 60)`);

  const next = root
    .append("path")
    .attr("d", "M0 0 0 15 15 7")
    .attr("stroke", "none")
    .attr("fill", "#000")
    .attr("opacity", 0.5)
    .attr("transform", `translate(${width / 2 + 50}, 15)`)
    .on("click", () => {
      if (index < allEpisodes.length - 1) {
        index++;
        selectEpisode(index);
      }
    });

  const prev = root
    .append("path")
    .attr("d", "M0 0 0 15 -15 7")
    .attr("stroke", "none")
    .attr("fill", "#000")
    .attr("opacity", 0.5)
    .attr("transform", `translate(${width / 2 - 50}, 15)`)
    .on("click", () => {
      if (index > 0) {
        index--;
        selectEpisode(index);
      }
    });

  const charIcons = characters(
    root,
    { data },
    d => {
      sent.onCharacterMouseEnter(d);
      lines.onOutsideMouseOver(d);
    },
    d => {
      sent.onCharacterMouseOut(d);
      lines.onOutsideMouseOut(d);
    }
  );

  charIcons.charactersGroup.attr("transform", "translate(320, 90)");

  const interactionView =
    document.location.search.indexOf("interaction") !== -1;
  let inter, sent, lines;
  let index = 0;
  if (interactionView) {
    /**
     * Cohort Diagram
     */
    inter = interaction(root);
    inter.interactionGroup.attr("transform", `translate(${width / 2}, 450)`);
  } else {
    /**
     * Timeline content
     */
    const { timelineGroup, timelineContent } = timeline(root);
    timelineGroup.attr("transform", `translate(${leftPadding}, 400)`);
    sent = sentiment(timelineContent, { main, data });

    lines = characterLines(timelineContent, {
      main,
      data,
      onSectionSelect: section => {
        sent.onSectionSelect(section);
      }
    });
    lines.mainGroup.attr("transform", "translate(0, 100)");
  }
  const selectEpisode = episodeIndex => {
    let episodeName = allEpisodes[episodeIndex];
    episodeText.text(episodeName);
    charIcons.displayForEpisode(episodeName);
    const ep = allEpisodes[episodeIndex];
    if (!interactionView) {
      sent.displayForEpisode(ep);
      lines.displayForEpisode(ep);
    } else {
      inter.displayForEpisode(ep);
    }
  };

  selectEpisode(index);

  return root;
};
