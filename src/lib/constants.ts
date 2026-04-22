export const TIME_FILTERS = [
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "12 Months", value: "12m" },
  { label: "All Time", value: "all" },
] as const;

export type TimeFilter = (typeof TIME_FILTERS)[number]["value"];

export const COLOR_PALETTE = [
  "#A8D5BA", "#B8C9E1", "#FAD7A0", "#F4B8C1", "#D7BDE2",
  "#AED6F1", "#FDEBD0", "#F9E4B7", "#A9CCE3", "#A2D9CE",
  "#FADBD8", "#D5DBDB", "#E8DAEF", "#ABEBC6", "#F9E4D4",
];
