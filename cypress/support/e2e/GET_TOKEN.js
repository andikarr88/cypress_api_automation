describe('GET Token', () => {    
    let globalSignature, globalToken;
    
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
})