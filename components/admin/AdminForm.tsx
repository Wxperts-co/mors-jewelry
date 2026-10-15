'use client';

import React from 'react';
import {
  useForm,
  FieldValues,
  Path,
  DefaultValues,
  SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Check, ArrowRight, Upload, Trash2, ImageIcon } from 'lucide-react';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'image';

export interface FormSelectOption {
  label: string;
  value: string | number;
}

export interface AdminFormField<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FormSelectOption[]; // for 'select'
  rows?: number; // for 'textarea'
  colSpan?: 1 | 2; // 1 = half width, 2 = full width in a 2-col layout
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
}

export interface AdminFormProps<T extends FieldValues> {
  schema: z.ZodType<T, any, any>;
  fields: AdminFormField<T>[];
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
}

export function AdminForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  title,
  subtitle,
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  onCancel,
  isLoading = false,
  successMessage,
  errorMessage,
}: AdminFormProps<T>) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      {(title || subtitle) && (
        <div className="p-5 sm:p-6 border-b border-neutral-100">
          {title && (
            <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-900 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 sm:p-6 space-y-6">
        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {fields.map((field) => {
            const fieldError = errors[field.name]?.message as string | undefined;
            const isFullWidth = field.colSpan === 2 || field.type === 'textarea' || field.type === 'image';

            return (
              <div
                key={String(field.name)}
                className={isFullWidth ? 'sm:col-span-2' : 'sm:col-span-1'}
              >
                {/* Field Label */}
                {field.type !== 'checkbox' && field.type !== 'switch' && (
                  <label
                    htmlFor={String(field.name)}
                    className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5"
                  >
                    {field.label}
                    {field.required && <span className="text-[#8F6B1E] ml-1">*</span>}
                  </label>
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <textarea
                    id={String(field.name)}
                    rows={field.rows || 4}
                    placeholder={field.placeholder}
                    disabled={field.disabled || busy}
                    {...register(field.name)}
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-neutral-900 text-xs sm:text-sm rounded-xl outline-none transition-colors focus:bg-white resize-y ${
                      fieldError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-neutral-200 focus:border-[#D4AF37]'
                    }`}
                  />
                )}

                {/* Select Dropdown */}
                {field.type === 'select' && (
                  <select
                    id={String(field.name)}
                    disabled={field.disabled || busy}
                    {...register(field.name)}
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-neutral-900 text-xs sm:text-sm rounded-xl outline-none transition-colors focus:bg-white ${
                      fieldError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-neutral-200 focus:border-[#D4AF37]'
                    }`}
                  >
                    {field.placeholder && (
                      <option value="">{field.placeholder}</option>
                    )}
                    {field.options?.map((opt) => (
                      <option key={String(opt.value)} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Checkbox / Switch */}
                {(field.type === 'checkbox' || field.type === 'switch') && (
                  <label className="flex items-center gap-3 cursor-pointer select-none pt-2">
                    <input
                      type="checkbox"
                      id={String(field.name)}
                      disabled={field.disabled || busy}
                      {...register(field.name)}
                      className="w-4 h-4 rounded text-[#8F6B1E] border-neutral-300 focus:ring-[#D4AF37]"
                    />
                    <span className="text-xs font-semibold text-neutral-800">
                      {field.label}
                      {field.required && <span className="text-[#8F6B1E] ml-1">*</span>}
                    </span>
                  </label>
                )}

                {/* Image Upload Field */}
                {field.type === 'image' && (
                  <div className="space-y-2">
                    <input type="hidden" {...register(field.name)} />
                    {watch(field.name) ? (
                      <div className="relative flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 group">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={String(watch(field.name))}
                            alt="Uploaded Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-neutral-800 truncate">
                            {String(watch(field.name)).split('/').pop() || 'Product image'}
                          </p>
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <Check className="w-3.5 h-3.5" /> Ready for catalog
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-neutral-300 hover:border-[#D4AF37] text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>Change</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={field.disabled || busy}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  const res = await fetch('/api/admin/upload', {
                                    method: 'POST',
                                    body: fd,
                                  });
                                  const json = await res.json();
                                  if (json.success && json.url) {
                                    setValue(field.name, json.url as any, { shouldValidate: true, shouldDirty: true });
                                    return;
                                  }
                                } catch {
                                  // fallback
                                }
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setValue(field.name, reader.result as any, { shouldValidate: true, shouldDirty: true });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setValue(field.name, '' as any, { shouldValidate: true, shouldDirty: true })}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                          fieldError
                            ? 'border-red-300 bg-red-50/20'
                            : 'border-neutral-200 hover:border-[#D4AF37] bg-neutral-50/50 hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-xs mb-2 text-[#8F6B1E]">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-800">
                          Click to upload or drag & drop product photo
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5">
                          PNG, JPG, WEBP, or GIF (max 5MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={field.disabled || busy}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const fd = new FormData();
                              fd.append('file', file);
                              const res = await fetch('/api/admin/upload', {
                                method: 'POST',
                                body: fd,
                              });
                              const json = await res.json();
                              if (json.success && json.url) {
                                setValue(field.name, json.url as any, { shouldValidate: true, shouldDirty: true });
                                return;
                              }
                            } catch {
                              // fallback
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setValue(field.name, reader.result as any, { shouldValidate: true, shouldDirty: true });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Standard Inputs (text, email, password, number, url) */}
                {field.type !== 'textarea' &&
                  field.type !== 'select' &&
                  field.type !== 'checkbox' &&
                  field.type !== 'switch' &&
                  field.type !== 'image' && (
                    <input
                      id={String(field.name)}
                      type={field.type || 'text'}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      disabled={field.disabled || busy}
                      {...register(field.name, {
                        valueAsNumber: field.type === 'number',
                      })}
                      className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-neutral-900 text-xs sm:text-sm rounded-xl outline-none transition-colors focus:bg-white ${
                        fieldError
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-neutral-200 focus:border-[#D4AF37]'
                      }`}
                    />
                  )}

                {/* Field Description */}
                {field.description && (
                  <p className="text-[11px] text-neutral-500 mt-1">{field.description}</p>
                )}

                {/* Field Error Message */}
                {fieldError && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldError}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="submit"
            disabled={busy}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-xs hover:brightness-105 active:scale-98 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminForm;
