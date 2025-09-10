import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from 'src/contexts/PermissionsContext';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  editPermission?: string;
  deletePermission?: string;
}

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Ver',
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  editPermission,
  deletePermission,
}: ActionButtonsProps) {
  const permissions = usePermissions();
  
  // Verificar permisos
  const canEdit = !editPermission || permissions.includes(editPermission);
  const canDelete = !deletePermission || permissions.includes(deletePermission);
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
          className="text-yellow-600 hover:text-yellow-900 border bg-yellow-50 border-yellow-500 rounded-md px-2 py-1 hover:bg-yellow-300"
          title={viewLabel}
        >
          <EyeIcon className="h-5 w-4" />
        </button>
      )}

      {onEdit && canEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-primary-600 hover:text-primary-900 border bg-gray-100 border-green-500 rounded-md px-2 py-1 hover:bg-primary-300"
          title={editLabel}
        >
          <PencilIcon className="h-5 w-4" />
        </button>
      )}

      {onDelete && canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 hover:text-red-900 hover:bg-red-300 border border-red-500 rounded-md px-2 py-1 bg-red-100"
          title={deleteLabel}
        >
          <TrashIcon className="h-5 w-4" />
        </button>
      )}
    </div>
  );
}
