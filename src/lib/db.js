import { openDB } from 'idb';

const DB_NAME = 'ProjectUsaariDB';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('students')) {
        const studentStore = db.createObjectStore('students', { keyPath: 'studentId' });
        studentStore.createIndex('grade', 'grade', { unique: false });
        studentStore.createIndex('status', 'status', { unique: false });
        studentStore.createIndex('fullName', 'fullName', { unique: false });
      }

      if (!db.objectStoreNames.contains('attendance')) {
        const attStore = db.createObjectStore('attendance', { keyPath: 'recordId' });
        attStore.createIndex('date', 'date', { unique: false });
        attStore.createIndex('studentId', 'studentId', { unique: false });
        attStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('sync_outbox')) {
        db.createObjectStore('sync_outbox', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

const DEFAULT_STUDENTS = [
  {
    studentId: 'UES-2026-0001',
    fullName: 'Aman Sharma',
    gender: 'male',
    dateOfBirth: '2012-05-14',
    calculatedAge: 14,
    bloodGroup: 'B+',
    grade: 'Grade 8',
    shift: 'Evening Shift',
    admissionDate: '2026-01-10',
    status: 'active',
    guardianName: 'Rajesh Sharma',
    guardianRelationship: 'Father',
    primaryPhone: '+91 98765-43210',
    emergencyPhone: '+91 98765-01234',
    residentialAddress: 'Giaspura, Ludhiana'
  },
  {
    studentId: 'UES-2026-0002',
    fullName: 'Priya Verma',
    gender: 'female',
    dateOfBirth: '2013-09-22',
    calculatedAge: 13,
    bloodGroup: 'O+',
    grade: 'Grade 7',
    shift: 'Evening Shift',
    admissionDate: '2026-01-12',
    status: 'active',
    guardianName: 'Sunita Verma',
    guardianRelationship: 'Mother',
    primaryPhone: '+91 98721-55443',
    emergencyPhone: '+91 98721-99881',
    residentialAddress: 'Shimlapuri, Ludhiana'
  },
  {
    studentId: 'UES-2026-0003',
    fullName: 'Rahul Kumar',
    gender: 'male',
    dateOfBirth: '2011-02-18',
    calculatedAge: 15,
    bloodGroup: 'A+',
    grade: 'Grade 9',
    shift: 'Evening Shift',
    admissionDate: '2026-01-15',
    status: 'active',
    guardianName: 'Ramesh Kumar',
    guardianRelationship: 'Father',
    primaryPhone: '+91 98144-77665',
    emergencyPhone: '+91 98144-33221',
    residentialAddress: 'Dhandari Kalan, Ludhiana'
  },
  {
    studentId: 'UES-2026-0004',
    fullName: 'Simranjeet Kaur',
    gender: 'female',
    dateOfBirth: '2014-11-05',
    calculatedAge: 11,
    bloodGroup: 'AB+',
    grade: 'Grade 6',
    shift: 'Evening Shift',
    admissionDate: '2026-01-18',
    status: 'active',
    guardianName: 'Gurdeep Singh',
    guardianRelationship: 'Father',
    primaryPhone: '+91 98555-12345',
    emergencyPhone: '+91 98555-67890',
    residentialAddress: 'Sherpur, Ludhiana'
  },
  {
    studentId: 'UES-2026-0005',
    fullName: 'Mohit Yadav',
    gender: 'male',
    dateOfBirth: '2010-08-30',
    calculatedAge: 16,
    bloodGroup: 'O+',
    grade: 'Grade 10',
    shift: 'Evening Shift',
    admissionDate: '2026-02-01',
    status: 'active',
    guardianName: 'Ram Yadav',
    guardianRelationship: 'Father',
    primaryPhone: '+91 97800-44332',
    emergencyPhone: '+91 97800-11223',
    residentialAddress: 'Focal Point, Ludhiana'
  }
];

export async function getAllStudents() {
  const db = await getDB();
  const students = await db.getAll('students');
  if (students.length === 0) {
    const tx = db.transaction('students', 'readwrite');
    for (const s of DEFAULT_STUDENTS) {
      await tx.store.put(s);
    }
    await tx.done;
    return DEFAULT_STUDENTS;
  }
  return students;
}

export async function saveStudent(student) {
  const db = await getDB();
  await db.put('students', student);
  await enqueueSync('register_student', student);
  return student;
}

export async function deleteStudent(studentId) {
  const db = await getDB();
  await db.delete('students', studentId);
  await enqueueSync('delete_student', { studentId });
}

export async function getAttendanceByDate(dateStr) {
  const db = await getDB();
  const index = db.transaction('attendance').store.index('date');
  return await index.getAll(dateStr);
}

export async function saveAttendanceRecord(record) {
  const db = await getDB();
  await db.put('attendance', record);
  await enqueueSync('mark_attendance', record);
  return record;
}

export async function saveAttendanceBatch(records) {
  const db = await getDB();
  const tx = db.transaction('attendance', 'readwrite');
  for (const r of records) {
    await tx.store.put(r);
  }
  await tx.done;
  await enqueueSync('sync_attendance_batch', { records });
  return records;
}

export async function enqueueSync(action, payload) {
  try {
    const db = await getDB();
    await db.add('sync_outbox', {
      action,
      payload,
      timestamp: Date.now(),
      synced: false
    });
  } catch (err) {
    console.error('Failed to enqueue outbox sync:', err);
  }
}

export async function getPendingOutbox() {
  const db = await getDB();
  return await db.getAll('sync_outbox');
}

export async function getSetting(key, defaultValue = null) {
  const db = await getDB();
  const row = await db.get('settings', key);
  return row ? row.value : defaultValue;
}

export async function setSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value, updatedAt: Date.now() });
}
