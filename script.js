// Constants for Easy Updates
const TAX_BANDS = [
    { limit: 12570, rate: 0 },        // Personal allowance (up to £12,570 is tax-free)
    { limit: 50270, rate: 0.20 },     // Basic rate (up to £50,270 at 20%)
    { limit: 150000, rate: 0.40 },    // Higher rate (up to £150,000 at 40%)
    { limit: Infinity, rate: 0.45 }   // Additional rate (above £150,000 at 45%)
];

const NIC_BANDS = [
    { limit: 12570, rate: 0 },        // No NICs up to personal allowance
    { limit: 50270, rate: 0.08 },     // NICs from £12,570 to £50,270 at 8%
    { limit: Infinity, rate: 0.02 }   // NICs above £50,270 at 2%
];

const STUDENT_LOAN_THRESHOLDS = {
    plan1: 22015,
    plan2: 27295,
    plan4: 27660,
    plan5: 25000
};

const STUDENT_LOAN_RATE = 0.09; // Fixed repayment rate for all plans

// Define tax bands for each year
const TAX_BANDS_BY_YEAR = {
    "2024/25": [
        { limit: 12570, rate: 0 },
        { limit: 50270, rate: 0.20 },
        { limit: 150000, rate: 0.40 },
        { limit: Infinity, rate: 0.45 }
    ],
    "2023/24": [
        { limit: 12570, rate: 0 },
        { limit: 50270, rate: 0.20 },
        { limit: 150000, rate: 0.40 },
        { limit: Infinity, rate: 0.45 }
    ],
    // Add more years as needed
};

