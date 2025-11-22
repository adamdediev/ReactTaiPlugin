export type CurrencyMeta = {
    code: string;
    flag: string;
    icon?: string; 
    payoutMarkup: number;
    isCrypto?: boolean; // Является ли валюта криптовалютой
};

export const currencyMeta: Record<string, CurrencyMeta> = {
    RUB: { code: 'RUB', flag: '🇷🇺', payoutMarkup: 3.0, isCrypto: false },
    USD: { code: 'USD', flag: '🇺🇸', payoutMarkup: 3.0, isCrypto: false },
    THB: { code: 'THB', flag: '🇹🇭', payoutMarkup: 3.0, isCrypto: false },
    EUR: { code: 'EUR', flag: '🇪🇺', payoutMarkup: 3.0, isCrypto: false },
    AED: { code: 'AED', flag: '🇦🇪', payoutMarkup: 3.0, isCrypto: false },
    USDT: { code: 'USDT', flag: '🪙', payoutMarkup: 3.0, isCrypto: true },
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

export const payoutCurrencyCodes: Array<keyof typeof currencyMeta> = [
    'THB',
    'USD',
    'EUR',
    'AED',
    'USDT',
];

export const rateCurrencyCodes = Array.from(
    new Set<keyof typeof currencyMeta>([...formCurrencyCodes, ...payoutCurrencyCodes, 'USDT'])
);
