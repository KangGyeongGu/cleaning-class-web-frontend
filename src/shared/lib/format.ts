/**
 * 전화번호 포맷팅 (숫자만 추출 후 하이픈 삽입)
 * @example formatPhoneNumber("01012345678") => "010-1234-5678"
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 홈페이지 메타 description.
 * Google 스니펫 채택률을 높이기 위해 자연스러운 문장형으로 작성.
 */
export function buildDescription(): string {
  return "청소클라쓰는 거주·입주·정기·상가·특수 청소부터 원룸·포장·반포장 이사까지 전문 맞춤 서비스를 제공하는 전주 1등 청소·이사업체입니다.";
}
