import LoginForm from './LoginForm';

export default function LoginPage() {
  const hasPassword = !!(process.env.AUTH_PASSWORD || process.env.ADMIN_PASSWORD);
  const devOpen = process.env.NODE_ENV === 'development' && !hasPassword;
  return <LoginForm allowPassword={hasPassword || devOpen} devPasswordOpen={devOpen} />;
}
