// Constants for Easy Updates
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
    plan1: 22015,
    plan2: 27295,
    plan4: 27660,
    plan5: 25000
};

const STUDENT_LOAN_RATE = 0.09; // Fixed repayment rate for all plans

// Helper Functions
function calculateIncomeTax(income) {
    let tax = 0;
    let remainingIncome = income;

    for (let i = 0; i < TAX_BANDS.length; i++) {
        const band = TAX_BANDS[i];
        const previousLimit = i === 0 ? 0 : TAX_BANDS[i - 1].limit;
        const taxableAmount = Math.min(remainingIncome, band.limit - previousLimit);

        tax += taxableAmount * band.rate;
        remainingIncome -= taxableAmount;

        if (remainingIncome <= 0) break;
    }

    return tax;
}

function calculateNIC(income) {
    let nic = 0;
    let remainingIncome = income;

    for (let i = 0; i < NIC_BANDS.length; i++) {
        const band = NIC_BANDS[i];
        const previousLimit = i === 0 ? 0 : NIC_BANDS[i - 1].limit;
        const nicAmount = Math.min(remainingIncome, band.limit - previousLimit);

        nic += nicAmount * band.rate;
        remainingIncome -= nicAmount;

        if (remainingIncome <= 0) break;
    }

    return nic;
}

function calculateStudentLoanRepayment(income, plan) {
    const threshold = STUDENT_LOAN_THRESHOLDS[plan];
    return income > threshold ? (income - threshold) * STUDENT_LOAN_RATE : 0;
}

function formatCurrency(num) {
    return num.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });
}

function formatNumberWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Main Calculation Logic
function calculate() {
    console.log("Calculate function called"); // Debugging line

    const salaryInput = document.getElementById('salary').value.replace(/,/g, '');
    const salary = parseFloat(salaryInput);
    if (isNaN(salary)) {
        alert("Please enter a valid salary.");
        return;
    }

    const frequency = document.getElementById('frequency').value;
    let annualSalary = salary;

    if (frequency === 'monthly') {
        annualSalary *= 12;
    } else if (frequency === 'weekly') {
        annualSalary *= 52;
    } else if (frequency === 'hourly') {
        annualSalary *= 2080; // Assume 40-hour workweek and 52 weeks/year
    }

    const pensionType = document.getElementById('pensionType').value;
    const pensionPercent = parseFloat(document.getElementById('pensionPercent').value) || 0;
    const pensionFlatAmount = parseFloat(document.getElementById('pensionFlatAmount').value) || 0;
    let pensionDeduction = 0;

    if (pensionType === 'percent') {
        pensionDeduction = (pensionPercent / 100) * annualSalary;
    } else if (pensionType === 'flatAnnual') {
        pensionDeduction = pensionFlatAmount;
    } else if (pensionType === 'flatMonthly') {
        pensionDeduction = pensionFlatAmount * 12;
    } else if (pensionType === 'flatWeekly') {
        pensionDeduction = pensionFlatAmount * 52;
    }

    const taxableIncome = annualSalary - pensionDeduction;
    const incomeTax = calculateIncomeTax(taxableIncome);
    const nationalInsurance = calculateNIC(taxableIncome);
    const studentLoanPlan = document.getElementById('studentLoan').value;
    const studentLoanRepayment = calculateStudentLoanRepayment(taxableIncome, studentLoanPlan);
    const netSalary = taxableIncome - incomeTax - nationalInsurance - studentLoanRepayment;

    // Update the results in the HTML
    document.getElementById('netSalary').textContent = formatCurrency(netSalary);

    // Show the breakdown section
    const breakdownSection = document.getElementById('breakdown');
    breakdownSection.style.display = 'block';

    // Update the table
    document.getElementById('annualGross').textContent = formatCurrency(annualSalary);
    document.getElementById('monthlyGross').textContent = formatCurrency(annualSalary / 12);
    document.getElementById('weeklyGross').textContent = formatCurrency(annualSalary / 52);

    document.getElementById('annualTax').textContent = formatCurrency(incomeTax);
    document.getElementById('monthlyTax').textContent = formatCurrency(incomeTax / 12);
    document.getElementById('weeklyTax').textContent = formatCurrency(incomeTax / 52);

    document.getElementById('annualNIC').textContent = formatCurrency(nationalInsurance);
    document.getElementById('monthlyNIC').textContent = formatCurrency(nationalInsurance / 12);
    document.getElementById('weeklyNIC').textContent = formatCurrency(nationalInsurance / 52);

    // Conditionally show Pension Contribution row
    if (pensionDeduction > 0) {
        document.getElementById('annualPension').textContent = formatCurrency(pensionDeduction);
        document.getElementById('monthlyPension').textContent = formatCurrency(pensionDeduction / 12);
        document.getElementById('weeklyPension').textContent = formatCurrency(pensionDeduction / 52);
        document.querySelector('tr:has(#annualPension)').style.display = 'table-row';
    } else {
        document.querySelector('tr:has(#annualPension)').style.display = 'none';
    }

    // Conditionally show Student Loan Repayment row
    if (studentLoanRepayment > 0) {
        document.getElementById('annualStudentLoan').textContent = formatCurrency(studentLoanRepayment);
        document.getElementById('monthlyStudentLoan').textContent = formatCurrency(studentLoanRepayment / 12);
        document.getElementById('weeklyStudentLoan').textContent = formatCurrency(studentLoanRepayment / 52);
        document.getElementById('selectedPlan').textContent = studentLoanPlan;
        document.querySelector('tr:has(#annualStudentLoan)').style.display = 'table-row';
    } else {
        document.querySelector('tr:has(#annualStudentLoan)').style.display = 'none';
    }

    document.getElementById('annualNet').textContent = formatCurrency(netSalary);
    document.getElementById('monthlyNet').textContent = formatCurrency(netSalary / 12);
    document.getElementById('weeklyNet').textContent = formatCurrency(netSalary / 52);

    // Scroll to the breakdown section
    breakdownSection.scrollIntoView({ behavior: 'smooth' });
}

