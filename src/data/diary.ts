// 日记数据。内容来自 src/content/diary/diary.json，
// 该 JSON 已挂载到网页编辑器，可直接在浏览器中增删改。
import diaryJson from "../content/diary/diary.json";

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

const diaryData: DiaryItem[] = diaryJson as DiaryItem[];

export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	return limit && limit > 0 ? sortedData.slice(0, limit) : sortedData;
};

export const getAllTags = () =>
	Array.from(new Set(diaryData.flatMap((item) => item.tags ?? []))).sort();
