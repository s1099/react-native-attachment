import * as React from "react";
import { useColorScheme } from "react-native";

export type AttachmentColors = {
  /** Card surface behind the attachment. */
  card: string;
  /** Primary text colour on the card. */
  cardForeground: string;
  /** Card surface while the trigger is pressed. */
  cardPressed: string;
  /** Media well / secondary surface. */
  muted: string;
  /** Secondary text colour (description). */
  mutedForeground: string;
  /** Default border colour. */
  border: string;
  /** Focus/active outline colour. */
  ring: string;
  /** Surface of an action button while pressed. */
  accent: string;
  /** Error foreground. */
  destructive: string;
  /** Border colour in the `error` state. */
  destructiveBorder: string;
  /** Media well background in the `error` state. */
  destructiveMuted: string;
};

export type AttachmentRadii = {
  md: number;
  lg: number;
  xl: number;
};

export type AttachmentTheme = {
  colors: AttachmentColors;
  radii: AttachmentRadii;
};

export type PartialAttachmentTheme = {
  colors?: Partial<AttachmentColors>;
  radii?: Partial<AttachmentRadii>;
};

const radii: AttachmentRadii = { md: 6, lg: 8, xl: 12 };

export const lightAttachmentTheme: AttachmentTheme = {
  radii,
  colors: {
    card: "#ffffff",
    cardForeground: "#252525",
    cardPressed: "#fafafa",
    muted: "#f5f5f5",
    mutedForeground: "#8e8e8e",
    border: "#e5e5e5",
    ring: "#b5b5b5",
    accent: "#f0f0f0",
    destructive: "#e7000b",
    destructiveBorder: "rgba(231, 0, 11, 0.3)",
    destructiveMuted: "rgba(231, 0, 11, 0.1)",
  },
};

export const darkAttachmentTheme: AttachmentTheme = {
  radii,
  colors: {
    card: "#252525",
    cardForeground: "#fafafa",
    cardPressed: "#2e2e2e",
    muted: "#404040",
    mutedForeground: "#b5b5b5",
    border: "rgba(255, 255, 255, 0.12)",
    ring: "#8e8e8e",
    accent: "#333333",
    destructive: "#ff6467",
    destructiveBorder: "rgba(255, 100, 103, 0.35)",
    destructiveMuted: "rgba(255, 100, 103, 0.14)",
  },
};

export function createAttachmentTheme(
  base: AttachmentTheme,
  overrides?: PartialAttachmentTheme
): AttachmentTheme {
  if (!overrides) return base;
  return {
    colors: { ...base.colors, ...overrides.colors },
    radii: { ...base.radii, ...overrides.radii },
  };
}

const AttachmentThemeContext = React.createContext<AttachmentTheme | null>(null);

export type AttachmentThemeProviderProps = {
  children?: React.ReactNode;
  /**
   * `"light"` / `"dark"` pin the palette, `"system"` (default) follows
   * `useColorScheme()`.
   */
  colorScheme?: "light" | "dark" | "system";
  /** Token overrides merged onto the resolved base palette. */
  theme?: PartialAttachmentTheme;
};

export function AttachmentThemeProvider({
  children,
  colorScheme = "system",
  theme,
}: AttachmentThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolved = colorScheme === "system" ? systemScheme : colorScheme;
  const base = resolved === "dark" ? darkAttachmentTheme : lightAttachmentTheme;

  const value = React.useMemo(
    () => createAttachmentTheme(base, theme),
    [base, theme]
  );

  return (
    <AttachmentThemeContext.Provider value={value}>
      {children}
    </AttachmentThemeContext.Provider>
  );
}

/**
 * Resolves the active theme. Falls back to the light palette (or the system
 * palette) so components work without a provider.
 */
export function useAttachmentTheme(): AttachmentTheme {
  const fromContext = React.useContext(AttachmentThemeContext);
  const systemScheme = useColorScheme();
  if (fromContext) return fromContext;
  return systemScheme === "dark" ? darkAttachmentTheme : lightAttachmentTheme;
}
