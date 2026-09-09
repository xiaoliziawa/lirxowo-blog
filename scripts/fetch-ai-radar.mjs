import fs from "fs/promises";
import path from "path";

const OUTPUT_DIR = process.env.AI_RADAR_DIR || "/opt/lirxowo-blog-assets/ai-radar";
const OUTPUT_FILE = "data.json";
const USER_AGENT = "lirxowo-blog-ai-radar";
const REQUEST_TIMEOUT_MS = 25000;

const STATUS_PAGES = [
	{ name: "OpenAI", url: "https://status.openai.com" },
	{ name: "Claude", url: "https://status.claude.com" },
];

const STORY_QUERIES = ["OpenAI", "Anthropic", "LLM", "AI agent", "GPT"];
const STORY_WINDOW_DAYS = 7;
const STORY_MIN_POINTS = 20;
const STORY_PER_QUERY = 12;
const STORY_LIMIT = 8;

const CODEX_RADAR_URL =
	"https://codexradar.com/data/intelligence-efficiency.json";
// 运行次数过少的样本 IQ 波动极大，排行里排除掉
const CODEX_MIN_RUNS = 10;
const CODEX_LIMIT = 60;

const MODEL_LIMIT = 8;
const REPO_WINDOW_DAYS = 14;
const REPO_LIMIT = 6;

async function getJson(url) {
	const response = await fetch(url, {
		headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		redirect: "follow",
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	return response.json();
}

function daysAgo(days) {
	return Date.now() - days * 24 * 60 * 60 * 1000;
}

async function fetchStatus() {
	return Promise.all(
		STATUS_PAGES.map(async ({ name, url }) => {
			const data = await getJson(`${url}/api/v2/summary.json`);
			return {
				name,
				url,
				indicator: data.status?.indicator ?? "unknown",
				description: data.status?.description ?? "",
				incidents: (data.incidents ?? []).slice(0, 3).map((incident) => ({
					name: incident.name,
					status: incident.status,
					url: incident.shortlink,
					updatedAt: incident.updated_at,
				})),
			};
		}),
	);
}

async function fetchStories() {
	const since = Math.floor(daysAgo(STORY_WINDOW_DAYS) / 1000);
	const filters = `created_at_i>${since},points>${STORY_MIN_POINTS}`;
	const results = await Promise.allSettled(
		STORY_QUERIES.map((query) =>
			getJson(
				`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}` +
					`&tags=story&numericFilters=${encodeURIComponent(filters)}` +
					`&hitsPerPage=${STORY_PER_QUERY}`,
			),
		),
	);

	const seen = new Map();
	for (const result of results) {
		if (result.status !== "fulfilled") continue;
		for (const hit of result.value.hits ?? []) {
			if (!hit.title || seen.has(hit.objectID)) continue;
			seen.set(hit.objectID, {
				title: hit.title,
				url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
				discussUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
				points: hit.points ?? 0,
				comments: hit.num_comments ?? 0,
				createdAt: hit.created_at,
			});
		}
	}

	if (seen.size === 0) {
		throw new Error("no stories matched");
	}
	return [...seen.values()]
		.sort((a, b) => b.points - a.points)
		.slice(0, STORY_LIMIT);
}

async function fetchModels() {
	const data = await getJson(
		`https://huggingface.co/api/models?sort=trendingScore&limit=${MODEL_LIMIT}`,
	);
	return data.map((model) => ({
		id: model.id,
		url: `https://huggingface.co/${model.id}`,
		likes: model.likes ?? 0,
		downloads: model.downloads ?? 0,
		task: model.pipeline_tag ?? "",
	}));
}

async function fetchRepos() {
	const pushedSince = new Date(daysAgo(REPO_WINDOW_DAYS))
		.toISOString()
		.slice(0, 10);
	const query = `topic:llm pushed:>${pushedSince}`;
	const data = await getJson(
		`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}` +
			`&sort=stars&order=desc&per_page=${REPO_LIMIT}`,
	);
	return (data.items ?? []).map((repo) => ({
		name: repo.full_name,
		url: repo.html_url,
		description: repo.description ?? "",
		stars: repo.stargazers_count ?? 0,
		language: repo.language ?? "",
		pushedAt: repo.pushed_at,
	}));
}

async function fetchCodex() {
	const data = await getJson(CODEX_RADAR_URL);
	const points = (data.points ?? [])
		.filter(
			(point) =>
				Number(point.total_runs) >= CODEX_MIN_RUNS &&
				Number.isFinite(Number(point.iq)),
		)
		.sort((a, b) => Number(b.iq) - Number(a.iq))
		.slice(0, CODEX_LIMIT)
		.map((point) => ({
			model: point.model,
			effort: point.effort,
			iq: Number(point.iq),
			price: Number(point.average_price_usd),
			minutes: Number(point.average_minutes),
			runs: Number(point.total_runs),
		}));

	if (points.length === 0) {
		throw new Error("no codex points");
	}
	return { sourceUpdatedAt: data.source_updated_at ?? null, points };
}

async function main() {
	const sections = {
		status: fetchStatus,
		stories: fetchStories,
		models: fetchModels,
		repos: fetchRepos,
		codex: fetchCodex,
	};

	const payload = { updatedAt: new Date().toISOString(), errors: [] };
	const settled = await Promise.allSettled(
		Object.values(sections).map((task) => task()),
	);

	Object.keys(sections).forEach((key, index) => {
		const result = settled[index];
		if (result.status === "fulfilled") {
			payload[key] = result.value;
		} else {
			// 单个源失败不影响其他板块，页面据此显示为不可用
			payload[key] = null;
			payload.errors.push(`${key}: ${result.reason?.message ?? "failed"}`);
		}
	});

	await fs.mkdir(OUTPUT_DIR, { recursive: true });
	const target = path.join(OUTPUT_DIR, OUTPUT_FILE);
	const temp = `${target}.tmp`;
	await fs.writeFile(temp, `${JSON.stringify(payload)}\n`);
	await fs.rename(temp, target);

	const counts = Object.keys(sections)
		.map((key) => {
			const value = payload[key];
			if (!value) return `${key}=×`;
			return `${key}=${Array.isArray(value) ? value.length : (value.points?.length ?? 1)}`;
		})
		.join(" ");
	console.log(`✅ ${counts}`);
	if (payload.errors.length > 0) {
		console.warn(`⚠ ${payload.errors.join(" | ")}`);
	}
}

main().catch((error) => {
	console.error(`❌ ${error.message}`);
	process.exit(1);
});
