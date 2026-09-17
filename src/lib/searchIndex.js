export function calculateAge(dobString) {
  if (!dobString) {
    return { age: null, isValid: false, error: 'Date of birth is required' };
  }
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return { age: null, isValid: false, error: 'Invalid date format' };
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const isValid = age >= 6 && age <= 20;
  let error = null;
  if (age < 6) error = 'Child must be at least 6 years old.';
  if (age > 20) error = 'Student exceeds age limit (max 20 yrs).';

  return { age, isValid, error };
}

export function searchStudents(query, students = [], filterGrade = 'ALL') {
  if (!students || students.length === 0) return [];
  
  const q = (query || '').toLowerCase().trim();
  
  return students.filter(student => {
    if (filterGrade !== 'ALL') {
      if (filterGrade === 'Primary' && !['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5'].includes(student.grade)) return false;
      if (filterGrade === 'Middle' && !['Grade 6','Grade 7','Grade 8'].includes(student.grade)) return false;
      if (filterGrade === 'High' && !['Grade 9','Grade 10'].includes(student.grade)) return false;
      if (filterGrade === 'Senior' && !['Grade 11','Grade 12'].includes(student.grade)) return false;
      if (!['Primary','Middle','High','Senior'].includes(filterGrade) && student.grade !== filterGrade) return false;
    }

    if (!q) return true;

    const nameMatch = (student.fullName || '').toLowerCase().includes(q);
    const idMatch = (student.studentId || '').toLowerCase().includes(q);
    const guardianMatch = (student.guardianName || '').toLowerCase().includes(q);
    const phoneMatch = (student.primaryPhone || '').replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
    const gradeMatch = (student.grade || '').toLowerCase().includes(q);

    return nameMatch || idMatch || guardianMatch || phoneMatch || gradeMatch;
  });
}
