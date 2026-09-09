import type { PioConfig } from "../types/config";

// 看板娘配置
export const pioConfig: PioConfig = {
	enable: true,
	image: "/assets/home/pig-mascot-idle.webp",
	animation: {
		image: "/assets/home/pig-mascot-anim.gif",
		duration: 3210,
	},
	dailyPig: {
		enable: true,
		data: "/daily-pig/pigs.json",
		imageBase: "/daily-pig/images/",
		title: "今日小猪",
		loading: "正在抽取今天的小猪…",
		download: "保存为图片",
	},
	position: "left",
	width: 160,
	hiddenOnMobile: true,
	dialog: {
		welcome: "欢迎来到 LirxOwO 的小窝！",
		touch: "哼哼~",
		close: "下次再见啦 QWQ",
		link: "/about/",
	},
	menus: {
		items: [
			{ icon: "mdi:gift-outline", label: "今日小猪", action: "daily" },
			{ icon: "mdi:bed", label: "休眠", action: "sleep" },
			{ icon: "mdi:home-outline", label: "回到首页", action: "home" },
			{ icon: "mdi:information-outline", label: "关于我", action: "about" },
		],
	},
};
