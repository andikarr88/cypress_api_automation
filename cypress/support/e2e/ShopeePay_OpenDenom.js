import 'cypress-mochawesome-reporter/register';

describe('Generate', () => {
    it('Generates in the desired format', () => {
      // Get the current date and time
      const currentDate = new Date();
      
      // Format the date and time as per your desired format
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const timeZoneOffset = currentDate.getTimezoneOffset();

      const years = String(currentDate.getFullYear()).padStart(2, '0').slice(-2); // untuk ambil YY
      const days = String(currentDate.getDate() + 1).padStart(2, '0'); // untuk DD +1
      const secondss = String(currentDate.getSeconds() + 1).padStart(2, '0'); // untuk second +1
      
      // Calculate the timezone offset in the desired format (+/-HH:mm)
      const timeZoneOffsetHours = Math.floor(Math.abs(timeZoneOffset) / 60);
      const timeZoneOffsetMinutes = Math.abs(timeZoneOffset) % 60;
      const timeZoneOffsetSign = timeZoneOffset >= 0 ? '+' : '-';
      
      // Create the in the desired format
      const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timeZoneOffsetSign}${String(timeZoneOffsetHours).padStart(2, '0')}:${String(timeZoneOffsetMinutes).padStart(2, '0')}`;
      const localdate = `${month}${day}`;
      const localtime = `${hours}${minutes}${seconds}`
      const transdatetime = `${localdate}`+`${localtime}`
      const referencenumber = `${years}${month}${day}${hours}${minutes}${seconds}`
      const settlementdate = `${month}${days}`;
      const referencenumber1 = `${years}${month}${day}${hours}${minutes}${secondss}`

      // Log the generated 
      cy.log(`Generated TIMESTAMP: ${timestamp}`);
      cy.log(`Generated localdate: ${localdate}`);
      cy.log(`Generated localtime: ${localtime}`);
      cy.log(`Generated transdatetime: ${transdatetime}`);
      cy.log(`Generated referencenumber: ${referencenumber}`);
      cy.log(`Generated settlementdate: ${settlementdate}`);
      cy.log(`Generated referencenumber1: ${referencenumber1}`);
      
      // Optionally, you can set the TIMESTAMP as an environment variable
      Cypress.env('TIMESTAMP', timestamp);
      Cypress.env('LOCALDATE', localdate);
      Cypress.env('LOCALTIME', localtime);
      Cypress.env('TRANSDATETIME', transdatetime);
      Cypress.env('REFERENCENUMBER', referencenumber);
      Cypress.env('SETTLEMENTDATE', settlementdate);
      Cypress.env('REFERENCENUMBER1', referencenumber1);
    });
});

describe('Payment Integrator', () => {    
    let globalSignature, globalToken, globalSignatureInquiry, globalSignaturePayment, globalTransactionDataInquiryResponse, globalNationalPmtDataInquiryResponse;
    
    it('Signature Token', () => {
        cy.request({
            method: 'POST',
            url: '/auth/signature',
            headers: {
                'Accept-Encoding': 'application/json', 
                'Content-Type' : 'application/json',
                'x-timestamp': Cypress.env('TIMESTAMP'),
                'x-client-key': Cypress.env('clientkey'),
                'x-private-key': Cypress.env('privatekey')
            }
        }).as('signatureToken');
        cy.get('@signatureToken').then(signatureToken =>{
            expect(signatureToken.status).to.equal(200);
            // Simpan nilai JSON body dalam variabel global
            globalSignature = signatureToken.body.signature;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('globalSignature', globalSignature);
        });
        cy.get('@signatureToken').then(signatureToken =>{
            // menampilkan  body signature
            cy.log(JSON.stringify(signatureToken.body)),
            // assert expected
            expect(signatureToken.body).to.have.property('signature');
        });
    });

    it('Token', () => {
        cy.request({
            method: 'POST',
            url: '/auth/login',
            headers: {
                'Accept-Encoding': 'application/json', 
                'Content-Type' : 'application/json',
                'x-timestamp': Cypress.env('TIMESTAMP'),
                'x-client-key': Cypress.env('clientkey'),
                'x-signature': globalSignature
            },
            body: {
                "granttype": "client_credentials",
                "additionalInfo": {}
            }
        }).as('token');
        cy.get('@token').then(token =>{
            expect(token.status).to.equal(200);
            // Simpan nilai JSON body dalam variabel global
            globalToken = token.body.accessToken;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('globalToken', globalToken);
        });
        cy.get('@token').then(token =>{
            // menampilkan  body signature
            cy.log(JSON.stringify(token.body));
            // assert expected
            expect(token.body).to.have.property('accessToken');
        });
    });

    it('Signature Inquiry', () => {
        cy.request({
            method: 'POST',
            url: '/auth/signature/service',
            headers: {
                'Accept-Encoding': 'application/json', 
                'Content-Type' : 'application/json',
                'x-timestamp': Cypress.env('TIMESTAMP'),
                'x-client-secret': Cypress.env('clientsecret'),
                'httpmethod' : 'post',
                'endpoinurl' : Cypress.env('endpointurlinquiry'),
                'accesstoken': globalToken
            },
            body: {
                    "cardNumber": "0000000000000000",
                    "accountType": "10",
                    "transactionAmount": 20000,
                    "transDateTime": Cypress.env('TRANSDATETIME'),
                    "traceNumber": "000001",
                    "localTime": Cypress.env('LOCALTIME'),
                    "localDate": Cypress.env('LOCALDATE'),
                    "settlementDate": Cypress.env('SETTLEMENTDATE'),
                    "channelCode": "6017",
                    "posEntryMode": "999",
                    "acquirerID": "00000000116",
                    "referenceNumber": Cypress.env('REFERENCENUMBER'),
                    "terminalID": "0000000000000003",
                    "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                    "transactionData": Cypress.env('shopeepayopendenom_tlv'),
                    "currencyCode": "360",
                    "nationalPmtData": "",
                    "issuerCode": "00000000116",
                    "transactionIndicator": "0",
                    "destinationInstCode": "91800003500"
            }
        }).as('signatureInquiry');
        cy.get('@signatureInquiry').then(signatureInquiry =>{
            expect(signatureInquiry.status).to.equal(200);
            // Simpan nilai JSON body dalam variabel global
            globalSignatureInquiry = signatureInquiry.body.signature;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('globalSignatureInquiry', globalSignatureInquiry);
        });
        cy.get('@signatureInquiry').then(signatureInquiry =>{
            // menampilkan  body
            cy.log(JSON.stringify(signatureInquiry.body));
            // assert expected
            expect(signatureInquiry.body).to.have.property('signature');
        });
    });

    it('Inquiry', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('endpointurlinquiry'),
            headers: {
                authorization: 'Bearer ' + globalToken,
                'Accept-Encoding': 'application/json', 
                'Content-Type' : 'application/json',
                'x-timestamp': Cypress.env('TIMESTAMP'),                
                'x-signature': globalSignatureInquiry
            },
            body: {
                    "cardNumber": "0000000000000000",
                    "accountType": "10",
                    "transactionAmount": 20000,
                    "transDateTime": Cypress.env('TRANSDATETIME'),
                    "traceNumber": "000001",
                    "localTime": Cypress.env('LOCALTIME'),
                    "localDate": Cypress.env('LOCALDATE'),
                    "settlementDate": Cypress.env('SETTLEMENTDATE'),
                    "channelCode": "6017",
                    "posEntryMode": "999",
                    "acquirerID": "00000000116",
                    "referenceNumber": Cypress.env('REFERENCENUMBER'),
                    "terminalID": "0000000000000003",
                    "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                    "transactionData": Cypress.env('shopeepayopendenom_tlv'),
                    "currencyCode": "360",
                    "nationalPmtData": "",
                    "issuerCode": "00000000116",
                    "transactionIndicator": "0",
                    "destinationInstCode": "91800003500"
        }
        }).as('inquiry');
        cy.get('@inquiry').then(inquiry =>{
            expect(inquiry.status).to.equal(200);
            // Simpan nilai JSON body dalam variabel global
            inquiry = inquiry.body;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('inquiry', inquiry);
        });
        cy.get('@inquiry').then((inquiry) => {
            cy.log(JSON.stringify(inquiry.body));
            expect(inquiry.body.responseCode).to.equal('00');
        });
        cy.get('@inquiry').then(inquiry =>{
            // Simpan nilai JSON body dalam variabel global
            globalTransactionDataInquiryResponse = inquiry.body.transactionData;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('globalTransactionDataInquiryResponse', globalTransactionDataInquiryResponse);
            cy.log(`transactionData: ${globalTransactionDataInquiryResponse}`);
        });
        cy.get('@inquiry').then(inquiry =>{
            // Simpan nilai JSON body dalam variabel global
            globalNationalPmtDataInquiryResponse = inquiry.body.nationalPmtData;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('globalNationalPmtDataInquiryResponse', globalNationalPmtDataInquiryResponse);
            cy.log(`nationalPmtData: ${globalNationalPmtDataInquiryResponse}`);
        });
    });

    it('Signature Payment', () => {
        cy.request({
            method: 'POST',
            url: '/auth/signature/service',
            headers: {
                'Accept-Encoding': 'application/json', 
                'Content-Type' : 'application/json',
                'x-timestamp': Cypress.env('TIMESTAMP'),
                'x-client-secret': Cypress.env('clientsecret'),
                'httpmethod' : 'post',
                'endpoinurl' : Cypress.env('endpointurlpayment'),
                'accesstoken': globalToken
            },
            body: {
                    "cardNumber": "0000000000000000",
                    "accountType": "10",
                    "transactionAmount": 20000,
                    "transDateTime": Cypress.env('TRANSDATETIME'),
                    "traceNumber": "000001",
                    "localTime": Cypress.env('LOCALTIME'),
                    "localDate": Cypress.env('LOCALDATE'),
                    "settlementDate": Cypress.env('SETTLEMENTDATE'),
                    "channelCode": "6017",
                    "posEntryMode": "999",
                    "acquirerID": "00000000116",
                    "referenceNumber": Cypress.env('REFERENCENUMBER1'),
                    "terminalID": "0000000000000003",
                    "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                    "transactionData": Cypress.env('globalTransactionDataInquiryResponse'),
                    "currencyCode": "360",
                    "nationalPmtData": Cypress.env('globalNationalPmtDataInquiryResponse'),
                    "issuerCode": "00000000116",
                    "transactionIndicator": "2",
                    "destinationInstCode": "91800003500"
            }
        }).as('signaturePayment');
        cy.get('@signaturePayment').then(signaturePayment =>{
            expect(signaturePayment.status).to.equal(200);
            // Simpan nilai JSON body dalam variabel global
            globalSignaturePayment = signaturePayment.body.signature;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('globalSignaturePayment', globalSignaturePayment);
        });
        cy.get('@signaturePayment').then(signaturePayment =>{
            // menampilkan body
            cy.log(JSON.stringify(signaturePayment.body));
            // assert expected
            expect(signaturePayment.body).to.have.property('signature');
        });
    });

    it('Payment', () => {
        cy.request({
            method: 'POST',
            url: Cypress.env('endpointurlpayment'),
            headers: {
                authorization: 'Bearer ' + globalToken,
                'Accept-Encoding': 'application/json', 
                'Content-Type' : 'application/json',
                'x-timestamp': Cypress.env('TIMESTAMP'),                
                'x-signature': globalSignaturePayment
            },
            body: {
                "cardNumber": "0000000000000000",
                "accountType": "10",
                "transactionAmount": 20000,
                "transDateTime": Cypress.env('TRANSDATETIME'),
                "traceNumber": "000001",
                "localTime": Cypress.env('LOCALTIME'),
                "localDate": Cypress.env('LOCALDATE'),
                "settlementDate": Cypress.env('SETTLEMENTDATE'),
                "channelCode": "6017",
                "posEntryMode": "999",
                "acquirerID": "00000000116",
                "referenceNumber": Cypress.env('REFERENCENUMBER1'),
                "terminalID": "0000000000000003",
                "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                "transactionData": Cypress.env('globalTransactionDataInquiryResponse'),
                "currencyCode": "360",
                "nationalPmtData": Cypress.env('globalNationalPmtDataInquiryResponse'),
                "issuerCode": "00000000116",
                "transactionIndicator": "2",
                "destinationInstCode": "91800003500"
        }
        }).as('payment');
        cy.get('@payment').then(payment =>{
            expect(payment.status).to.equal(200);
            // Simpan nilai JSON body dalam variabel global
            payment = payment.body;
            // Simpan nilai JSON body dalam environment variable Cypress
            Cypress.env('payment', payment);
        });
        cy.get('@payment').then((payment) => {
            cy.log(JSON.stringify(payment.body));
            expect(payment.body.responseCode).to.equal('00');
        });
    });
})