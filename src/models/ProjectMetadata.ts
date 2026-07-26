import { Student } from './Student';

export interface ProjectMetadata {
    projectTitle: string;
    department: string;
    school: string;
    programme: string;
    level: string;
    session: string;
    supervisor: string;
    submissionDate: string;
    students: Student[];
}
