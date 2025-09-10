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
  searchable?: boolean;
  searchPlaceholder?: string;
  filterFields?: string[];
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
  searchable = false,
  searchPlaceholder = 'Buscar...',
  filterFields,
  onRowClick,
}: TableProps<T>) {
  const [search, setSearch] = React.useState('');

  // Determinar campos filtrables
  const filterableKeys = filterFields && filterFields.length > 0
    ? filterFields
    : columns.map(col => col.key);

  // Filtrado interno si searchable
  const filteredData = searchable && search.trim() !== ''
    ? data.filter(item =>
      filterableKeys.some(key =>
        String(item[key as keyof T] ?? '').toLowerCase().includes(search.toLowerCase())
      )
    )
    : data;

  return (
    <>
      {searchable && (
        <div className="mb-4 flex justify-end">
          <div className="relative w-full sm:w-80 lg:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm shadow-sm
             focus:border-primary-500 focus:ring-1 focus:ring-primary-500 
             focus:outline-none transition"
            />
          </div>
        </div>
      )}
      <div className="
        overflow-x-auto overflow-y-auto max-h-[60vh] 
        bg-white shadow-md rounded-lg overflow-hidden 
        [scrollbar-width:thin] 
        [scrollbar-color:#9ca3af_#f3f4f6] 
        [&::-webkit-scrollbar]:w-2 
        [&::-webkit-scrollbar-track]:bg-gray-100 
        [&::-webkit-scrollbar-thumb]:bg-gray-400 
        [&::-webkit-scrollbar-thumb]:rounded-md">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
          <thead className="bg-primary-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-bold text-primary-50 uppercase tracking-wider ${column.className || ''} ${headerClassName}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-[#d9d9d9] divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-primary-50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={`${onRowClick ? 'hover:bg-primary-50 cursor-pointer ' : ''}${rowClassName}`}
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
    </>
  );
}

type TableContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function TableContainer({ children, className = '' }: TableContainerProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

// Exportar como default para compatibilidad con importaciones existentes
export default Table;
