import React from 'react';

type ColumnDefinition<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

type TableProps<T> = {
  columns: ColumnDefinition<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  onRowClick?: (item: T) => void;
};

export function Table<T>({
  columns = [],
  data = [],
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  className = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''} ${headerClassName}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr 
                key={keyExtractor(item)}
                className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer ' : ''}${rowClassName}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={`${keyExtractor(item)}-${column.key}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${cellClassName} ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

type TableContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableContainer({ children, className = '' }: TableContainerProps) {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// Exportar como default para compatibilidad con importaciones existentes
export default Table;
