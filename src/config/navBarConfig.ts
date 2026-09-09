import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Diary,
		LinkPreset.About,
		{
			name: "AI 雷达",
			url: "/ai-radar/",
			icon: "simple-icons:openai",
		},
		{
			name: "GitHub",
			url: "https://github.com/xiaoliziawa",
			external: true,
			icon: "fa7-brands:github",
		},
	],
};