// Helper Functions
function calculateIncomeTax(grossSalary, taxYear) {
    const taxBands = TAX_BANDS_BY_YEAR[taxYear];
    let personalAllowance = 12570;
    const allowanceReductionThreshold = 100000;
    const allowanceReductionLimit = 125140;

    // Adjust personal allowance for high earners
    if (grossSalary > allowanceReductionThreshold) {
        const excessIncome = grossSalary - allowanceReductionThreshold;
        const reducedAllowance = Math.floor(excessIncome / 2);
        personalAllowance = Math.max(0, personalAllowance - reducedAllowance);
    }

    let taxableIncome = grossSalary - personalAllowance;
    let incomeTax = 0;

    if (taxableIncome > 0) {
        for (let i = 0; i < taxBands.length; i++) {
            const band = taxBands[i];
            const previousLimit = i === 0 ? 0 : taxBands[i - 1].limit;
            const taxableAmount = Math.min(taxableIncome, band.limit - previousLimit);
            incomeTax += taxableAmount * band.rate;
            taxableIncome -= taxableAmount;
            if (taxableIncome <= 0) break;
        }
    }

    return incomeTax;
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
    const salaryInputElement = document.getElementById('salary');
    const rawSalaryValue = salaryInputElement.value.replace(/,/g, '').trim(); // Remove commas and trim whitespace
    console.log('Parsed Salary Input:', rawSalaryValue); // Debugging line
    const salary = parseFloat(rawSalaryValue);

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

    const taxYear = document.getElementById('taxYear').value;
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
    const incomeTax = calculateIncomeTax(taxableIncome, taxYear);
    const nationalInsurance = calculateNIC(taxableIncome);
    const studentLoanPlan = document.getElementById('studentLoan').value;
    const studentLoanRepayment = calculateStudentLoanRepayment(taxableIncome, studentLoanPlan);
    const netSalary = taxableIncome - incomeTax - nationalInsurance - studentLoanRepayment;

    // Clear existing rows
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = '';

    // Add rows to the table
    addRow('Gross Salary', annualSalary, annualSalary / 12, annualSalary / 52);
    addRow('Income Tax', incomeTax, incomeTax / 12, incomeTax / 52);
    addRow('National Insurance', nationalInsurance, nationalInsurance / 12, nationalInsurance / 52);

    if (pensionDeduction > 0) {
        addRow('Pension Contribution', pensionDeduction, pensionDeduction / 12, pensionDeduction / 52);
    }

    if (studentLoanRepayment > 0) {
        addRow(`Student Loan Repayment (Plan: ${studentLoanPlan})`, studentLoanRepayment, studentLoanRepayment / 12, studentLoanRepayment / 52);
    }

    addRow('Net Salary', netSalary, netSalary / 12, netSalary / 52);

    // Function to add a row
    function addRow(label, annual, monthly, weekly) {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${label}</td>
            <td>${formatNumberWithCommas(annual.toFixed(2))}</td>
            <td>${formatNumberWithCommas(monthly.toFixed(2))}</td>
            <td>${formatNumberWithCommas(weekly.toFixed(2))}</td>
        `;
    }

    // Update the results in the HTML
    document.getElementById('netSalary').textContent = formatNumberWithCommas(netSalary.toFixed(2));

    // Show the breakdown section
    const breakdownSection = document.getElementById('breakdown');
    breakdownSection.style.display = 'block';

    // Update the table
    document.getElementById('annualGross').textContent = formatNumberWithCommas((annualSalary).toFixed(2));
    document.getElementById('monthlyGross').textContent = formatNumberWithCommas((annualSalary / 12).toFixed(2));
    document.getElementById('weeklyGross').textContent = formatNumberWithCommas((annualSalary / 52).toFixed(2));

    document.getElementById('annualTax').textContent = formatNumberWithCommas((incomeTax).toFixed(2));
    document.getElementById('monthlyTax').textContent = formatNumberWithCommas((incomeTax / 12).toFixed(2));
    document.getElementById('weeklyTax').textContent = formatNumberWithCommas((incomeTax / 52).toFixed(2));

    document.getElementById('annualNIC').textContent = formatNumberWithCommas((nationalInsurance).toFixed(2));
    document.getElementById('monthlyNIC').textContent = formatNumberWithCommas((nationalInsurance / 12).toFixed(2));
    document.getElementById('weeklyNIC').textContent = formatNumberWithCommas((nationalInsurance / 52).toFixed(2));

    // Conditionally show Pension Contribution row
    if (pensionDeduction > 0) {
        document.getElementById('annualPension').textContent = formatNumberWithCommas((pensionDeduction).toFixed(2));
        document.getElementById('monthlyPension').textContent = formatNumberWithCommas((pensionDeduction / 12).toFixed(2));
        document.getElementById('weeklyPension').textContent = formatNumberWithCommas((pensionDeduction / 52).toFixed(2));
        document.querySelector('tr:has(#annualPension)').style.display = 'table-row';
    } else {
        document.querySelector('tr:has(#annualPension)').style.display = 'none';
    }

    // Conditionally show Student Loan Repayment row
    if (studentLoanRepayment > 0) {
        document.getElementById('annualStudentLoan').textContent = formatNumberWithCommas((studentLoanRepayment).toFixed(2));
        document.getElementById('monthlyStudentLoan').textContent = formatNumberWithCommas((studentLoanRepayment / 12).toFixed(2));
        document.getElementById('weeklyStudentLoan').textContent = formatNumberWithCommas((studentLoanRepayment / 52).toFixed(2));
        document.getElementById('selectedPlan').textContent = studentLoanPlan;
        document.querySelector('tr:has(#annualStudentLoan)').style.display = 'table-row';
    } else {
        document.querySelector('tr:has(#annualStudentLoan)').style.display = 'none';
    }

    document.getElementById('annualNet').textContent = formatNumberWithCommas((netSalary).toFixed(2));
    document.getElementById('monthlyNet').textContent = formatNumberWithCommas((netSalary / 12).toFixed(2));
    document.getElementById('weeklyNet').textContent = formatNumberWithCommas((netSalary / 52).toFixed(2));

    // Scroll to the breakdown section
    breakdownSection.scrollIntoView({ behavior: 'smooth' });

    // Do not reformat the input field with commas
    // salaryInputElement.value = formatNumberWithCommas(salary);
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
        calculateButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default action
            calculate(); // Call the calculate function
        });
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
            // Do not format the value with commas
            event.target.value = value;
        }
    });

    // Allow any number of digits, optional commas, and a single decimal point
    document.getElementById('salary').addEventListener('input', function(event) {
        const value = event.target.value;
        // Allow any number of digits, optional commas, and a single decimal point
        if (!/^\d{1,3}(,\d{3})*(\.\d*)?$/.test(value) && !/^\d+(\.\d*)?$/.test(value)) {
            event.target.value = value.slice(0, -1);
        }
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
        event.preventDefault(); // Prevent form submission
        calculate(); // Call the calculate function
    });

    document.getElementById('pensionPercent').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            calculate(); // Call the calculate function
        }
    });

    document.getElementById('pensionFlatAmount').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            calculate(); // Call the calculate function
        }
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

function calculateExtraGrossSalary() {
    const salaryInput = document.getElementById('salary').value.replace(/,/g, '');
    const salary = parseFloat(salaryInput);

    if (isNaN(salary) || salary <= 0) {
        alert("Please enter a valid salary in the main calculator first.");
        return;
    }

    const desiredNetIncome = parseFloat(document.getElementById('desiredNetIncome').value);
    const extraFrequency = document.getElementById('extraFrequency').value;

    if (isNaN(desiredNetIncome) || desiredNetIncome < 0) {
        alert("Please enter a valid desired net income.");
        return;
    }

    // Convert desired net income to annual equivalent based on frequency
    let annualDesiredNetIncome;
    switch (extraFrequency) {
        case 'monthly':
            annualDesiredNetIncome = desiredNetIncome * 12;
            break;
        case 'yearly':
            annualDesiredNetIncome = desiredNetIncome;
            break;
        case 'weekly':
            annualDesiredNetIncome = desiredNetIncome * 52;
            break;
    }

    const studentLoanPlan = document.getElementById('studentLoan').value;

    // Function to calculate the additional gross salary needed
    function calculateAdditionalGrossSalary(desiredNet) {
        let additionalGross = 0;
        let additionalNet = 0;
        let incomeTax = 0;
        let nationalInsurance = 0;
        let studentLoanRepayment = 0;

        // Incrementally increase gross until additional net matches desired additional net
        while (additionalNet < desiredNet) {
            additionalGross += 1; // Increment gross salary by a small amount for precision
            const newGross = salary + additionalGross;
            incomeTax = calculateIncomeTax(newGross) - calculateIncomeTax(salary);
            nationalInsurance = calculateNIC(newGross) - calculateNIC(salary);
            studentLoanRepayment = calculateStudentLoanRepayment(newGross, studentLoanPlan) - calculateStudentLoanRepayment(salary, studentLoanPlan);
            additionalNet = additionalGross - incomeTax - nationalInsurance - studentLoanRepayment;
        }

        return { additionalGross, incomeTax, nationalInsurance, studentLoanRepayment, additionalNet };
    }

    const { additionalGross, incomeTax, nationalInsurance, studentLoanRepayment, additionalNet } = calculateAdditionalGrossSalary(annualDesiredNetIncome);

    // Convert annual extra gross salary back to the selected frequency
    let extraGrossSalary, currentGross, targetGross, currentIncomeTax, targetIncomeTax, currentNIC, targetNIC, currentStudentLoan, targetStudentLoan, currentNetIncome, targetNetIncome;
    switch (extraFrequency) {
        case 'monthly':
            extraGrossSalary = additionalGross / 12;
            currentGross = salary / 12;
            targetGross = (salary + additionalGross) / 12;
            currentIncomeTax = calculateIncomeTax(salary) / 12;
            targetIncomeTax = calculateIncomeTax(salary + additionalGross) / 12;
            currentNIC = calculateNIC(salary) / 12;
            targetNIC = calculateNIC(salary + additionalGross) / 12;
            currentStudentLoan = calculateStudentLoanRepayment(salary, studentLoanPlan) / 12;
            targetStudentLoan = calculateStudentLoanRepayment(salary + additionalGross, studentLoanPlan) / 12;
            currentNetIncome = (salary - calculateIncomeTax(salary) - calculateNIC(salary) - calculateStudentLoanRepayment(salary, studentLoanPlan)) / 12;
            targetNetIncome = (salary + additionalGross - calculateIncomeTax(salary + additionalGross) - calculateNIC(salary + additionalGross) - calculateStudentLoanRepayment(salary + additionalGross, studentLoanPlan)) / 12;
            break;
        case 'yearly':
            extraGrossSalary = additionalGross;
            currentGross = salary;
            targetGross = salary + additionalGross;
            currentIncomeTax = calculateIncomeTax(salary);
            targetIncomeTax = calculateIncomeTax(salary + additionalGross);
            currentNIC = calculateNIC(salary);
            targetNIC = calculateNIC(salary + additionalGross);
            currentStudentLoan = calculateStudentLoanRepayment(salary, studentLoanPlan);
            targetStudentLoan = calculateStudentLoanRepayment(salary + additionalGross, studentLoanPlan);
            currentNetIncome = salary - calculateIncomeTax(salary) - calculateNIC(salary) - calculateStudentLoanRepayment(salary, studentLoanPlan);
            targetNetIncome = salary + additionalGross - calculateIncomeTax(salary + additionalGross) - calculateNIC(salary + additionalGross) - calculateStudentLoanRepayment(salary + additionalGross, studentLoanPlan);
            break;
        case 'weekly':
            extraGrossSalary = additionalGross / 52;
            currentGross = salary / 52;
            targetGross = (salary + additionalGross) / 52;
            currentIncomeTax = calculateIncomeTax(salary) / 52;
            targetIncomeTax = calculateIncomeTax(salary + additionalGross) / 52;
            currentNIC = calculateNIC(salary) / 52;
            targetNIC = calculateNIC(salary + additionalGross) / 52;
            currentStudentLoan = calculateStudentLoanRepayment(salary, studentLoanPlan) / 52;
            targetStudentLoan = calculateStudentLoanRepayment(salary + additionalGross, studentLoanPlan) / 52;
            currentNetIncome = (salary - calculateIncomeTax(salary) - calculateNIC(salary) - calculateStudentLoanRepayment(salary, studentLoanPlan)) / 52;
            targetNetIncome = (salary + additionalGross - calculateIncomeTax(salary + additionalGross) - calculateNIC(salary + additionalGross) - calculateStudentLoanRepayment(salary + additionalGross, studentLoanPlan)) / 52;
            break;
    }

    const formattedNetIncome = formatCurrency(desiredNetIncome);
    const formattedGrossSalary = formatCurrency(extraGrossSalary);

    document.getElementById('extraGrossSalary').textContent = 
        `To earn an additional ${formattedNetIncome} net salary per ${extraFrequency}, you need to increase your gross salary by ${formattedGrossSalary}.`;

    // Update the debug table with current and target values
    document.getElementById('debugCurrentGross').textContent = formatCurrency(currentGross);
    document.getElementById('debugTargetGross').textContent = formatCurrency(targetGross);
    document.getElementById('debugCurrentIncomeTax').textContent = formatCurrency(currentIncomeTax);
    document.getElementById('debugTargetIncomeTax').textContent = formatCurrency(targetIncomeTax);
    document.getElementById('debugCurrentNIC').textContent = formatCurrency(currentNIC);
    document.getElementById('debugTargetNIC').textContent = formatCurrency(targetNIC);
    document.getElementById('debugCurrentStudentLoan').textContent = formatCurrency(currentStudentLoan);
    document.getElementById('debugTargetStudentLoan').textContent = formatCurrency(targetStudentLoan);
    document.getElementById('debugCurrentNetIncome').textContent = formatCurrency(currentNetIncome);
    document.getElementById('debugTargetNetIncome').textContent = formatCurrency(targetNetIncome);
}

// Event Listener for Extra Salary Calculation
document.getElementById('calculateExtraButton').addEventListener('click', calculateExtraGrossSalary);

// Add event listener for "Enter" key press on the desired net income input
document.getElementById('desiredNetIncome').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        calculateExtraGrossSalary(); // Call the extra salary calculation function
    }
});

// Helper functions for marginal rates
function calculateMarginalTaxRate(income) {
    let marginalTaxRate = 0;
    for (let i = 0; i < TAX_BANDS.length; i++) {
        if (income > TAX_BANDS[i].limit) {
            marginalTaxRate = TAX_BANDS[i].rate;
        } else {
            break;
        }
    }
    return marginalTaxRate;
}

function calculateMarginalNICRate(income) {
    let marginalNICRate = 0;
    for (let i = 0; i < NIC_BANDS.length; i++) {
        if (income > NIC_BANDS[i].limit) {
            marginalNICRate = NIC_BANDS[i].rate;
        } else {
            break;
        }
    }
    return marginalNICRate;
}

function showCalculator(id) {
    const calculators = document.querySelectorAll('.calculator');
    calculators.forEach(calculator => {
        calculator.classList.remove('active');
    });
    const calculatorElement = document.getElementById(id);
    if (calculatorElement) {
        calculatorElement.classList.add('active');
    } else {
        console.error(`Calculator with ID '${id}' not found.`);
    }

    // Update active link
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
        link.classList.remove('active');
    });
    const linkElement = document.querySelector(`#${id.replace('-calculator', '')}-link`);
    if (linkElement) {
        linkElement.classList.add('active');
    } else {
        console.error(`Link with ID '${id.replace('-calculator', '')}-link' not found.`);
    }
}

// Centralized function to calculate income tax
function calculateIncomeTax(grossSalary) {
    let personalAllowance = 12570;
    const allowanceReductionThreshold = 100000;
    const allowanceReductionLimit = 125140;

    // Adjust personal allowance for high earners
    if (grossSalary > allowanceReductionThreshold) {
        const excessIncome = grossSalary - allowanceReductionThreshold;
        const reducedAllowance = Math.floor(excessIncome / 2);
        personalAllowance = Math.max(0, personalAllowance - reducedAllowance);
    }

    let taxableIncome = grossSalary - personalAllowance;
    let incomeTax = 0;

    if (taxableIncome > 0) {
        // Basic Rate
        const basicRateLimit = 37700;
        const basicRateTax = Math.min(taxableIncome, basicRateLimit) * 0.2;
        incomeTax += basicRateTax;

        // Higher Rate
        if (taxableIncome > basicRateLimit) {
            const higherRateLimit = 150000;
            const higherRateTax = Math.min(taxableIncome - basicRateLimit, higherRateLimit - basicRateLimit) * 0.4;
            incomeTax += higherRateTax;
        }
    }

    return incomeTax;
}

// Centralized function to calculate national insurance
function calculateNationalInsurance(grossSalary) {
    const primaryThreshold = 12570;
    const upperEarningsLimit = 50270;
    let nationalInsurance = 0;

    if (grossSalary > primaryThreshold) {
        // Main Rate (8%)
        const mainRate = Math.min(grossSalary, upperEarningsLimit) - primaryThreshold;
        nationalInsurance += mainRate * 0.08;

        // Upper Rate (2%)
        if (grossSalary > upperEarningsLimit) {
            const upperRate = grossSalary - upperEarningsLimit;
            nationalInsurance += upperRate * 0.02;
        }
    }

    return nationalInsurance;
}

// Centralized function to calculate net salary
function calculateNetSalary(grossSalary) {
    const incomeTax = calculateIncomeTax(grossSalary);
    const nationalInsurance = calculateNationalInsurance(grossSalary);
    return grossSalary - incomeTax - nationalInsurance;
}

// Event listener for the main calculator
document.getElementById('calculateButton').addEventListener('click', function() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const netSalary = calculateNetSalary(salary);

    // Update the main calculator results
    document.getElementById('netSalary').textContent = formatNumberWithCommas(netSalary.toFixed(2));
    // Show other results as needed
});

