export interface Teacher {
  id: string;
  name: string;
  teacherId: string;
  sex: 'Male' | 'Female';
  age: number;
  createdAt: any;
}

export interface Grade {
  id: string;
  name: string;
  createdAt: any;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  sex: 'Male' | 'Female';
  age: number;
  gradeId: string;
  createdAt: any;
}

export interface Subject {
  id: string;
  name: string;
  passkey: string;
  teacherId: string;
  gradeId: string;
  createdAt: any;
}

export interface Result {
  id: string;
  studentId: string;
  subjectId: string;
  gradeId: string;
  semester1: number | null;
  semester2: number | null;
  average: number | null;
  total: number | null;
  rank: number | null;
  status: 'Pass' | 'Fail' | 'Unfilled';
  updatedAt: any;
}

export interface Admin {
  uid: string;
  email: string;
  role: 'admin';
}
