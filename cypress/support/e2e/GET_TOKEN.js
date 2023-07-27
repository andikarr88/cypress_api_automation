describe('GET Token', () => {    
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
                    "transDateTime": "0727085934",
                    "traceNumber": "000001",
                    "localTime": "085934",
                    "localDate": "0727",
                    "settlementDate": "0728",
                    "channelCode": "6017",
                    "posEntryMode": "999",
                    "acquirerID": "00000000119",
                    "referenceNumber": "230725135934",
                    "terminalID": "0000000000000003",
                    "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                    "transactionData": "PI0501000CN24            081398776000PM0222",
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
                "transDateTime": "0727085934",
                "traceNumber": "000001",
                "localTime": "085934",
                "localDate": "0727",
                "settlementDate": "0728",
                "channelCode": "6017",
                "posEntryMode": "999",
                "acquirerID": "00000000119",
                "referenceNumber": "230725135934",
                "terminalID": "0000000000000003",
                "terminalNameLoc": "TEST MENARA DEA       JAKARTA SELAT068ID",
                "transactionData": "PI0501000CN24            081398776000PM0222",
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