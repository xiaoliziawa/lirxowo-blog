export interface MarkdownEnhancementConfig {
	autoImageGrid: { enable: boolean; minImages: number; maxColumns: number };
	wikiLink: { enable: boolean };
	plantuml: {
		enable: boolean;
		server: string;
		lightTheme: string;
		darkTheme: string;
	};
}

export const markdownConfig: MarkdownEnhancementConfig = {
	autoImageGrid: { enable: true, minImages: 2, maxColumns: 4 },
	wikiLink: { enable: true },
	// 关闭公共渲染服务，避免将私有图表源码发送到第三方。
	plantuml: { enable: false, server: "", lightTheme: "", darkTheme: "" },
};
