import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	title: "放映室公告",
	content: "欢迎来到 LirxOwO 的个人博客。当前文章为版式与内容示例。",
	closable: true,
	link: {
		enable: true,
		text: "认识版主",
		url: "/about/",
		external: false,
	},
};
