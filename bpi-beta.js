const puppeteer = require('puppeteer-core');

async function run() {
    try {
        const username = ''; //Input username here
        const password = ''; //Input password here

        const usernameSelector = '.ui-bpi-login-form input[name=\'username\']';
        const passwordSelector = '.ui-bpi-login-form input[name=\'password\']';
        const loginBtnSelector = '.ui-bpi-login-form button[type=\'submit\']';
        const welcomeCtaSelector = '.welcome-screen-content__button-call-to-action';
        const accountListSelector = 'ul.account-list li:first-child ui-bpi-account-card-ng';
        const selectedProductSelector = '.product-selected-block';
        const accountNumberSelector = '.product-selected-block .product-name-block .product-caption';
        const totalCurrencySelector = '.product-selected-block .product-amount-block .amount-section:first-child .ui-currency-format__currency';
        const totalAmountSelector = '.product-selected-block .product-amount-block .amount-section:first-child .ui-currency-format__amount';
        const availableCurrencySelector = '.product-selected-block .product-amount-block .amount-section:last-child .ui-currency-format__currency';
        const availableAmountSelector = '.product-selected-block .product-amount-block .amount-section:last-child .ui-currency-format__amount';
        const detailsToggleSelector = '.account-details-section .details-summary-block a';
        const detailsListSelector = 'ui-bpi-product-details-ng';
        const accountTypeSelector = 'ui-bpi-product-details-ng .product-details__column:first-child .product-details__value';
        const bankSelector = 'ui-bpi-product-details-ng .product-details__column:nth-child(2) .product-details__value';
        const branchSelector = 'ui-bpi-product-details-ng .product-details__column:last-child .product-details__value';
        const transactionSelector = 'ui-bpi-transaction-record-list ul.transaction-list li';

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: 'chrome.exe'
        });
    
        const page = await browser.newPage();

        await page.goto('https://beta.bpiexpressonline.com/portalserver/onlinebanking/sign-in');
        await page.waitForSelector(usernameSelector);
        const usernameField = await page.$(usernameSelector);
        await usernameField.click();
        await page.keyboard.type(username);
        await page.waitForSelector(passwordSelector);
        const passwordField = await page.$(passwordSelector);
        await passwordField.click();
        await page.keyboard.type(password);
        await page.click(loginBtnSelector);
        
        //Beta welcome CTA. Might remove or tweak if needed.
        await page.waitForSelector(welcomeCtaSelector);
        await page.click(welcomeCtaSelector);
        
        //Navigate to account specified in account list selector. Start loop to accommodate all accounts here.
        await page.waitForSelector(accountListSelector, {
            visible: true
        });
        await page.click(accountListSelector);
        
        //Scrape account details.
        await page.waitForSelector(selectedProductSelector, {
            visible: true
        });
        const accountNumberElement = await page.$(accountNumberSelector);
        const accountNumber = await page.evaluate(element => element.textContent, accountNumberElement);
        const totalCurrencyElement = await page.$(totalCurrencySelector);
        const totalCurrency = await page.evaluate(element => element.textContent, totalCurrencyElement);
        const totalAmountElement = await page.$(totalAmountSelector);
        const totalAmount = await page.evaluate(element => element.textContent, totalAmountElement);
        const availableCurrencyElement = await page.$(availableCurrencySelector);
        const availableCurrency = await page.evaluate(element => element.textContent, availableCurrencyElement);
        const availableAmountElement = await page.$(availableAmountSelector);
        const availableAmount = await page.evaluate(element => element.textContent, availableAmountElement);
        await page.waitForSelector(detailsToggleSelector, {
            visible: true
        });
        await page.click(detailsToggleSelector);
        await page.waitForSelector(detailsListSelector, {
            visible: true
        });
        const accountTypeElement = await page.$(accountTypeSelector);
        const accountType = await page.evaluate(element => element.textContent, accountTypeElement);
        const bankElement = await page.$(bankSelector);
        const bank = await page.evaluate(element => element.textContent, bankElement);
        const branchElement = await page.$(branchSelector);
        const branch = await page.evaluate(element => element.textContent, branchElement);

        //Scrape transaction history details. Optimize loop.
        await page.waitForSelector(transactionSelector);
        const transactionsArray = await page.$$(transactionSelector);
        const transactions = [];
        for(i = 0; i < transactionsArray.length; i++) {
            transactions.push(await page.evaluate(element => ({
                month: element.querySelector('.transaction__header__month').textContent,
                day: element.querySelector('.transaction__header__day').textContent,
                description: element.querySelector('.transaction__header__description.ng-binding').textContent,
                details: element.querySelector('.transaction__header__transaction_details') ? ' ' + element.querySelector('.transaction__header__transaction_details').textContent : '',
                currency: element.querySelector('.ui-currency-format__currency').textContent,
                amount: element.querySelector('.ui-currency-format__amount').textContent
            }), transactionsArray[i]
            ));
        }

        console.log('Account number: ' + accountNumber);
        console.log('Total Amount: ' + totalCurrency + ' ' + totalAmount);
        console.log('Available Amount: ' + availableCurrency + ' ' + availableAmount);
        console.log('Account Type: ' + accountType);
        console.log('Bank ' + bank);
        console.log('Branch: ' + branch);
        console.log('');
        console.log('===================');
        console.log('Transaction History');
        console.log('===================');
        for(i = 0; i < transactions.length; i++) {
            console.log('Date: ' + transactions[i].month + ' ' + transactions[i].day);
            console.log('Details: ' + transactions[i].description + transactions[i].details);
            console.log('Amount: ' + transactions[i].currency + ' ' + transactions[i].amount);
            console.log('-------------------')
        }
        
    } catch(e) {
        console.log('ERROR')
        console.log(e)
    }
    
}

run();