const generateInvoiceID = () => {
    const randomDigits = Math.random().toString().slice(2, 14);
    return "FAJO" + randomDigits;
};

const generateOrderID = () => {
    const timestamp = Date.now().toString();
    const randomDigits = Math.random().toString().slice(2, 7);
    return "OD" + timestamp + randomDigits;
};

export { generateInvoiceID, generateOrderID }
