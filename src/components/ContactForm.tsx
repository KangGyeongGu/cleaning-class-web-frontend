"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
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
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: string) => {
    setIsOpen(false);
    onChange?.(option);
  };

  return (
    <div className="group" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-900 tracking-wider mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light text-left flex justify-between items-center"
        >
          <span className={value ? "text-slate-900" : "text-slate-400"}>
            {value || placeholder || "선택해주세요"}
          </span>
          <ArrowDown size={16} className="text-slate-400" />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 shadow-lg max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-3 hover:bg-slate-50 text-lg font-light text-left transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" name={name} value={value} />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
    <section id="contact" className="py-32 bg-white">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            CONTACT
          </h2>
          {phone && (
            <p className="mt-3 text-slate-600 text-sm">
              유선상담{" "}
              <a
                href={`tel:${phone}`}
                className="font-bold text-slate-900 hover:underline"
              >
                {phone}
              </a>
            </p>
          )}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          action={formAction}
          className="space-y-12"
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label
                  htmlFor="name"
                  className="block text-xs font-bold text-slate-900 tracking-wider mb-3"
                >
                  성함
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-400"
                  placeholder="이름을 입력하세요"
                  onInput={checkFormValidity}
                />
                {state?.errors?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>
              <div className="group">
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold text-slate-900 tracking-wider mb-3"
                >
                  연락처
                  <span className="text-red-500 ml-1">*</span>
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
                  className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-400"
                  placeholder="010-0000-0000"
                />
                {state?.errors?.phone && (
                  <p className="text-red-500 text-xs mt-1">
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
                className="block text-xs font-bold text-slate-900 tracking-wider mb-3"
              >
                문의사항
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                ref={messageRef}
                id="message"
                name="message"
                rows={6}
                maxLength={1000}
                required
                className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-400 resize-none overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                placeholder="문의 내용을 자유롭게 작성해주세요"
                onInput={(e) => {
                  setMessageLength(e.currentTarget.value.length);
                  checkFormValidity();
                }}
              ></textarea>
              <div className="flex justify-between mt-1">
                <div>
                  {state?.errors?.message && (
                    <p className="text-red-500 text-xs">
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
                        // eslint-disable-next-line @eslint-react/no-array-index-key -- File objects need index for stable keys during add/remove operations
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="relative w-20 h-20 group/image"
                        >
                          <Image
                            src={previewUrls[index]}
                            alt={`첨부 이미지 ${index + 1}`}
                            fill
                            unoptimized
                            sizes="80px"
                            className="object-cover border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 파일 추가 버튼 */}
                  <label className="flex items-center gap-3 cursor-pointer group/add flex-shrink-0">
                    <div className="w-12 h-12 border border-slate-200 flex items-center justify-center text-slate-400 group-hover/add:border-slate-900 group-hover/add:text-slate-900 transition-colors">
                      <Plus size={20} />
                    </div>
                    <span className="text-xs text-slate-400 group-hover/add:text-slate-600 transition-colors whitespace-nowrap">
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

          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={isPending || !formValid}
              className={`px-12 py-4 font-bold text-sm tracking-widest transition-all disabled:cursor-not-allowed ${
                formValid && !isPending
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-400 border border-slate-200"
              }`}
            >
              {isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" /> 문의 중...
                </span>
              ) : showSuccess ? (
                <span className="flex items-center gap-2 justify-center">
                  <Check className="w-4 h-4" /> 전송 완료
                </span>
              ) : (
                "문의하기"
              )}
            </button>
            {showSuccess && state?.message && (
              <p className="text-green-600 text-sm mt-4">{state.message}</p>
            )}
            {state?.error && (
              <p className="text-red-600 text-sm mt-4">{state.error}</p>
            )}
          </div>
        </motion.form>
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
