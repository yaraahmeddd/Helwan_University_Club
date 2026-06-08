/**
 * Internationalization (i18n) Module
 * Handles multilingual support for English and Arabic
 */
type Language = 'en' | 'ar';
/**
 * Get message in specified language
 * @param key - Message key
 * @param language - Language code ('en' or 'ar')
 * @returns Localized message string
 */
export declare function getMessage(key: string, language?: Language): string;
/**
 * Extract language from request headers
 * Checks 'Accept-Language' or 'X-Language' header
 * Defaults to 'en' if not specified
 * @param req - Express Request object
 * @returns Language code ('en' or 'ar')
 */
export declare function getLanguageFromRequest(req: any): Language;
/**
 * Create localized response
 * @param success - Success status
 * @param messageKey - Message key for localization
 * @param language - Language code
 * @param data - Response data
 * @returns Localized response object
 */
export declare function createLocalizedResponse(success: boolean, messageKey: string, language?: Language, data?: any): object;
/**
 * Create localized error response
 * @param messageKey - Error message key
 * @param language - Language code
 * @param error - Optional error details
 * @returns Localized error response object
 */
export declare function createLocalizedError(messageKey: string, language?: Language, error?: any): object;
export declare const i18n: {
    getMessage: typeof getMessage;
    getLanguageFromRequest: typeof getLanguageFromRequest;
    createLocalizedResponse: typeof createLocalizedResponse;
    createLocalizedError: typeof createLocalizedError;
};
export {};
//# sourceMappingURL=i18n.d.ts.map