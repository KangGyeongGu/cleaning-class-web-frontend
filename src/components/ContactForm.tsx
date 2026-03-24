"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Plus, Check, Loader2, X } from "lucide-react";
import { submitContactForm } from "@/shared/actions/contact";
import { formatPhoneNumber } from "@/shared/lib/format";

// 커스텀 드롭다운 컴포넌트
interface CustomDropdownProps {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange?: (value: string) => void;
}

function CustomDropdown({
  label,
  name,
  options,
  placeholder,
  required,
  error,
  value,
  onChange,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: string) => {
    setIsOpen(false);
    onChange?.(option);
  };

  return (
    <div className="group" ref={dropdownRef}>
      <label className="mb-3 block text-xs font-bold tracking-wider text-slate-900">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-12 w-full items-center justify-between border-b border-slate-200 bg-transparent py-3 text-left text-lg font-light transition-colors outline-none focus:border-slate-900"
        >
          <span className={value ? "text-slate-900" : "text-slate-400"}>
            {value || placeholder || "선택해주세요"}
          </span>
          <ArrowDown size={16} className="text-slate-400" />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto border border-slate-200 bg-white shadow-lg [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-transparent">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-3 text-left text-lg font-light transition-colors hover:bg-slate-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" name={name} value={value} />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface ContactFormProps {
  phone?: string;
}

export function ContactForm({ phone }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    null,
  );
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [messageLength, setMessageLength] = useState<number>(0);
  const [formValid, setFormValid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [serviceType, setServiceType] = useState("");
  const [region, setRegion] = useState("");
  const [isReset, setIsReset] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isSuccess = state?.success === true;
  const showSuccess = isSuccess && !isReset;

  // 언마운트 시 최신 previewUrls를 해제하기 위한 ref
  const previewUrlsRef = useRef(previewUrls);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // IntersectionObserver로 섹션 진입 애니메이션
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 전송 성공 시 3초간 메시지 표시 후 폼 리셋
  useEffect(() => {
    if (!isSuccess || isReset) return;

    const timer = setTimeout(() => {
      // blob URL 해제
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

      // React 상태 초기화
      setImages([]);
      setPreviewUrls([]);
      setMessageLength(0);
      setFormValid(false);
      setServiceType("");
      setRegion("");
      setIsReset(true);

      // DOM 입력 필드 초기화
      if (nameRef.current) nameRef.current.value = "";
      if (phoneRef.current) phoneRef.current.value = "";
      if (messageRef.current) messageRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSuccess, isReset]);

  const checkFormValidity = () => {
    const name = nameRef.current?.value.trim() || "";
    const phoneValue = phoneRef.current?.value.trim() || "";
    const message = messageRef.current?.value.trim() || "";

    /* 리셋 완료 후 사용자가 다시 입력을 시작하면 isReset 해제 (다음 전송 사이클 허용) */
    if (isReset) setIsReset(false);

    const isValid =
      name !== "" &&
      phoneValue !== "" &&
      region !== "" &&
      serviceType !== "" &&
      message !== "";
    setFormValid(isValid);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];

    if (newImages.length > 15) {
      alert("이미지는 최대 15장까지 첨부 가능합니다.");
      return;
    }

    // 새 파일들의 blob URL 생성
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImages(newImages);
    setPreviewUrls((prev) => [...prev, ...newUrls]);

    // DataTransfer API를 사용하여 input.files 갱신
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newImages.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleImageRemove = (index: number) => {
    // 제거될 이미지의 blob URL 해제
    URL.revokeObjectURL(previewUrls[index]);

    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newUrls);

    // DataTransfer API를 사용하여 input.files 갱신
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newImages.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="bg-white py-16 md:py-32">
      <div className="container mx-auto max-w-2xl px-4">
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            CONTACT
          </h2>
          {phone && (
            <p className="mt-3 text-sm text-slate-600">
              유선상담{" "}
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-12 items-center px-1 font-bold text-slate-900 hover:underline"
              >
                {phone}
              </a>
            </p>
          )}
        </div>

        <form
          action={formAction}
          className={`space-y-12 transition-all delay-200 duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="group">
                <label
                  htmlFor="name"
                  className="mb-3 block text-xs font-bold tracking-wider text-slate-900"
                >
                  성함
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-400 focus:border-slate-900"
                  placeholder="이름을 입력하세요"
                  onInput={checkFormValidity}
                />
                {state?.errors?.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>
              <div className="group">
                <label
                  htmlFor="phone"
                  className="mb-3 block text-xs font-bold tracking-wider text-slate-900"
                >
                  연락처
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  ref={phoneRef}
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = formatPhoneNumber(input.value);
                    checkFormValidity();
                  }}
                  className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-400 focus:border-slate-900"
                  placeholder="010-0000-0000"
                />
                {state?.errors?.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {state.errors.phone[0]}
                  </p>
                )}
              </div>
            </div>

            <CustomDropdown
              label="서비스 종류"
              name="serviceType"
              options={[
                "거주청소",
                "정기청소",
                "특수청소",
                "쓰레기집청소",
                "상가청소",
                "기타 문의",
              ]}
              placeholder="서비스를 선택해주세요"
              required
              error={state?.errors?.serviceType?.[0]}
              value={serviceType}
              onChange={(value) => {
                setServiceType(value);
                setTimeout(checkFormValidity, 0);
              }}
            />

            <CustomDropdown
              label="지역"
              name="region"
              options={[
                "전주시 완산구",
                "전주시 덕진구",
                "군산시",
                "익산시",
                "정읍시",
                "남원시",
                "김제시",
                "완주군",
                "진안군",
                "무주군",
                "장수군",
                "임실군",
                "순창군",
                "고창군",
                "부안군",
              ]}
              placeholder="지역을 선택해주세요"
              required
              error={state?.errors?.region?.[0]}
              value={region}
              onChange={(value) => {
                setRegion(value);
                setTimeout(checkFormValidity, 0);
              }}
            />

            <div className="group">
              <label
                htmlFor="message"
                className="mb-3 block text-xs font-bold tracking-wider text-slate-900"
              >
                문의사항
                <span className="ml-1 text-red-500">*</span>
              </label>
              <textarea
                ref={messageRef}
                id="message"
                name="message"
                rows={6}
                maxLength={1000}
                required
                className="w-full resize-none overflow-y-auto border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-400 focus:border-slate-900 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent"
                placeholder="문의 내용을 자유롭게 작성해주세요"
                onInput={(e) => {
                  setMessageLength(e.currentTarget.value.length);
                  checkFormValidity();
                }}
              ></textarea>
              <div className="mt-1 flex justify-between">
                <div>
                  {state?.errors?.message && (
                    <p className="text-xs text-red-500">
                      {state.errors.message[0]}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {messageLength}/1000
                </span>
              </div>

              {/* 이미지 첨부 */}
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  {/* 이미지 미리보기 그리드 */}
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {images.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="group/image relative h-20 w-20"
                        >
                          <Image
                            src={previewUrls[index]}
                            alt={`첨부 이미지 ${index + 1}`}
                            fill
                            unoptimized
                            sizes="80px"
                            className="border border-slate-200 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            aria-label="이미지 삭제"
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition-opacity md:opacity-0 md:group-hover/image:opacity-100"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 파일 추가 버튼 */}
                  <label className="group/add flex shrink-0 cursor-pointer items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center border border-slate-200 text-slate-400 transition-colors group-hover/add:border-slate-900 group-hover/add:text-slate-900">
                      <Plus size={20} />
                    </div>
                    <span className="text-xs text-slate-400 transition-colors group-hover/add:text-slate-600">
                      이미지 첨부 (선택, {images.length}/15)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="images"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center">
            <button
              type="submit"
              disabled={isPending || !formValid}
              className={`px-12 py-4 text-sm font-bold tracking-widest transition-all disabled:cursor-not-allowed ${
                formValid && !isPending
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-slate-200 text-slate-400"
              }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 문의 중...
                </span>
              ) : showSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" /> 전송 완료
                </span>
              ) : (
                "문의하기"
              )}
            </button>
            {showSuccess && state?.message && (
              <p className="mt-4 text-sm text-green-600">{state.message}</p>
            )}
            {state?.error && (
              <p className="mt-4 text-sm text-red-600">{state.error}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function ArrowDown({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
