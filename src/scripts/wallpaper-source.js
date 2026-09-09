// 壁纸图源切换：本地图片 / 二次元图源 / Bing 每日。
//
// 实现方式：远程图源不去修改主题原有的横幅与壁纸节点，而是在其上方插入一层
// 独立的覆盖图层。原因是轮播脚本会按间隔从 <template> 取图重建 DOM，直接改
// img/source 会被它周期性覆盖掉。
const STORAGE_KEY = "wallpaperSource";
const OVERLAY_ID = "wallpaper-source-overlay";
const ACTIVE_CLASS = "wallpaper-source-active";

export const WALLPAPER_SOURCE_FALLBACK_EVENT = "wallpaper-source:fallback";

export const WALLPAPER_SOURCES = {
	local: null,
	scenery: {
		desktop: "https://t.alcy.cc/pc",
		mobile: "https://t.alcy.cc/mp",
	},
	character: {
		desktop: "https://www.dmoe.cc/random.php?return=302",
		mobile: "https://www.dmoe.cc/random.php?return=302",
	},
	// 每日一图由服务器同步到本站，同域直出，不依赖第三方接口
	bing: {
		desktop: "/bing/1920x1080.jpg",
		mobile: "/bing/1080x1920.jpg",
		daily: true,
	},
};

// 横幅与全屏壁纸各自的宿主容器，谁存在就往谁里面插图层。
// 全屏壁纸用类选择器：它的外层包裹元素只有 class，且轮播与单图两种模式都挂在它上面
const HOST_SELECTORS = [
	"#banner-carousel",
	"#banner-single-container",
	".wallpaper-container",
];

export function getWallpaperSource() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored && stored in WALLPAPER_SOURCES ? stored : "local";
	} catch {
		return "local";
	}
}

export function setWallpaperSource(source) {
	try {
		localStorage.setItem(STORAGE_KEY, source);
	} catch {
		/* localStorage 不可用时忽略 */
	}
}

function withCacheBust(url, seed) {
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}_t=${seed}`;
}

function removeOverlays() {
	for (const node of document.querySelectorAll(`.${OVERLAY_ID}`)) {
		node.remove();
	}
	for (const host of document.querySelectorAll(`.${ACTIVE_CLASS}`)) {
		host.classList.remove(ACTIVE_CLASS);
	}
}

// 远程图加载失败时本地轮播已被 CSS 隐藏，必须退回本地图源，否则只剩一片空白
function fallbackToLocal() {
	removeOverlays();
	document.documentElement.setAttribute("data-wallpaper-source", "local");
	setWallpaperSource("local");
	document.dispatchEvent(new CustomEvent(WALLPAPER_SOURCE_FALLBACK_EVENT));
}

let currentSeed = Date.now();

export function applyWallpaperSource(
	source = getWallpaperSource(),
	{ reseed = false } = {},
) {
	const config = WALLPAPER_SOURCES[source];
	document.documentElement.setAttribute("data-wallpaper-source", source);

	if (reseed) {
		currentSeed = Date.now();
	}

	// 本地图源：移除覆盖层，露出主题原有的图片与轮播
	if (!config) {
		removeOverlays();
		return true;
	}

	const hosts = HOST_SELECTORS.flatMap((selector) =>
		Array.from(document.querySelectorAll(selector)),
	);
	if (hosts.length === 0) {
		return false;
	}

	const isMobile = window.matchMedia("(max-width: 767px)").matches;
	const url = isMobile ? config.mobile : config.desktop;
	// 每日图一天只有一张，绕开缓存只会白白重复下载
	const remote = config.daily ? url : withCacheBust(url, currentSeed);

	for (const host of hosts) {
		host.classList.add(ACTIVE_CLASS);

		let overlay = host.querySelector(`:scope > .${OVERLAY_ID}`);
		if (!overlay) {
			overlay = document.createElement("img");
			overlay.className = `${OVERLAY_ID} absolute inset-0 w-full h-full object-cover`;
			overlay.alt = "";
			overlay.decoding = "async";
			overlay.fetchPriority = "high";
			// 盖在轮播图之上，但低于横幅文字与导航
			overlay.style.zIndex = "5";
			overlay.addEventListener("error", fallbackToLocal);
			host.appendChild(overlay);
		}
		if (overlay.getAttribute("src") !== remote) {
			overlay.src = remote;
		}
	}

	return true;
}

export function initWallpaperSource() {
	const apply = () => applyWallpaperSource();

	const run = () => {
		if (apply()) {
			return;
		}
		// 单图模式下容器由内联脚本异步插入，等它出现
		const observer = new MutationObserver(() => {
			if (apply()) {
				observer.disconnect();
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
		setTimeout(() => observer.disconnect(), 10000);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run, { once: true });
	} else {
		run();
	}

	// Swup 换页后横幅会重建，需要重新应用
	document.addEventListener("swup:page:view", run);
}
