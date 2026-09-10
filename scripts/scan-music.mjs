import fs from "fs/promises";
import path from "path";

const MUSIC_DIR = process.env.MUSIC_DIR || "/opt/lirxowo-blog-assets/music";
const MANIFEST_FILE = "music.json";
const AUDIO_EXTENSIONS = new Set([".mp3", ".flac", ".m4a", ".ogg", ".opus", ".wav"]);
const COVER_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"];
const DEFAULT_ARTIST = "未知艺术家";

// 文件名形如「艺术家 - 曲名」时拆开，否则整体作为曲名
function parseName(basename) {
	const separator = basename.indexOf(" - ");
	if (separator > 0) {
		return {
			artist: basename.slice(0, separator).trim() || DEFAULT_ARTIST,
			title: basename.slice(separator + 3).trim() || basename,
		};
	}
	return { artist: DEFAULT_ARTIST, title: basename };
}

async function main() {
	await fs.mkdir(MUSIC_DIR, { recursive: true });
	const entries = await fs.readdir(MUSIC_DIR, { withFileTypes: true });
	const names = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
	const covers = new Set(names);

	const tracks = names
		.filter((name) => AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase()))
		.sort((a, b) => a.localeCompare(b, "zh-CN"))
		.map((name, index) => {
			const basename = name.slice(0, -path.extname(name).length);
			const { artist, title } = parseName(basename);
			// 同名图片文件作为封面，没有就留空由播放器用默认封面
			const cover = COVER_EXTENSIONS.map((ext) => `${basename}${ext}`).find((file) =>
				covers.has(file),
			);
			return {
				id: index + 1,
				title,
				artist,
				cover: cover ? `/music/${encodeURIComponent(cover)}` : "",
				url: `/music/${encodeURIComponent(name)}`,
				// 时长由浏览器读取音频元数据后填入，扫描阶段不解析
				duration: 0,
			};
		});

	const target = path.join(MUSIC_DIR, MANIFEST_FILE);
	const temp = `${target}.tmp`;
	await fs.writeFile(
		temp,
		`${JSON.stringify({ updatedAt: new Date().toISOString(), tracks })}\n`,
	);
	await fs.rename(temp, target);
	await fs.chmod(target, 0o644);

	console.log(`✅ ${tracks.length} 首`);
	for (const track of tracks) {
		console.log(`   ${track.artist} - ${track.title}`);
	}
}

main().catch((error) => {
	console.error(`❌ ${error.message}`);
	process.exit(1);
});
