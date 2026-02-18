export type NeoBrutalMode = "light" | "dark";

export interface NeoBrutalTokens {
  border: {
    width: number;
    radius: number;
  };
  color: {
    background: string;
    surface: string;
    surfaceAlt: string;
    ink: string;
    mutedInk: string;
    border: string;
    danger: string;
    red: string;
    yellow: string;
    blue: string;
    green: string;
    purple: string;
  };
  mode: NeoBrutalMode;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
}

const headingFont = "geistBold";
const bodyFont = "geistRegular";
const monoFont = "geistSemiBold";

export const neoBrutalLightTokens: NeoBrutalTokens = {
  mode: "light",
  color: {
    background: "#F7EFE8",
    surface: "#FFF8F2",
    surfaceAlt: "#EDD9CB",
    ink: "#241810",
    mutedInk: "#6E4B39",
    border: "#DABAA6",
    danger: "#A63927",
    red: "#C4540F",
    yellow: "#C4540F",
    blue: "#2E8399",
    green: "#4C9060",
    purple: "#745AB4",
  },
  border: {
    width: 1,
    radius: 0,
  },
  typography: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 22,
    xl: 30,
  },
};

export const neoBrutalDarkTokens: NeoBrutalTokens = {
  mode: "dark",
  color: {
    background: "#1B130F",
    surface: "#2A1D18",
    surfaceAlt: "#382823",
    ink: "#F8ECE5",
    mutedInk: "#C9AFA1",
    border: "#5C3F31",
    danger: "#FF8168",
    red: "#D8672A",
    yellow: "#C4540F",
    blue: "#62B9CF",
    green: "#67BE7C",
    purple: "#A18AD8",
  },
  border: {
    width: 1,
    radius: 0,
  },
  typography: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 22,
    xl: 30,
  },
};
