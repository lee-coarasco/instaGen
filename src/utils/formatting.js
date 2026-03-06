export const formatCurrency = (amountInUSD) => {
    if (typeof amountInUSD !== 'number') return '$0.00 USD';

    const preference = localStorage.getItem('instaGen-currency') || 'USD';

    // Mock exchange rates (static base rates since we don't have a live API)
    const RATES = {
        USD: 1,
        INR: 83.50,
        EUR: 0.92,
        GBP: 0.79
    };

    const SYMBOLS = {
        USD: '$',
        INR: '₹',
        EUR: '€',
        GBP: '£'
    };

    const rate = RATES[preference] || 1;
    const symbol = SYMBOLS[preference] || '$';

    const convertedAmount = amountInUSD * rate;

    // Use variable decimal places based on size
    // AI token costs can be extremely small ($0.00007), so we need more precision
    let precision = 4;
    if (convertedAmount > 1) precision = 2;
    if (convertedAmount < 0.0001 && convertedAmount > 0) precision = 6;

    return `${symbol}${convertedAmount.toFixed(precision)} ${preference}`;
};
