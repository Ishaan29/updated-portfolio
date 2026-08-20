import { redirect } from 'next/navigation';

// /project on its own isn't a link — send visitors home rather than letting the
// [company] catch-all log a phantom company named "project".
export default function ProjectIndex() {
    redirect('/');
}
