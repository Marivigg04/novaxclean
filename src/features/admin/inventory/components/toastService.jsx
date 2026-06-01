import toast from 'react-hot-toast';
import InventoryToast from './InventoryToast';

export function showInventoryToast(alert) {
  return toast.custom(
    (t) => <InventoryToast t={t} alert={alert} />,
    {
      duration: 4500,
      position: 'top-center',
    },
  );
}
