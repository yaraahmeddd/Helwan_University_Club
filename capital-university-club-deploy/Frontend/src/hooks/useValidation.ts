import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ValidationTranslator } from '../lib/validation/zodBuilders';
import {
  createMemberEditSchema,
  createRegisterSchema,
  createStaffFormSchema,
} from '../lib/validation/schemas';

/** Returns a translator bound to the `validation` i18n namespace. */
export function useValidationTranslator(): ValidationTranslator {
  const { t } = useTranslation('validation');
  return useMemo(
    () => (key: string, params?: Record<string, string | number>) => t(key, params),
    [t],
  );
}

export function useRegisterSchema() {
  const vt = useValidationTranslator();
  return useMemo(() => createRegisterSchema(vt), [vt]);
}

export function useMemberEditSchema() {
  const vt = useValidationTranslator();
  return useMemo(() => createMemberEditSchema(vt), [vt]);
}

export function useStaffFormSchema() {
  const vt = useValidationTranslator();
  return useMemo(() => createStaffFormSchema(vt), [vt]);
}
