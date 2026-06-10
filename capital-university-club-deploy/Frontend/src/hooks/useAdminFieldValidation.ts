import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  filterArabicNameInput,
  filterArabicTextInput,
  filterEnglishNameInput,
  filterEnglishTextInput,
  matchesArabicText,
  matchesDigitsOnly,
  matchesEnglishText,
  validationMessage,
  type BilingualFieldVariant,
  type ValidationTranslator,
} from '../lib/validation/adminForms';
import { normalizePhone } from '../lib/validation/rules';
import type { FieldValidation } from '../lib/validation/rules';

export function useAdminFieldValidation() {
  const { t } = useTranslation('validation');

  const msg = useCallback(
    (result: FieldValidation) => validationMessage(result, t as ValidationTranslator),
    [t],
  );

  const handleArabicChange = useCallback(
    (
      value: string,
      onUpdate: (next: string) => void,
      onError: (message: string | undefined) => void,
      variant: BilingualFieldVariant = 'text',
    ) => {
      const filtered = variant === 'name' ? filterArabicNameInput(value) : filterArabicTextInput(value);
      onUpdate(filtered);
      onError(undefined);
    },
    [],
  );

  const handleEnglishChange = useCallback(
    (
      value: string,
      onUpdate: (next: string) => void,
      onError: (message: string | undefined) => void,
      variant: BilingualFieldVariant = 'text',
    ) => {
      const filtered = variant === 'name' ? filterEnglishNameInput(value) : filterEnglishTextInput(value);
      onUpdate(filtered);
      onError(undefined);
    },
    [],
  );

  const handleDigitsChange = useCallback(
    (
      value: string,
      onUpdate: (next: string) => void,
      maxLength = 14,
    ) => {
      const digits = value.replace(/\D/g, '').slice(0, maxLength);
      onUpdate(digits);
    },
    [],
  );

  const handleCodeChange = useCallback(
    (
      value: string,
      onUpdate: (next: string) => void,
      onError: (message: string | undefined) => void,
    ) => {
      const normalized = value.toUpperCase();
      if (normalized === '' || /^[A-Z0-9_-]*$/i.test(normalized)) {
        onUpdate(normalized);
        onError(undefined);
        return;
      }
      onError(t('code.invalid'));
    },
    [t],
  );

  const handleMoneyChange = useCallback(
    (value: string, onUpdate: (next: string) => void) => {
      const cleaned = value.replace(/[^\d.]/g, '');
      const parts = cleaned.split('.');
      const normalized = parts.length > 1
        ? `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`
        : parts[0];
      onUpdate(normalized);
    },
    [],
  );

  const handlePhoneChange = useCallback(
    (value: string, onUpdate: (next: string) => void, maxLength = 11) => {
      onUpdate(normalizePhone(value).replace(/\D/g, '').slice(0, maxLength));
    },
    [],
  );

  return useMemo(
    () => ({
      tVal: t as ValidationTranslator,
      msg,
      handleArabicChange,
      handleEnglishChange,
      handleDigitsChange,
      handleCodeChange,
      handleMoneyChange,
      handlePhoneChange,
      matchesArabicText,
      matchesEnglishText,
      matchesDigitsOnly,
      filterArabicTextInput,
      filterArabicNameInput,
      filterEnglishTextInput,
      filterEnglishNameInput,
    }),
    [t, msg, handleArabicChange, handleEnglishChange, handleDigitsChange, handleCodeChange, handleMoneyChange, handlePhoneChange],
  );
}
