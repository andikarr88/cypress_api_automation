const cypress = require('cypress');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/results',
      overwrite: false,
      html: true,
      json: false,

    },
    baseUrl: 'http://10.132.128.4:8088',
    specPattern: "cypress/support/e2e",
    supportFile: false
  },
  env:{
    clientkey: '3b775b73a2cd31d1b2a3ae52aea02c18',
    privatekey: 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAvp7LRAa0eU0cJC6PHSFWAGFOr5qPjuCwxfLmMoXaa+AbFTjVNur0zRrvNjegxX+QmyP0xehVNrlO+lnZq/ramQIDAQABAkA+24g1v2xFz7qm57+DoJmGeJAE8hfCyq8gJ0/neyIijeq2NKc93+H3mh8HBt2DPuwmgyq/pZ8HpK1X5uyjFCU9AiEA8eEar/2bKhP0UfTgsqae8KXLeYElcEHX5S1YcP9fZK8CIQDJv58kHa+OLGvknNmMMJ4I6D2KgSikVaD44Sz+v7eXNwIgZM4M4kXOUeYJD9L/hlT8roxaVaQmJze5s3CHiGhVqE8CIBEr2BWw2SJWsZAxsWp3MNw9OA+z0ou6JgtIzxWXp76dAiEAucfV79IKlHPW1ZmkwtZlwTLLvk9Oj/PIPZwyX+NcKBQ=',
    clientsecret: '4wjywZj8WVOtBXY3yEq8kHudvCxjNp07FhvMcxMpd59P1FKayOBouMqlalwzmr/7LkwPZMSUfoB9iYbde4RMAw==',
    endpointurlinquiry: '/jalin/openapi/payment/paymentinquiry',
    endpointurlpayment: '/jalin/openapi/payment/paymentcredit',
    shopeepayopendenom_tlv: 'PI0501000CN24            081398776000PM0211'
  }
});
