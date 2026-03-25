/**
 * 한국 전화번호 포맷팅 유틸리티
 *
 * 지역번호 자릿수에 따라 하이픈 구분자를 삽입합니다.
 * - 2자리 지역번호 (02): 총 9자리 → 2-3-4 패턴 (02-XXX-XXXX)
 *                        총 10자리 → 2-4-4 패턴 (02-XXXX-XXXX)
 * - 3자리 지역번호 (010, 031 등): 3-4-4 패턴 → 010-XXXX-XXXX
 * - 4자리 지역번호 (0504, 0507 등): 4-4-4 패턴 → 0504-XXXX-XXXX
 *
 * @example
 * formatPhoneNumber("01012345678")  => "010-1234-5678"
 * formatPhoneNumber("021234567")    => "02-123-4567"
 * formatPhoneNumber("0212345678")   => "02-1234-5678"
 * formatPhoneNumber("050412345678") => "0504-1234-5678"
 */
export function formatPhoneNumber(value: string): string {
  // 숫자만 추출
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) return "";

  // 4자리 지역번호: 0504, 0507 등 (총 12자리)
  if (digits.startsWith("0504") || digits.startsWith("0507")) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
  }

  // 2자리 지역번호: 02 (서울)
  // 9자리 이하(구형 번호): 02-XXX-XXXX (2-3-4 패턴)
  // 10자리: 02-XXXX-XXXX (2-4-4 패턴)
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) {
      // 9자리 서울 번호: 02-XXX-XXXX (2-3-4 패턴)
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  // 기본 3자리 지역번호: 010, 011, 016, 017, 018, 019, 031 등 (총 11자리)
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}