document.getElementById('compareButton').addEventListener('click', function() {
    const salary1 = parseFloat(document.getElementById('salary1').value) || 0;
    const salary2 = parseFloat(document.getElementById('salary2').value) || 0;

    // Calculate components for salary 1
    const grossSalary1 = salary1;
    const incomeTax1 = calculateIncomeTax(grossSalary1);
    const nationalInsurance1 = calculateNationalInsurance(grossSalary1);
    const netSalary1 = calculateNetSalary(grossSalary1);

    // Calculate components for salary 2
    const grossSalary2 = salary2;
    const incomeTax2 = calculateIncomeTax(grossSalary2);
    const nationalInsurance2 = calculateNationalInsurance(grossSalary2);
    const netSalary2 = calculateNetSalary(grossSalary2);

    // Update the results table
    updateResults('grossSalary', grossSalary1, grossSalary2);
    updateResults('incomeTax', incomeTax1, incomeTax2);
    updateResults('nationalInsurance', nationalInsurance1, nationalInsurance2);
    updateResults('netSalary', netSalary1, netSalary2);

    // Show the results section
    document.getElementById('compareResults').style.display = 'block';
});

function updateResults(component, value1, value2) {
    document.getElementById(`${component}1`).textContent = value1.toFixed(2);
    document.getElementById(`${component}2`).textContent = value2.toFixed(2);
    document.getElementById(`${component}Diff`).textContent = (value1 - value2).toFixed(2);
}

