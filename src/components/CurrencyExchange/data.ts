export type CurrencyMeta = {
    code: string;
    flag: string;
    icon?: string; 
    payoutMarkup: number;
    isCrypto?: boolean; // Является ли валюта криптовалютой
    active?: boolean; // Активна ли валюта (для отображения на сайте)
};

// Базовые валюты (используются только если нет данных из WordPress)
const baseCurrencyMeta: Record<string, CurrencyMeta> = {
    RUB: { code: 'RUB', flag: '🇷🇺', payoutMarkup: 3.0, isCrypto: false, active: true },
    USD: { code: 'USD', flag: '🇺🇸', payoutMarkup: 3.0, isCrypto: false, active: true },
    THB: { code: 'THB', flag: '🇹🇭', payoutMarkup: 3.0, isCrypto: false, active: true },
    EUR: { code: 'EUR', flag: '🇪🇺', payoutMarkup: 3.0, isCrypto: false, active: true },
    AED: { code: 'AED', flag: '🇦🇪', payoutMarkup: 3.0, isCrypto: false, active: true },
    USDT: { code: 'USDT', flag: '🪙', payoutMarkup: 3.0, isCrypto: true, active: true },
};

// Получаем все валюты из WordPress (только активные!)
const getAllCurrencies = (): Record<string, CurrencyMeta> => {
    // Всегда начинаем с базовых валют
    const result: Record<string, CurrencyMeta> = { ...baseCurrencyMeta };
    
    // Добавляем валюты из WordPress, если они доступны
    if (typeof window !== 'undefined' && (window as any).pluginData?.customCurrencies) {
        const currencies = (window as any).pluginData.customCurrencies;
        for (const code in currencies) {
            const currency = currencies[code];
            // Добавляем только активные валюты (active === 1 или active === true)
            const isActive = currency.active === 1 || currency.active === true;
            
            if (currency && currency.code && isActive) {
                result[code] = {
                    code: currency.code,
                    flag: currency.flag || '',
                    icon: currency.icon || undefined,
                    payoutMarkup: currency.payoutMarkup || 3.0,
                    isCrypto: currency.isCrypto === 1 || currency.isCrypto === true,
                    active: true,
                };
            }
        }
    }
    return result;
};

// Используем все валюты из WordPress (динамически)
let cachedCurrencyMeta: Record<string, CurrencyMeta> | null = null;

export const getCurrencyMeta = (): Record<string, CurrencyMeta> => {
    // Всегда возвращаем хотя бы базовые валюты
    if (!cachedCurrencyMeta) {
        cachedCurrencyMeta = getAllCurrencies();
    }
    // Если кэш пустой (не должно быть, но на всякий случай), возвращаем базовые
    if (Object.keys(cachedCurrencyMeta).length === 0) {
        cachedCurrencyMeta = baseCurrencyMeta;
    }
    return cachedCurrencyMeta;
};

export const currencyMeta: Record<string, CurrencyMeta> = new Proxy({} as Record<string, CurrencyMeta>, {
    get(target, prop: string) {
        const meta = getCurrencyMeta();
        return meta[prop];
    },
    ownKeys(target) {
        return Object.keys(getCurrencyMeta());
    },
    has(target, prop: string) {
        return prop in getCurrencyMeta();
    }
});

export const getFormCurrencyCodes = (): string[] => {
    const meta = getCurrencyMeta();
    const defaultCodes = ['RUB', 'USD', 'THB', 'EUR', 'AED'];
    const availableCodes = defaultCodes.filter(code => code in meta);
    // Всегда возвращаем хотя бы RUB
    return availableCodes.length > 0 ? availableCodes : ['RUB'];
};

export const getCurrencyOptions = () => {
    return getFormCurrencyCodes().map((code) => ({
        label: code,
        value: code,
    }));
};

export const currencyOptions = getCurrencyOptions();

// Базовые валюты для выплат
const basePayoutCurrencyCodes = ['THB', 'USD', 'EUR', 'AED', 'USDT'];

// Получаем все валюты для выплат (кроме RUB, которая только для формы)
export const getPayoutCurrencyCodes = (): string[] => {
    const meta = getCurrencyMeta();
    const allCodes = Object.keys(meta);
    const payoutCodes = allCodes.filter(code => code !== 'RUB');
    // Если нет валют для выплат, возвращаем базовые
    return payoutCodes.length > 0 ? payoutCodes : ['THB', 'USD', 'EUR', 'AED', 'USDT'];
};

export const payoutCurrencyCodes = getPayoutCurrencyCodes() as Array<keyof typeof currencyMeta>;

export const getRateCurrencyCodes = (): string[] => {
    const formCodes = getFormCurrencyCodes();
    const payoutCodes = getPayoutCurrencyCodes();
    const allCodes = Array.from(new Set([...formCodes, ...payoutCodes]));
    // Всегда возвращаем хотя бы базовые валюты
    return allCodes.length > 0 ? allCodes : ['RUB', 'USD', 'THB', 'EUR', 'AED', 'USDT'];
};

export const rateCurrencyCodes = getRateCurrencyCodes();
