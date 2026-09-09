// 本地番剧示例数据，可按自己的观看记录修改。
export interface AnimeItem {
	title: string;
	status: "watching" | "completed" | "planned";
	rating: number;
	cover: string;
	description: string;
	episodes: string;
	year: string;
	genre: string[];
	studio: string;
	link: string;
	progress: number;
	totalEpisodes: number;
	startDate: string;
	endDate: string;
}

const localAnimeList: AnimeItem[] = [
	{
		title: "莉可丽丝",
		status: "completed",
		rating: 9.2,
		cover: "/assets/anime/lkls.webp",
		description: "轻快日常与动作戏交织的原创动画。",
		episodes: "13 集",
		year: "2022",
		genre: ["动作", "日常"],
		studio: "A-1 Pictures",
		link: "https://bgm.tv/subject/358092",
		progress: 13,
		totalEpisodes: 13,
		startDate: "2022-07",
		endDate: "2022-09",
	},
	{
		title: "恋爱小行星",
		status: "watching",
		rating: 8.8,
		cover: "/assets/anime/laxxx.webp",
		description: "在地学部寻找小行星的温柔校园故事。",
		episodes: "12 集",
		year: "2020",
		genre: ["校园", "治愈"],
		studio: "动画工房",
		link: "https://bgm.tv/subject/278440",
		progress: 7,
		totalEpisodes: 12,
		startDate: "2026-08",
		endDate: "",
	},
	{
		title: "请问您今天要来点兔子吗？",
		status: "planned",
		rating: 9.0,
		cover: "/assets/anime/tz1.webp",
		description: "咖啡馆、友情与轻松日常。",
		episodes: "12 集",
		year: "2014",
		genre: ["日常", "治愈"],
		studio: "WHITE FOX",
		link: "https://bgm.tv/subject/88287",
		progress: 0,
		totalEpisodes: 12,
		startDate: "",
		endDate: "",
	},
];

export default localAnimeList;