// Function to handle Enter key press in the first salary input
document.getElementById('salary1').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Prevent default form submission
        event.preventDefault();
        // Move focus to the second salary input
        document.getElementById('salary2').focus();
    }
});

// Function to handle Enter key press in the second salary input
document.getElementById('salary2').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Prevent default form submission
        event.preventDefault();
        // Trigger the calculation
        document.getElementById('compareButton').click();
    }
});

document.getElementById('calculateMortgageButton').addEventListener('click', function() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const annualInterestRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const loanTerm = parseInt(document.getElementById('loanTerm').value);

    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = loanTerm * 12;

    // Calculate monthly payment using the formula
    const monthlyPayment = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

    // Clear previous results
    const amortizationSchedule = document.getElementById('amortizationSchedule');
    amortizationSchedule.innerHTML = '';

    let remainingBalance = loanAmount;

    for (let i = 1; i <= numberOfPayments; i++) {
        const interestPayment = remainingBalance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

        // Create a new row for the amortization schedule
        const row = amortizationSchedule.insertRow();
        row.insertCell(0).textContent = i; // Payment Number
        row.insertCell(1).textContent = formatNumberWithCommas(monthlyPayment.toFixed(2)); // Payment
        row.insertCell(2).textContent = formatNumberWithCommas(principalPayment.toFixed(2)); // Principal
        row.insertCell(3).textContent = formatNumberWithCommas(interestPayment.toFixed(2)); // Interest
        row.insertCell(4).textContent = formatNumberWithCommas(remainingBalance.toFixed(2)); // Remaining Balance
    }

    // Show results
    document.getElementById('mortgageResults').style.display = 'block';
});

