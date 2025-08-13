import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../src/routes/paths';

export default function Index() {
  return <Navigate to={ROUTES.LOGIN} replace />;
}
