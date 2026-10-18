export default function EmptyState({ children = 'Chưa có dữ liệu.' }) {
	return <p className="py-16 text-center text-neutral-500">{children}</p>;
}
