function decodeTaxCode() {
    const taxCodeInput = document.getElementById('taxCodeInput');
    const taxCode = taxCodeInput.value.trim().toUpperCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results
  
    if (!taxCode) {
      resultDiv.innerHTML = '<p class="error">Please enter a tax code.</p>';
      return;
    }
  
    let numberPart = '';
    let letterPart = '';
  
    // Check for special codes without numbers
    const specialCodes = ['BR', 'D0', 'D1', 'NT', '0T'];
    if (specialCodes.includes(taxCode)) {
      letterPart = taxCode;
    } else {
      // Extract numbers and letters
      const matches = taxCode.match(/^(\d+)([A-Z]+)$/i) || taxCode.match(/^([A-Z])(\d+)$/i);
      if (matches) {
        if (taxCode.startsWith('K')) {
          letterPart = matches[1];
          numberPart = matches[2];
        } else {
          numberPart = matches[1];
          letterPart = matches[2];
        }
      } else {
        resultDiv.innerHTML = '<p class="error">Invalid tax code format. Please check and try again.</p>';
        return;
      }
    }
  
    // Interpret the number part
    let numberExplanation = '';
    if (numberPart) {
      const numberValue = parseInt(numberPart, 10);
      if (letterPart === 'K') {
        const additionalTaxableIncome = numberValue * 10;
        numberExplanation = `<p>You have £${additionalTaxableIncome.toLocaleString()} of untaxed income added to your taxable income.</p>`;
      } else {
        const personalAllowance = numberValue * 10;
        numberExplanation = `<p>Your Personal Allowance is £${personalAllowance.toLocaleString()}.</p>`;
      }
    } else {
      numberExplanation = '<p>No Personal Allowance is allocated in your tax code.</p>';
    }
  
    // Interpret the letter part
    let letterExplanation = '';
    switch (letterPart) {
      case 'L':
        letterExplanation = '<p>L: Entitled to the standard tax-free Personal Allowance.</p>';
        break;
      case 'M':
        letterExplanation = '<p>M: You have received 10% of your partner\'s Personal Allowance (Marriage Allowance recipient).</p>';
        break;
      case 'N':
        letterExplanation = '<p>N: You have transferred 10% of your Personal Allowance to your partner (Marriage Allowance transferor).</p>';
        break;
      case 'T':
        letterExplanation = '<p>T: Your tax code includes other calculations, often due to income over the Personal Allowance.</p>';
        break;
      case 'K':
        letterExplanation = '<p>K: Indicates you have income that is not being taxed another way, such as company benefits.</p>';
        break;
      case 'BR':
        letterExplanation = '<p>BR: All your income is taxed at the basic rate (20%).</p>';
        break;
      case 'D0':
        letterExplanation = '<p>D0: All your income is taxed at the higher rate (40%).</p>';
        break;
      case 'D1':
        letterExplanation = '<p>D1: All your income is taxed at the additional rate (45%).</p>';
        break;
      case '0T':
        letterExplanation = '<p>0T: No Personal Allowance; all income is taxed at your marginal rate.</p>';
        break;
      case 'NT':
        letterExplanation = '<p>NT: No tax is to be taken from your income or pension.</p>';
        break;
      default:
        letterExplanation = `<p>${letterPart}: This is a special or unknown tax code letter. Please consult HMRC or your tax advisor for details.</p>`;
        break;
    }
  
    // Display the results
    resultDiv.innerHTML = `
      <div class="result-section">
        <h2>Tax Code Entered: ${taxCode}</h2>
      </div>
      <div class="result-section">
        <h3>Number Part</h3>
        ${numberExplanation}
      </div>
      <div class="result-section">
        <h3>Letter Part</h3>
        ${letterExplanation}
      </div>
    `;
  }
  