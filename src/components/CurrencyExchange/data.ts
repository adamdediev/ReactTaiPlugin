export type CurrencyMeta = {
    code: string;
    flag: string;
    icon?: string; 
    payoutMarkup: number;
    isCrypto?: boolean; // Является ли валюта криптовалютой
};

// Базовые валюты
const baseCurrencyMeta: Record<string, CurrencyMeta> = {
    RUB: { code: 'RUB', flag: '🇷🇺', payoutMarkup: 3.0, isCrypto: false },
    USD: { code: 'USD', flag: '🇺🇸', payoutMarkup: 3.0, isCrypto: false },
    THB: { code: 'THB', flag: '🇹🇭', payoutMarkup: 3.0, isCrypto: false },
    EUR: { code: 'EUR', flag: '🇪🇺', payoutMarkup: 3.0, isCrypto: false },
    AED: { code: 'AED', flag: '🇦🇪', payoutMarkup: 3.0, isCrypto: false },
    USDT: { code: 'USDT', flag: '🪙', payoutMarkup: 3.0, isCrypto: true },
};

// Получаем кастомные валюты из WordPress
const getCustomCurrencies = (): Record<string, CurrencyMeta> => {
    if (typeof window !== 'undefined' && (window as any).pluginData?.customCurrencies) {
        const custom = (window as any).pluginData.customCurrencies;
        const result: Record<string, CurrencyMeta> = {};
        for (const code in custom) {
            const currency = custom[code];
            result[code] = {
                code: currency.code,
                flag: currency.flag || '',
                icon: currency.icon || undefined,
                payoutMarkup: currency.payoutMarkup || 3.0,
                isCrypto: currency.isCrypto === 1 || currency.isCrypto === true,
            };
        }
        return result;
    }
    return {};
};

// Объединяем базовые и кастомные валюты
export const currencyMeta: Record<string, CurrencyMeta> = {
    ...baseCurrencyMeta,
    ...getCustomCurrencies(),
};

const formCurrencyCodes: Array<keyof typeof currencyMeta> = [
    'RUB',
    'USD',
    'THB',
    'EUR',
    'AED',
];

export const currencyOptions = formCurrencyCodes.map((code) => ({
    label: code,
    value: code,
}));

// Базовые валюты для выплат
const basePayoutCurrencyCodes: Array<keyof typeof currencyMeta> = [
    'THB',
    'USD',
    'EUR',
    'AED',
    'USDT',
];

// Добавляем кастомные валюты к списку выплат
export const payoutCurrencyCodes: Array<keyof typeof currencyMeta> = [
    ...basePayoutCurrencyCodes,
    ...Object.keys(getCustomCurrencies()) as Array<keyof typeof currencyMeta>,
];

export const rateCurrencyCodes = Array.from(
    new Set<keyof typeof currencyMeta>([...formCurrencyCodes, ...payoutCurrencyCodes])
);
