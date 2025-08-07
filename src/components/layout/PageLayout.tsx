import React from 'react';

interface PageLayoutProps {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({ title, description, headerAction, children }: PageLayoutProps) {
  return (
    <div className="py-4">
      {/* Header */}
      <div className="mx-auto px-1 sm:px-6 md:px-8 ">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-700">{description}</p>
          </div>
          {headerAction && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              {headerAction}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-1 sm:px-6 md:px-8 mt-2">
        {children}
      </div>
    </div>
  );
}