// Assuming you have the following input fields in your mortgage calculator
const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const loanTermInput = document.getElementById('loanTerm');
const calculateMortgageButton = document.getElementById('calculateMortgageButton');

// Function to handle Enter key press
function handleEnterKey(event, nextElement) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        if (nextElement) {
            nextElement.focus(); // Move focus to the next input
        } else {
            calculateMortgageButton.click(); // Click the calculate button if it's the last input
        }
    }
}

// Add event listeners to each input
loanAmountInput.addEventListener('keydown', function(event) {
    handleEnterKey(event, interestRateInput);
});

interestRateInput.addEventListener('keydown', function(event) {
    handleEnterKey(event, loanTermInput);
});

loanTermInput.addEventListener('keydown', function(event) {
    handleEnterKey(event, null); // No next element, so pass null
});

document.getElementById('toggleSidebar').addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');

    // Swap the icon when collapsed vs. expanded
    if (sidebar.classList.contains('collapsed')) {
        // Show the "chevron-right" icon if it's collapsed
        this.innerHTML = '<i class="fas fa-chevron-right"></i>';
    } else {
        // Show the "chevron-left" icon if it's expanded
        this.innerHTML = '<i class="fas fa-chevron-left"></i>';
    }
});

// Function to calculate the number of months needed to reach a savings goal
function calculateSavingsGoal() {
    const goalAmount = parseFloat(document.getElementById('goalAmount').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualInterestRate = parseFloat(document.getElementById('savingsInterestRate').value) / 100;

    if (isNaN(goalAmount) || isNaN(currentSavings) || isNaN(monthlyContribution) || isNaN(annualInterestRate)) {
        alert('Please enter valid numbers for all fields.');
        return;
    }

    let monthsNeeded = 0;
    let totalSavings = currentSavings;
    const monthlyInterestRate = annualInterestRate / 12;

    while (totalSavings < goalAmount) {
        totalSavings += monthlyContribution;
        totalSavings += totalSavings * monthlyInterestRate;
        monthsNeeded++;
    }

    document.getElementById('monthsNeeded').textContent = monthsNeeded;
    document.getElementById('savingsResults').style.display = 'block';
}

// Event listener for the Savings Goal Calculator button
document.getElementById('calculateSavingsButton').addEventListener('click', calculateSavingsGoal);
