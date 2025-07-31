interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  postNom: string;
  address: string;
  dateOfBirth: string;
  maritalStatus: string;
  salary: number;
  function: string;
  createdAt: string;
  sexe: string;
  contact: string;
}

const emptyEmployee: Partial<Employee> = {
  firstName: '',
  lastName: '',
  postNom: '',
  address: '',
  dateOfBirth: '',
  maritalStatus: '',
  salary: 0,
  function: '',
  sexe: '',
  contact: '',
}; 