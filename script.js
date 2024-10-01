// ==========================
// Constants for Easy Updates
// ==========================
const TAX_BANDS = [
    { limit: 12570, rate: 0 },        // Personal allowance (up to £12,570 is tax-free)
    { limit: 50270, rate: 0.20 },     // Basic rate (up to £50,270 at 20%)
    { limit: 150000, rate: 0.40 },    // Higher rate (up to £150,000 at 40%)
    { limit: Infinity, rate: 0.45 }   // Additional rate (above £150,000 at 45%)
];

const NIC_BANDS = [
    { limit: 12570, rate: 0 },        // No NICs up to personal allowance
    { limit: 50270, rate: 0.12 },     // NICs from £12,570 to £50,270 at 12%
    { limit: Infinity, rate: 0.02 }   // NICs above £50,270 at 2%
];

const STUDENT_LOAN_THRESHOLDS = {
    plan1: 20195,
    plan2: 27295,
    plan4: 25000,
    plan5: 25000
};

const STUDENT_LOAN_RATE = 0.09; // Fixed repayment rate for all plans

// ==========================
// Helper Functions
// ==========================

// Function to calculate income tax
function calculateIncomeTax(income) {
    let tax = 0;
    let remainingIncome = income;

    // Loop through tax bands and apply the rates
    for (let band of TAX_BANDS) {
        if (remainingIncome > band.limit) {
            const taxableAmount = band.limit;
            tax += taxableAmount * band.rate;
            remainingIncome -= taxableAmount;
        } else {
            tax += remainingIncome * band.rate;
            break;
        }
    }

    return tax;
}

// Function to calculate National Insurance Contributions (NICs)
function calculateNIC(income) {
    let nic = 0;
    let remainingIncome = income;

    // Loop through NIC bands and apply the rates
    for (let band of NIC_BANDS) {
        if (remainingIncome > band.limit) {
            const nicAmount = band.limit;
            nic += nicAmount * band.rate;
            remainingIncome -= nicAmount;
        } else {
            nic += remainingIncome * band.rate;
            break;
        }
    }

    return nic;
}

// Function to calculate student loan repayment
function calculateStudentLoanRepayment(income, plan) {
    const threshold = STUDENT_LOAN_THRESHOLDS[plan];
    return income > threshold ? (income - threshold) * STUDENT_LOAN_RATE : 0;
}

// Function to format numbers as currency (GBP)
function formatCurrency(num) {
    return num.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });
}

// ==========================
// Main Calculation Logic
// ==========================

document.getElementById('salaryForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Gather form inputs
    const salary = parseFloat(document.getElementById('salary').value);
    const frequency = document.getElementById('frequency').value;
    const pensionType = document.getElementById('pensionType').value;
    const pensionPercent = parseFloat(document.getElementById('pensionPercent').value) || 0;
    const pensionFlatAmount = parseFloat(document.getElementById('pensionFlatAmount').value) || 0;
    const studentLoanPlan = document.getElementById('studentLoan').value;

    // Convert salary to annual if needed
    let annualSalary = salary;
    if (frequency === 'monthly') {
        annualSalary *= 12;
    } else if (frequency === 'weekly') {
        annualSalary *= 52;
    } else if (frequency === 'hourly') {
        annualSalary *= 2080; // Assume 40-hour workweek and 52 weeks/year
    }

    // Calculate pension deduction
    let pensionDeduction = 0;
    if (pensionType === 'percent') {
        pensionDeduction = (pensionPercent / 100) * annualSalary;
    } else {
        pensionDeduction = pensionFlatAmount;
    }

    const taxableIncome = annualSalary - pensionDeduction;

    // Calculate taxes
    const incomeTax = calculateIncomeTax(taxableIncome);
    const nationalInsurance = calculateNIC(taxableIncome);
    const studentLoanRepayment = calculateStudentLoanRepayment(taxableIncome, studentLoanPlan);

    const netSalary = taxableIncome - incomeTax - nationalInsurance - studentLoanRepayment;

    // Monthly and weekly breakdowns
    const monthlySalary = annualSalary / 12;
    const weeklySalary = annualSalary / 52;

    const monthlyTax = incomeTax / 12;
    const weeklyTax = incomeTax / 52;

    const monthlyNIC = nationalInsurance / 12;
    const weeklyNIC = nationalInsurance / 52;

    const monthlyNet = netSalary / 12;
    const weeklyNet = netSalary / 52;

    const monthlyPension = pensionDeduction / 12;
    const weeklyPension = pensionDeduction / 52;

    // Update the results in the HTML
    document.getElementById('netSalary').textContent = formatCurrency(netSalary);

    // Update Breakdown Table
    document.getElementById('annualGross').textContent = formatCurrency(annualSalary);
    document.getElementById('monthlyGross').textContent = formatCurrency(monthlySalary);
    document.getElementById('weeklyGross').textContent = formatCurrency(weeklySalary);

    document.getElementById('annualTax').textContent = formatCurrency(incomeTax);
    document.getElementById('monthlyTax').textContent = formatCurrency(monthlyTax);
    document.getElementById('weeklyTax').textContent = formatCurrency(weeklyTax);

    document.getElementById('annualNIC').textContent = formatCurrency(nationalInsurance);
    document.getElementById('monthlyNIC').textContent = formatCurrency(monthlyNIC);
    document.getElementById('weeklyNIC').textContent = formatCurrency(weeklyNIC);

    document.getElementById('annualPension').textContent = formatCurrency(pensionDeduction);
    document.getElementById('monthlyPension').textContent = formatCurrency(monthlyPension);
    document.getElementById('weeklyPension').textContent = formatCurrency(weeklyPension);

    document.getElementById('annualNet').textContent = formatCurrency(netSalary);
    document.getElementById('monthlyNet').textContent = formatCurrency(monthlyNet);
    document.getElementById('weeklyNet').textContent = formatCurrency(weeklyNet);

    // Show the breakdown table
    document.getElementById('breakdown').style.display = 'block';
});
