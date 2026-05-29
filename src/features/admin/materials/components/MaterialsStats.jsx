import { AlertTriangle, Boxes, CircleDollarSign, Truck } from 'lucide-react';
import Card from '@/features/admin/dashboard/components/Card';

const icons = {
  Boxes,
  CircleDollarSign,
  AlertTriangle,
  Truck,
};

export default function MaterialsStats({ stats = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = icons[item.icon] ?? Boxes;

        return <Card key={item.title} title={item.title} value={item.value} description={item.description} icon={Icon} className="h-full" />;
      })}
    </div>
  );
}