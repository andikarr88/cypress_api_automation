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

      // Log the generated 
      cy.log(`Generated TIMESTAMP: ${timestamp}`);
      cy.log(`Generated localdate: ${localdate}`);
      cy.log(`Generated localtime: ${localtime}`);
      cy.log(`Generated transdatetime: ${transdatetime}`);
      cy.log(`Generated referencenumber: ${referencenumber}`);
      cy.log(`Generated settlementdate: ${settlementdate}`);
      
      // Optionally, you can set the TIMESTAMP as an environment variable
      Cypress.env('TIMESTAMP', timestamp);
      Cypress.env('LOCALDATE', localdate);
      Cypress.env('LOCALTIME', localtime);
      Cypress.env('TRANSDATETIME', transdatetime);
      Cypress.env('REFERENCENUMBER', referencenumber);
      Cypress.env('SETTLEMENTDATE', settlementdate);

    });

  });

describe('Payment Integrator', () => {    
    let globalSignature, globalToken, globalSignatureInquiry;

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
        cy.get('@signatureToken').then((signatureToken) => {
            cy.log(JSON.stringify(signatureToken.body)),
            expect(signatureToken.body).to.have.property('signature')
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
        cy.get('@token').then((token) => {
            cy.log(JSON.stringify(token.body)),
            expect(token.body).to.have.property('accessToken')
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
                    "acquirerID": "00000000119",
                    "referenceNumber": Cypress.env('REFERENCENUMBER'),
                    "terminalID": "0000000000000003",
                    "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                    "transactionData": "PI0501000CN24            081398776000PM0211",
                    "currencyCode": "360",
                    "nationalPmtData": "",
                    "issuerCode": "00000000119",
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
        cy.get('@signatureInquiry').then((signatureInquiry) => {
            cy.log(JSON.stringify(signatureInquiry.body))
            expect(signatureInquiry.body).to.have.property('signature')
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
                    "acquirerID": "00000000119",
                    "referenceNumber": Cypress.env('REFERENCENUMBER'),
                    "terminalID": "0000000000000003",
                    "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                    "transactionData": "PI0501000CN24            081398776000PM0211",
                    "currencyCode": "360",
                    "nationalPmtData": "",
                    "issuerCode": "00000000119",
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
            cy.log(JSON.stringify(inquiry.body))
            expect(inquiry.body.responseCode).to.equal('00')
        });
    });
})