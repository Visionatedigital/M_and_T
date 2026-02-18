const amount = '2000000.00';
const principal = parseFloat(amount);
const interestRate = 0.30;
const totalInterest = principal * interestRate;
const totalAmount = principal + totalInterest;
const growthRate = ((totalAmount - principal) / principal) * 100;
console.log({
    principal,
    totalInterest,
    totalAmount,
    growthRate: growthRate.toFixed(2) + '%'
});
