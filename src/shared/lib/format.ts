/**
 * 전화번호 포맷팅 (숫자만 추출 후 하이픈 삽입)
 * @example formatPhoneNumber("01012345678") => "010-1234-5678"
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}
