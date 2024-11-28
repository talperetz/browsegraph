import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface PageItem {
  url: string;
  title: string;
  headers: string[];
  content: string;
}

export interface RawInteraction {
  timestamp: string;
  type: "click" | "input" | "command" | "visit";
  details?: any;
}

export interface InteractionData {
  timestamp: string;
  url?: string;
  title?: string;
  action: string;
  details?: any;
}

export interface TabData extends chrome.tabs.Tab {
  audible: boolean;
  incognito: boolean;
  type: "visit";
}

export interface TabChangeMessage {
  type: "TAB_CHANGE";
  title: string | undefined;
  url: string | undefined;
}

export interface TabContentMessage {
  type: "TAB_CONTENT";
  timestamp: string;
  details: {
    title: string | undefined;
    url: string | undefined;
    headers: string[];
    content: string;
  };
}

export interface SummaryMessage {
  type: "summary";
  timestamp: string;
  details: {
    title: string | undefined;
    url: string | undefined;
    content: string;
  };
}

export type AILanguageModelPromptInput =
  | string
  | AILanguageModelPrompt
  | AILanguageModelPrompt[];

export interface AILanguageModelPrompt {
  role: AILanguageModelPromptRole;
  content: string;
}

export type AILanguageModelPromptRole = "system" | "user" | "assistant";

export enum PreferredDesign {
  Light = "light",
  Dark = "dark",
}

export interface UserPreferences {
  id: string;
  preferredContent: string;
  preferredDesign: PreferredDesign;
  updatedAt: number;
}
