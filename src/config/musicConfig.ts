import type { MusicPlayerConfig } from "../types/config";

// 歌曲来自服务器 music 目录，清单由 scripts/scan-music.mjs 扫描生成
export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true,
	showFloatingPlayer: true,
	floatingEntryMode: "fab",
	mode: "local",
	meting_api: "",
	id: "",
	server: "netease",
	type: "playlist",
};
