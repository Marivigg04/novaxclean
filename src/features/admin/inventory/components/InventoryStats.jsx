import Card from '@/features/admin/dashboard/components/Card';

export default function InventoryStats({ stats = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.title} {...item} className="h-full" />
      ))}
    </div>
  );
}
