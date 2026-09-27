import { redirect } from 'next/navigation';

export default function DashboardUserRedirect() {
  redirect('/user');
}
