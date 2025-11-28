import React, { useMemo, useState } from 'react';
import { Typography } from 'antd';
import ExchangeForm from './ExchangeForm';
import RatesBoard from './RatesBoard';
import { getRateCurrencyCodes } from './data';
import { useCbrRates } from '../../hooks/useCbrRates';

const CurrencyExchangeSection = () => {
    const [currency, setCurrency] = useState('RUB');
    const [amount, setAmount] = useState(10000);
    
    // Получаем URL кнопки обмена из данных WordPress
    const exchangeUrl = (window as any).pluginData?.exchangeButtonUrl || '';
    
    // Используем useMemo чтобы не пересоздавать массив кодов при каждом рендере
    // Используем стабильный массив базовых валют, чтобы избежать бесконечных перезагрузок
    const rateCodes = React.useMemo(() => {
        const codes = getRateCurrencyCodes();
        // Всегда возвращаем хотя бы базовые валюты
        return codes.length > 0 ? codes : ['RUB', 'USD', 'THB', 'EUR', 'AED', 'USDT'];
    }, []);
    const { rates, loading, error } = useCbrRates(rateCodes);

    const derivedRates = useMemo(() => {
        if (!rates.USDT && rates.USD) {
            return { ...rates, USDT: rates.USD };
        }
        return rates;
    }, [rates]);

    return (
        <section className="currency-section">
            <div className="currency-section__overlay">
                <div className="currency-section__content">
                    <div className="currency-section__intro">
                        <div className="currency-section__tags">
                            <span>Безопасно</span>
                            <span>Быстро</span>
                        </div>
                        <h1 className="currency-section__title">
                            Обмен валют<br /><strong>в Таиланде</strong>
                        </h1>
                        <Typography.Paragraph className="currency-section__description">
                         Обменяйте валюту всего за пару кликов и получите удобным для вас способом
                        </Typography.Paragraph>
                        <ExchangeForm
                            currency={currency}
                            amount={amount}
                            onCurrencyChange={setCurrency}
                            onAmountChange={setAmount}
                            disabled={loading}
                            exchangeUrl={exchangeUrl}
                        />
                    </div>
                    <RatesBoard
                        baseCurrency={currency}
                        baseAmount={amount}
                        rates={derivedRates}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </section>
    );
};

export default CurrencyExchangeSection;

