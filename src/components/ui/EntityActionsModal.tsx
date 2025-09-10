import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePermissions } from 'src/contexts/PermissionsContext';

export interface EntityField {
    key: string;
    label: string;
    render?: (value: any, entity: any) => React.ReactNode;
    className?: string;
}

interface EntityActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    entity: any;
    title: string;
    fields: EntityField[];
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    viewLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
    viewPermission?: string;
    editPermission?: string;
    deletePermission?: string;
}

export default function EntityActionsModal({
    isOpen,
    onClose,
    entity,
    title,
    fields,
    onEdit,
    onDelete,
    onView,
    viewLabel = 'Ver',
    editLabel = 'Editar',
    deleteLabel = 'Eliminar',
    viewPermission,
    editPermission,
    deletePermission,
}: EntityActionsModalProps) {
    if (!isOpen || !entity) return null;

    const permissions = usePermissions();
    const canView = !viewPermission || permissions.includes(viewPermission);
    const canEdit = !editPermission || permissions.includes(editPermission);
    const canDelete = !deletePermission || permissions.includes(deletePermission);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                {/* Fondo oscuro */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                {/* Contenido del modal */}
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                        <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            onClick={onClose}
                        >
                            <span className="sr-only">Cerrar</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                {title}
                            </h3>

                            <div className="mt-4 space-y-2 text-sm text-gray-500">
                                {fields.map((field) => {
                                    const value = entity[field.key];
                                    const renderedValue = field.render
                                        ? field.render(value, entity)
                                        : value || 'No especificado';

                                    return (
                                        <div key={field.key} className={field.className}>
                                            <span className="font-medium">{field.label}:</span>
                                            <span className="ml-2">{renderedValue}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Botones de acción */}
                            {((onView && canView) || (onEdit && canEdit) || (onDelete && canDelete)) && (
                                <div className="mt-6 flex justify-between gap-3">
                                    {onView && canView && (
                                        <div className="flex-1">

                                            <button
                                                type="button"
                                                onClick={onView}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-yellow-500 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-600 shadow-sm hover:bg-yellow-100 focus:outline-none"
                                            >
                                                <span className="h-4 w-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </span>
                                                {viewLabel}
                                            </button>

                                        </div>
                                    )}
                                    {onEdit && canEdit && (
                                        <div className="flex-1">

                                            <button
                                                type="button"
                                                onClick={onEdit}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-green-500 bg-gray-100 px-3 py-2 text-sm font-medium text-primary-600 shadow-sm hover:bg-primary-300 focus:outline-none"
                                            >
                                                <span className="h-4 w-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </span>
                                                {editLabel}
                                            </button>

                                        </div>
                                    )}
                                    {onDelete && canDelete && (
                                        <div className="flex-1">

                                            <button
                                                type="button"
                                                onClick={onDelete}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500 bg-red-100 px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-300 focus:outline-none"
                                            >
                                                <span className="h-4 w-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </span>
                                                {deleteLabel}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
