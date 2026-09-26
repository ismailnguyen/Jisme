function ean13CheckDigit(data12) {
  const digits = [...data12].map(Number);
  const sumOdd  = digits.filter((_, i) => i % 2 === 0).reduce((s, d) => s + d, 0);
  const sumEven = digits.filter((_, i) => i % 2 === 1).reduce((s, d) => s + d, 0);
  const total = sumOdd + sumEven * 3;
  return (10 - (total % 10)) % 10;
}

export function detectBarcodeSymbology(raw) {
    if (/^\d{13}$/.test(raw)) {
        const check = ean13CheckDigit(raw.slice(0, 12));
        if (check === Number(raw[12])) {
            return 'EAN13';
        }
    } else if (/^\d{12}$/.test(raw)) {
        barcodeFormat = 'UPC';
    } 

    // default format (accepted by Wallets)
    return 'CODE128';
}