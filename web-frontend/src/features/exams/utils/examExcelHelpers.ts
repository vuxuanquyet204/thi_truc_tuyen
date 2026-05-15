import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Exam } from '@/foundation/types';

// Export exams to Excel
export const exportExamsToExcel = (exams: Exam[], fileName = 'Danh_sach_de_thi') => {
  const data = exams.map(exam => ({
    'ID': exam.id,
    'Tieu de': exam.title,
    'Mo ta': exam.description || '',
    'Mon hoc': exam.subject,
    'Loai bai thi': exam.type === 'practice' ? 'Luyen tap' :
      exam.type === 'quiz' ? 'Kiem tra' :
      exam.type === 'midterm' ? 'Giua ky' :
      exam.type === 'final' ? 'Cuoi ky' : 'Bai tap',
    'So cau hoi': exam.totalQuestions,
    'Thoi gian (phut)': exam.duration,
    'Tong diem': exam.totalPoints,
    'Diem dat': exam.passingScore,
    'Do kho': exam.difficulty === 'easy' ? 'De' :
      exam.difficulty === 'medium' ? 'Trung binh' : 'Kho',
    'Trang thai': exam.status === 'draft' ? 'Nhap' :
      exam.status === 'published' ? 'Da xuat ban' :
      exam.status === 'ongoing' ? 'Dang dien ra' :
      exam.status === 'ended' ? 'Da ket thuc' : 'Luu tru',
    'So lan thi toi da': exam.maxAttempts,
    'Xem lai cau hoi': exam.allowReview ? 'Co' : 'Khong',
    'Tron cau hoi': exam.shuffleQuestions ? 'Co' : 'Khong',
    'Hien thi ket qua': exam.showResults ? 'Co' : 'Khong',
    'Nguoi tao': exam.createdBy,
    'Ngay tao': new Date(exam.createdAt).toLocaleDateString('vi-VN'),
    'Ngay bat dau': exam.startDate ? new Date(exam.startDate).toLocaleDateString('vi-VN') : '',
    'Ngay ket thuc': exam.endDate ? new Date(exam.endDate).toLocaleDateString('vi-VN') : ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const colWidths = [
    { wch: 10 }, { wch: 40 }, { wch: 50 }, { wch: 20 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'De thi');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}.xlsx`);
};

// Import exams from Excel
export const importExamsFromExcel = (file: File): Promise<Partial<Exam>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        if (data.length < 2) {
          reject(new Error('File Excel khong co du lieu hoac thieu header.'));
          return;
        }

        const headers = data[0].map(h => String(h).trim());
        const exams: Partial<Exam>[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const exam: Partial<Exam> = {};

          headers.forEach((header, index) => {
            const value = row[index];
            switch (header) {
              case 'Tieu de': exam.title = String(value); break;
              case 'Mo ta': exam.description = value ? String(value) : ''; break;
              case 'Mon hoc': exam.subject = String(value); break;
              case 'Loai bai thi':
                if (value === 'Luyen tap') exam.type = 'practice';
                else if (value === 'Kiem tra') exam.type = 'quiz';
                else if (value === 'Giua ky') exam.type = 'midterm';
                else if (value === 'Cuoi ky') exam.type = 'final';
                else exam.type = 'assignment';
                break;
              case 'So cau hoi': exam.totalQuestions = parseInt(String(value)) || 0; break;
              case 'Thoi gian (phut)': exam.duration = parseInt(String(value)) || 0; break;
              case 'Tong diem': exam.totalPoints = parseInt(String(value)) || 0; break;
              case 'Diem dat': exam.passingScore = parseInt(String(value)) || 0; break;
              case 'Do kho':
                if (value === 'De') exam.difficulty = 'easy';
                else if (value === 'Trung binh') exam.difficulty = 'medium';
                else exam.difficulty = 'hard';
                break;
              case 'Trang thai':
                if (value === 'Nhap') exam.status = 'draft';
                else if (value === 'Da xuat ban') exam.status = 'published';
                else exam.status = 'draft';
                break;
              case 'So lan thi toi da': exam.maxAttempts = parseInt(String(value)) || 1; break;
              case 'Xem lai cau hoi': exam.allowReview = value === 'Co'; break;
              case 'Tron cau hoi': exam.shuffleQuestions = value === 'Co'; break;
              case 'Hien thi ket qua': exam.showResults = value === 'Co'; break;
              case 'Nguoi tao': exam.createdBy = value ? String(value) : 'Import'; break;
            }
          });

          if (exam.title && exam.subject && exam.totalQuestions && exam.duration) {
            if (!exam.type) exam.type = 'practice';
            if (!exam.difficulty) exam.difficulty = 'medium';
            if (!exam.status) exam.status = 'draft';
            if (!exam.totalPoints) exam.totalPoints = exam.totalQuestions * 10;
            if (!exam.passingScore) exam.passingScore = Math.floor(exam.totalPoints * 0.5);
            if (!exam.maxAttempts) exam.maxAttempts = 3;
            if (exam.allowReview === undefined) exam.allowReview = true;
            if (exam.shuffleQuestions === undefined) exam.shuffleQuestions = true;
            if (exam.showResults === undefined) exam.showResults = true;
            if (!exam.createdBy) exam.createdBy = 'Import';
            exams.push(exam);
          }
        }
        resolve(exams);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Download Excel template
export const downloadExamTemplate = () => {
  const headers = [
    'Tieu de', 'Mo ta', 'Mon hoc', 'Loai bai thi', 'So cau hoi',
    'Thoi gian (phut)', 'Tong diem', 'Diem dat', 'Do kho',
    'Trang thai', 'So lan thi toi da', 'Xem lai cau hoi',
    'Tron cau hoi', 'Hien thi ket qua'
  ];
  const sampleRow = [
    'De thi mau - Lap trinh Web', 'De thi kiem tra kien thuc HTML, CSS, JavaScript',
    'Lap trinh Web', 'Kiem tra', 30, 60, 300, 150, 'Trung binh',
    'Nhap', 3, 'Co', 'Co', 'Co'
  ];

  const data = [headers, sampleRow];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 40 }, { wch: 50 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
    { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau de thi');

  const instructions = [
    ['HUONG DAN NHAP DU LIEU DE THI'], [''],
    ['1. Giu nguyen ten cac cot (dong dau tien)'],
    ['2. Dien du lieu tu dong thu 2 tro di'],
    ['3. Cac truong bat buoc: Tieu de, Mon hoc, So cau hoi, Thoi gian'],
    [''], ['GIA TRI HOP LE:'], [''],
    ['Loai bai thi:', 'Luyen tap, Kiem tra, Giua ky, Cuoi ky, Bai tap'],
    ['Do kho:', 'De, Trung binh, Kho'],
    ['Trang thai:', 'Nhap, Da xuat ban'],
    ['Yes/No fields:', 'Co hoac Khong'],
    [''], ['LUU Y:'],
    ['- So cau hoi, Thoi gian, Diem phai la so nguyen duong'],
    ['- Diem dat khong duoc lon hon Tong diem'],
    ['- Neu khong dien Tong diem, he thong tu tinh = So cau x 10'],
    ['- Neu khong dien Diem dat, he thong tu tinh = 50% Tong diem']
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 50 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Huong dan');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'Mau_nhap_de_thi.xlsx');
};
