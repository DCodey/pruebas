import React from 'react';

const LOADER_KEY = 'aminflowers_loader_type';

const LoaderFlor = React.lazy(() => import('./Loader'));
const LoaderGirasol = React.lazy(() => import('./LoaderGirasol'));

export default function SystemLoader(props: { [key: string]: any }) {
  const [type, setType] = React.useState('flor');

  React.useEffect(() => {
    const saved = localStorage.getItem(LOADER_KEY);
    if (saved === 'flor') setType('flor');
    else setType('girasol');
  }, []);

  return (
    <React.Suspense >
      {type === 'girasol' ? <LoaderGirasol {...props} /> : <LoaderFlor {...props} />}
    </React.Suspense>
  );
}
