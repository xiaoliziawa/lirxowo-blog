const DATA_URL = "/ai-radar-data/data.json";
const REFRESH_INTERVAL_MS = 20 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

// 推理强度由低到高，配色递进
const EFFORT_TONE = {
	low: "bg-neutral-500/15 text-neutral-500",
	medium: "bg-green-500/15 text-green-600 dark:text-green-400",
	high: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
	xhigh: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
	max: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
	ultra: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

const STATUS_TONE = {
	none: "bg-green-500",
	minor: "bg-yellow-500",
	major: "bg-orange-500",
	critical: "bg-red-500",
	maintenance: "bg-blue-500",
};

const escapeHtml = (value) =>
	String(value ?? "").replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[char],
	);

// 第三方接口返回的链接不能直接信任，只放行 http/https
const safeUrl = (value) => {
	try {
		const url = new URL(String(value));
		return url.protocol === "http:" || url.protocol === "https:"
			? escapeHtml(url.href)
			: "#";
	} catch {
		return "#";
	}
};

const compact = (value) =>
	value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

export function initAiRadar() {
	// 先停掉上一轮轮询：离开本页后不应继续在后台拉数据
	window.clearInterval(window.__aiRadarTimer);

	const root = document.getElementById("ai-radar");
	const body = document.getElementById("ai-radar-body");
	const updated = document.getElementById("ai-radar-updated");
	const refresh = document.getElementById("ai-radar-refresh");
	const refreshIcon = document.getElementById("ai-radar-refresh-icon");
	if (!root || !body || !updated) return;

	const labels = JSON.parse(root.dataset.labels || "{}");

	const relativeTime = (iso) => {
		const diff = Date.now() - new Date(iso).getTime();
		if (diff < MINUTE_MS) return "刚刚";
		if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)} 分钟前`;
		return `${Math.floor(diff / HOUR_MS)} 小时前`;
	};

	const section = (heading, inner) => `
		<section>
			<h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-black/85 dark:text-white/85">
				<span class="h-4 w-1 rounded-md bg-(--primary)"></span>${escapeHtml(heading)}
			</h2>
			${inner}
		</section>`;

	const unavailable = () =>
		`<p class="text-sm text-black/40 dark:text-white/40">${escapeHtml(labels.unavailable)}</p>`;

	const renderStatus = (items) => {
		if (!items?.length) return unavailable();
		return `<div class="grid gap-3 sm:grid-cols-2">${items
			.map(
				(item) => `
			<a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer"
				class="card-base border border-(--line-divider) p-4 transition hover:shadow-md">
				<div class="flex items-center gap-2">
					<span class="h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_TONE[item.indicator] ?? "bg-neutral-400"}"></span>
					<span class="font-bold text-black/80 dark:text-white/80">${escapeHtml(item.name)}</span>
				</div>
				<p class="mt-1 text-sm text-black/50 dark:text-white/50">${escapeHtml(item.description)}</p>
				${item.incidents
					.map(
						(incident) =>
							`<p class="mt-2 text-xs text-orange-500">• ${escapeHtml(incident.name)}</p>`,
					)
					.join("")}
			</a>`,
			)
			.join("")}</div>`;
	};

	const renderStories = (items) => {
		if (!items?.length) return unavailable();
		return `<ul class="space-y-2">${items
			.map(
				(item) => `
			<li class="flex items-baseline gap-3">
				<span class="w-12 shrink-0 text-right text-sm font-bold text-(--primary)">${item.points}</span>
				<a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer"
					class="flex-1 text-black/75 transition hover:text-(--primary) dark:text-white/75">${escapeHtml(item.title)}</a>
				<a href="${safeUrl(item.discussUrl)}" target="_blank" rel="noopener noreferrer"
					class="shrink-0 text-xs text-black/35 dark:text-white/35">${item.comments} 评论</a>
			</li>`,
			)
			.join("")}</ul>`;
	};

	const renderModels = (items) => {
		if (!items?.length) return unavailable();
		return `<div class="flex flex-wrap gap-2">${items
			.map(
				(item) => `
			<a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer"
				class="btn-regular rounded-lg px-3 py-2 text-sm">
				<span class="font-bold">${escapeHtml(item.id)}</span>
				<span class="ml-2 text-xs opacity-60">♥ ${compact(item.likes)} · ↓ ${compact(item.downloads)}</span>
			</a>`,
			)
			.join("")}</div>`;
	};

	const renderRepos = (items) => {
		if (!items?.length) return unavailable();
		return `<div class="grid gap-3 sm:grid-cols-2">${items
			.map(
				(item) => `
			<a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer"
				class="card-base border border-(--line-divider) p-4 transition hover:shadow-md">
				<div class="flex items-center justify-between gap-2">
					<span class="truncate font-bold text-black/80 dark:text-white/80">${escapeHtml(item.name)}</span>
					<span class="shrink-0 text-xs text-(--primary)">★ ${compact(item.stars)}</span>
				</div>
				<p class="mt-1 line-clamp-2 text-sm text-black/50 dark:text-white/50">${escapeHtml(item.description)}</p>
			</a>`,
			)
			.join("")}</div>`;
	};

	const renderCodex = (codex) => {
		if (!codex?.points?.length) return unavailable();
		const maxIq = Math.max(...codex.points.map((point) => point.iq));
		const rows = codex.points
			.map(
				(point) => `
			<tr class="border-t border-(--line-divider)">
				<td class="py-2 pr-3 font-bold text-black/80 dark:text-white/80">${escapeHtml(point.model)}</td>
				<td class="py-2 pr-3">
					<span class="rounded-md px-2 py-0.5 text-xs font-bold ${EFFORT_TONE[point.effort] ?? EFFORT_TONE.low}">${escapeHtml(point.effort)}</span>
				</td>
				<td class="py-2 pr-3 whitespace-nowrap">
					<span class="mr-2 font-bold tabular-nums">${point.iq.toFixed(1)}</span>
					<span class="inline-block h-1.5 w-16 rounded-full bg-black/10 align-middle dark:bg-white/10">
						<span class="block h-full rounded-full bg-(--primary)" style="width:${Math.max(4, Math.round((point.iq / maxIq) * 100))}%"></span>
					</span>
				</td>
				<td class="py-2 pr-3 text-right tabular-nums">$${point.price.toFixed(2)}</td>
				<td class="py-2 pr-3 text-right tabular-nums">${point.minutes.toFixed(1)}m</td>
				<td class="py-2 text-right tabular-nums text-black/35 dark:text-white/35">${point.runs}</td>
			</tr>`,
			)
			.join("");

		return `
		<div class="codex-scroll max-h-[32rem] overflow-auto pr-3">
			<table class="w-full min-w-[34rem] text-sm">
				<thead class="sticky top-0 bg-(--card-bg)">
					<tr class="text-xs text-black/45 dark:text-white/45">
						<th class="pb-2 pr-3 text-left font-normal">模型</th>
						<th class="pb-2 pr-3 text-left font-normal">推理强度</th>
						<th class="pb-2 pr-3 text-left font-normal">智力 IQ</th>
						<th class="pb-2 pr-3 text-right font-normal">平均价格</th>
						<th class="pb-2 pr-3 text-right font-normal">平均耗时</th>
						<th class="pb-2 text-right font-normal">运行次数</th>
					</tr>
				</thead>
				<tbody class="text-black/70 dark:text-white/70">${rows}</tbody>
			</table>
		</div>
		<p class="mt-2 text-xs text-black/35 dark:text-white/35">
			数据来源 codexradar.com · IQ = 任务通过率 × 150 · 仅列出运行次数 ≥ 10 的样本
		</p>`;
	};

	const render = (data) => {
		body.innerHTML = [
			section(labels.status, renderStatus(data.status)),
			section(labels.stories, renderStories(data.stories)),
			section(labels.models, renderModels(data.models)),
			section(labels.repos, renderRepos(data.repos)),
			section(labels.codex, renderCodex(data.codex)),
		].join("");
		updated.textContent = `${labels.updated} ${relativeTime(data.updatedAt)}`;
	};

	const load = async (manual = false) => {
		refreshIcon?.classList.add("is-loading");
		try {
			// 手动刷新绕过 CDN 与浏览器缓存，取服务端最新快照
			const url = manual ? `${DATA_URL}?t=${Date.now()}` : DATA_URL;
			const response = await fetch(url, { cache: manual ? "reload" : "default" });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			render(await response.json());
		} catch {
			updated.textContent = labels.unavailable;
		} finally {
			refreshIcon?.classList.remove("is-loading");
		}
	};

	refresh?.addEventListener("click", () => load(true));

	window.__aiRadarTimer = window.setInterval(
		() => load(false),
		REFRESH_INTERVAL_MS,
	);

	load(false);
}
