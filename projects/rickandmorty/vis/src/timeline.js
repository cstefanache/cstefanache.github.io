import {
  select,
} from "d3v4";

import { width, leftPadding } from './constants';


export default (root, config) => {

  const timelineGroup = root.append('g');

  const timelineContent = timelineGroup.append('g');


  const timeline = timelineGroup.append('line')
    .attr('x1', 20)
    .attr('x2', width)
    .attr('y0', 0)
    .attr('y1', 0)
    .attr('stroke', '#000')
    .attr('stroke-width', 1)

  return {
    timelineGroup,
    timelineContent,
    timeline
  }
};
