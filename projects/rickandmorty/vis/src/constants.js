import { schemeCategory10 } from "d3v4";
export const sections = 42
export const main = ["rick", "morty", "summer", "beth", "jerry"];

export const color = main.reduce((memo, item, index) => {
  memo[item] = schemeCategory10[index];
  return memo;
}, {});

export const leftPadding = 0;
export const width = 960 - leftPadding;
