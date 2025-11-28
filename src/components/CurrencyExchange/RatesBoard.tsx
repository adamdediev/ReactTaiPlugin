import React, { useMemo } from 'react';
import { Button, Card, List, Skeleton, Typography } from 'antd';
import CurrencyFlag from 'react-currency-flags';
import { currencyMeta, getPayoutCurrencyCodes, getCurrencyMeta } from './data';
import DynamicClock from '../DynamicClock/DynamicClock';

const largeNumberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
});

const preciseNumberFormatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatAmount = (value: number) =>
    value >= 100 ? largeNumberFormatter.format(value) : preciseNumberFormatter.format(value);

type RatesBoardProps = {
    baseCurrency: string;
    baseAmount: number;
    rates: Record<string, number>;
    loading: boolean;
    error: string | null;
};

const RatesBoard = ({ baseCurrency, baseAmount, rates, loading, error }: RatesBoardProps) => {
    const conversions = useMemo(() => {
        const baseRate = rates[baseCurrency] || 1; // Если курс не найден, используем 1
        const amountInRub = baseAmount * baseRate;
        const payoutCodes = getPayoutCurrencyCodes();
        const currencyMetaData = getCurrencyMeta();
        
        // Если нет валют для отображения, возвращаем пустой массив
        if (payoutCodes.length === 0) {
            return [];
        }

        return payoutCodes.map((code) => {
            const meta = currencyMetaData[code];
            if (!meta) {
                return {
                    code,
                    flag: '',
                    icon: undefined,
                    payoutMarkup: 0,
                    conversion: 'Нет данных',
                    amount: 0,
                    ready: false,
                };
            }

            // Для криптовалют используем курс USD как fallback
            let targetRate = rates[code];
            if (!targetRate && meta.isCrypto && rates.USD) {
                targetRate = rates.USD;
            }

            if (!targetRate) {
                return {
                    code: meta.code,
                    flag: meta.flag,
                    icon: meta.icon,
                    payoutMarkup: meta.payoutMarkup,
                    conversion: 'Нет данных',
                    amount: 0,
                    ready: false,
                };
            }

            // Применяем процент увеличения при выводе
            const markupMultiplier = 1 + (meta.payoutMarkup / 100);
            const targetAmount = (amountInRub / targetRate) * markupMultiplier;
            
            // Рассчитываем отображаемый курс в зависимости от базовой валюты
            let displayRate: number;
            let conversionString: string;
            
            if (baseCurrency === 'RUB') {
                // Если базовая валюта RUB, показываем сколько рублей стоит 1 единица целевой валюты
                // Применяем markup к курсу
                displayRate = targetRate / markupMultiplier;
                conversionString = `1 ${meta.code} = ${displayRate.toFixed(2)} RUB`;
            } else {
                // Если базовая валюта не RUB, показываем кросс-курс
                // Например: 1 USD = X THB
                // Формула: (курс базовой валюты в рублях) / (курс целевой валюты в рублях)
                // С учетом markup для целевой валюты
                displayRate = (baseRate / targetRate) * markupMultiplier;
                conversionString = `1 ${baseCurrency} = ${displayRate.toFixed(2)} ${meta.code}`;
            }
            
            return {
                code: meta.code,
                flag: meta.flag,
                icon: meta.icon,
                payoutMarkup: meta.payoutMarkup,
                conversion: conversionString,
                amount: targetAmount,
                ready: true,
            };
        });
    }, [baseAmount, baseCurrency, rates]);

    return (
        <Card
            className="rates-board"
            bordered={false}
            style={{ borderRadius: 28 }}
        >
            <div className="rates-board__header">
           
                    <Typography.Text className="rates-board__label">
                        Вы получаете 
                    </Typography.Text>
               
                <Typography.Text className="rates-board__subtitle">
                  <DynamicClock />
                </Typography.Text>
            </div>
            {loading ? (
                <Skeleton active paragraph={{ rows: 5 }} title={false} className="rates-board__skeleton" />
            ) : (
                <>
                    {error && (
                        <Typography.Text type="warning" style={{ display: 'block', marginBottom: '16px', padding: '0 24px' }}>
                            {error}
                        </Typography.Text>
                    )}
                    {conversions.length > 0 ? (
                        <List
                            dataSource={conversions}
                            split={false}
                            renderItem={(item) => (
                        <List.Item className="rates-board__item" key={item.code}>
                            <div className="rates-board__currency">
                                <div className="rates-board__icon-wrapper">
                                    {(() => {
                                        const meta = getCurrencyMeta()[item.code];
                                        
                                        // Если есть URL иконки, используем её
                                        if (meta?.icon) {
                                            return (
                                                <img 
                                                    src={meta.icon} 
                                                    alt={item.code}
                                                    className="rates-board__custom-icon"
                                                />
                                            );
                                        }
                                        
                                        // Если это криптовалюта и есть флаг (эмодзи), показываем его
                                        if (meta?.isCrypto && meta?.flag) {
                                            return (
                                                <span className="rates-board__crypto-emoji">
                                                    {meta.flag}
                                                </span>
                                            );
                                        }
                                        
                                        // Для обычных валют используем флаг
                                        return (
                                            <CurrencyFlag 
                                                currency={item.code} 
                                                className="rates-board__flag-icon"
                                            />
                                        );
                                    })()}
                                </div>
                                <Typography.Text className="rates-board__code">
                                    {item.code} 
                                </Typography.Text>
                            </div>
                            <div className="rates-board__right">
                                
                                <Typography.Text
                                    type="secondary"
                                    className="rates-board__conversion"
                                >
                                    {item.conversion} 
                                </Typography.Text>
                                <Typography.Text className="rates-board__amount">
                                    {item.ready ? formatAmount(item.amount) : '—'}
                                </Typography.Text>
                            </div>
                        </List.Item>
                    )}
                        />
                    ) : (
                        <Typography.Text type="secondary" style={{ display: 'block', padding: '24px', textAlign: 'center' }}>
                            Нет доступных валют для отображения
                        </Typography.Text>
                    )}
                </>
            )}
        </Card>
    );
};

export default RatesBoard;