// Function to update pension contribution label and input fields
function updatePensionFields() {
    const pensionType = document.getElementById('pensionType').value;
    const pensionLabel = document.getElementById('pensionLabel');
    const pensionPercentInput = document.getElementById('pensionPercentInput');
    const pensionFlatInput = document.getElementById('pensionFlatInput');

    switch(pensionType) {
        case 'percent':
            pensionLabel.textContent = 'Pension Contribution (%):';
            pensionPercentInput.style.display = 'block';
            pensionFlatInput.style.display = 'none';
            break;
        case 'flatAnnual':
            pensionLabel.textContent = 'Pension Contribution (Annual £):';
            pensionPercentInput.style.display = 'none';
            pensionFlatInput.style.display = 'block';
            break;
        case 'flatMonthly':
            pensionLabel.textContent = 'Pension Contribution (Monthly £):';
            pensionPercentInput.style.display = 'none';
            pensionFlatInput.style.display = 'block';
            break;
        case 'flatWeekly':
            pensionLabel.textContent = 'Pension Contribution (Weekly £):';
            pensionPercentInput.style.display = 'none';
            pensionFlatInput.style.display = 'block';
            break;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculate);
        console.log("Event listener added to calculate button"); // Debugging line
    } else {
        console.error("Calculate button not found"); // Debugging line
    }

    // Event listener for pension type changes
    const pensionTypeSelect = document.getElementById('pensionType');
    if (pensionTypeSelect) {
        pensionTypeSelect.addEventListener('change', updatePensionFields);
        // Initialize pension fields on page load
        updatePensionFields();
    } else {
        console.error("Pension type select not found"); // Debugging line
    }

    // Event listener for formatting salary input on blur
    document.getElementById('salary').addEventListener('blur', function(event) {
        let value = event.target.value.replace(/,/g, '');
        if (!isNaN(value) && value.trim() !== '') {
            event.target.value = formatNumberWithCommas(parseFloat(value));
        }
    });

    // Ensure the input is not cleared unless it's truly invalid
    document.getElementById('salary').addEventListener('input', function(event) {
        event.target.value = event.target.value.replace(/[^0-9,]/g, '');
    });

    // Event listener for handling "Enter" key press
    document.getElementById('salary').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            calculate(); // Call the calculate function
        }
    });

    // Event listener for the form submission
    document.getElementById('salaryForm').addEventListener('submit', function(event) {
        event.preventDefault();
        calculate();
    });
});

function updateBreakdownTable(annualSalary, incomeTax, nationalInsurance, pensionDeduction, studentLoanRepayment, netSalary, studentLoanPlan) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    // Helper function to add a row to the table
    function addRow(label, annual, monthly, weekly, className = '') {
        const row = tableBody.insertRow();
        row.className = className;
        row.innerHTML = `
            <td>${label}</td>
            <td>${formatCurrency(annual)}</td>
            <td>${formatCurrency(monthly)}</td>
            <td>${formatCurrency(weekly)}</td>
        `;
    }

    // Add rows to the table
    addRow('Gross Salary', annualSalary, annualSalary / 12, annualSalary / 52, 'gross-row');
    addRow('Income Tax', incomeTax, incomeTax / 12, incomeTax / 52, 'deduction-row');
    addRow('National Insurance', nationalInsurance, nationalInsurance / 12, nationalInsurance / 52, 'deduction-row');

    if (pensionDeduction > 0) {
        addRow('Pension Contribution', pensionDeduction, pensionDeduction / 12, pensionDeduction / 52, 'deduction-row');
    }

    // Ensure Student Loan Repayment row is above Net Salary
    if (studentLoanRepayment > 0) {
        addRow(`Student Loan Repayment (Plan: ${studentLoanPlan})`, studentLoanRepayment, studentLoanRepayment / 12, studentLoanRepayment / 52, 'deduction-row');
    }

    // Add Net Salary row last
    addRow('Net Salary', netSalary, netSalary / 12, netSalary / 52, 'net-row');
}