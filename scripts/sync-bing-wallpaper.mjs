import fs from "fs/promises";
import path from "path";

const BING_ORIGIN = "https://www.bing.com";
const BING_API = `${BING_ORIGIN}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`;
const OUTPUT_DIR = process.env.BING_WALLPAPER_DIR || "/opt/lirxowo-blog-assets/bing";
const META_FILE = "meta.json";
const VARIANTS = ["1920x1080", "1080x1920"];
const REQUEST_TIMEOUT_MS = 30000;

async function request(url) {
	const response = await fetch(url, {
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});
	if (!response.ok) {
		throw new Error(`${url} -> HTTP ${response.status}`);
	}
	return response;
}

async function readSyncedDate() {
	try {
		const meta = await fs.readFile(path.join(OUTPUT_DIR, META_FILE), "utf-8");
		return JSON.parse(meta).enddate;
	} catch {
		return null;
	}
}

async function downloadImage(url, destination) {
	const response = await request(url);
	const temp = `${destination}.tmp`;
	await fs.writeFile(temp, Buffer.from(await response.arrayBuffer()));
	await fs.rename(temp, destination);
}

async function main() {
	const { images } = await (await request(BING_API)).json();
	const image = images?.[0];
	if (!image?.urlbase || !image?.enddate) {
		throw new Error("Bing API returned an unexpected payload");
	}

	if ((await readSyncedDate()) === image.enddate) {
		console.log(`✅ Already up to date (${image.enddate})`);
		return;
	}

	await fs.mkdir(OUTPUT_DIR, { recursive: true });
	for (const variant of VARIANTS) {
		await downloadImage(
			`${BING_ORIGIN}${image.urlbase}_${variant}.jpg`,
			path.join(OUTPUT_DIR, `${variant}.jpg`),
		);
		console.log(`✅ ${variant}.jpg`);
	}

	await fs.writeFile(
		path.join(OUTPUT_DIR, META_FILE),
		`${JSON.stringify({ enddate: image.enddate, copyright: image.copyright }, null, 2)}\n`,
	);
	console.log(`🎉 Bing wallpaper updated (${image.enddate})`);
}

main().catch((error) => {
	console.error(`❌ ${error.message}`);
	process.exit(1);
});
