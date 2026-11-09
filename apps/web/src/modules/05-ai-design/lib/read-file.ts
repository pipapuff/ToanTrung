/** Đọc File thành chuỗi base64 (không kèm tiền tố data:). */
export function readFileAsBase64(file: File, errorMessage = 'Không thể đọc tệp.'): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
    reader.onerror = () => reject(new Error(errorMessage));
    reader.readAsDataURL(file);
  });
}
