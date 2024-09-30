document.getElementById('salaryForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const salary = parseFloat(document.getElementById('salary').value);
    const frequency = document.getElementById('frequency').value;
    const taxCode = document.getElementById('taxCode').value;
    const age = document.getElementById('age').value;
    const pension = parseFloat(document.getElementById('pension').value) || 0;
    const studentLoan = document.getElementById('studentLoan').value;

    // Basic logic for converting the salary based on frequency (e.g., if monthly, multiply by 12)
    let annualSalary = salary;
    if (frequency === 'monthly') {
        annualSalary = salary * 12;
    } else if (frequency === 'weekly') {
        annualSalary = salary * 52;
    } else if (frequency === 'hourly') {
        annualSalary = salary * 2080; // Assuming a 40-hour workweek and 52 weeks/year
    }

    // Subtract pension contributions from gross salary
    const pensionDeduction = (pension / 100) * annualSalary;
    const taxableIncome = annualSalary - pensionDeduction;

    // Placeholder for actual tax, NICs, and student loan logic
    const tax = calculateIncomeTax(taxableIncome, taxCode);
    const nationalInsurance = calculateNIC(taxableIncome, age);
    const studentLoanRepayment = calculateStudentLoanRepayment(taxableIncome, studentLoan);

    const netSalary = taxableIncome - tax - nationalInsurance - studentLoanRepayment;

    // Display the result
    document.getElementById('netSalary').textContent = netSalary.toFixed(2);
    document.getElementById('results').style.display = 'block';
});

function calculateIncomeTax(income, taxCode) {
    // Placeholder logic for calculating income tax
    const personalAllowance = 12570; // Default Personal Allowance for tax code 1257L
    let taxable = income - personalAllowance;
    let tax = 0;

    if (taxable > 0) {
        if (taxable <= 50270) {
            tax = taxable * 0.2; // Basic rate 20%
        } else if (taxable <= 150000) {
            tax = (50270 * 0.2) + ((taxable - 50270) * 0.4); // Higher rate 40%
        } else {
            tax = (50270 * 0.2) + ((150000 - 50270) * 0.4) + ((taxable - 150000) * 0.45); // Additional rate 45%
        }
    }

    return tax;
}

function calculateNIC(income, age) {
    // Placeholder for NIC calculations based on age and thresholds
    return income * 0.12; // Basic Class 1 NIC rate
}

function calculateStudentLoanRepayment(income, plan) {
    // Placeholder for Student Loan repayment logic
    if (plan === 'plan1') {
        return income > 20195 ? (income - 20195) * 0.09 : 0;
    } else if (plan === 'plan2') {
        return income > 27295 ? (income - 27295) * 0.09 : 0;
    } else if (plan === 'plan4') {
        return income > 25000 ? (income - 25000) * 0.09 : 0;
    } else if (plan === 'plan5') {
        return income > 25000 ? (income - 25000) * 0.09 : 0;
    }

    return 0;
}
