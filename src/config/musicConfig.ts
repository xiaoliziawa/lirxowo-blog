import type { MusicPlayerConfig } from "../types/config";

// 默认关闭示例音乐，避免自动加载未确认授权的音频。
export const musicPlayerConfig: MusicPlayerConfig = {
	enable: false,
	showFloatingPlayer: false,
	floatingEntryMode: "fab",
	mode: "local",
	meting_api: "",
	id: "",
	server: "netease",
	type: "playlist",
};
