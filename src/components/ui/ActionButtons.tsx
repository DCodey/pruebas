import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Ver',
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
}: ActionButtonsProps) {
  // Si no hay ninguna acción, no renderiza nada
  if (!onView && !onEdit && !onDelete) return null;

  return (
    <div className="space-x-2 text-right">
      {onView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="text-primary-600 hover:text-primary-900 border bg-gray-100 border-green-200 rounded-md px-2 py-1 hover:bg-primary-200"
          title={viewLabel}
        >
          <EyeIcon className="h-5 w-4" />
        </button>
      )}

      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-primary-600 hover:text-primary-900 border bg-gray-100 border-green-200 rounded-md px-2 py-1 hover:bg-primary-200"
          title={editLabel}
        >
          <PencilIcon className="h-5 w-4" />
        </button>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 hover:text-red-900 hover:bg-red-100 border border-red-200 rounded-md px-2 py-1 bg-red-50"
          title={deleteLabel}
        >
          <TrashIcon className="h-5 w-4" />
        </button>
      )}
    </div>
  );
}
