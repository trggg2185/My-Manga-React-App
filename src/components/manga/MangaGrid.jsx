import MangaCard from './MangaCard';

export default function MangaGrid({ mangas = [] }) {
	if (mangas.length === 0) {
		return <p className="py-16 text-center text-neutral-500">Chưa có truyện nào.</p>;
	}

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{mangas.map((manga, index) => (
				<MangaCard key={manga.id} manga={manga} index={index} />
			))}
		</div>
	);
}
