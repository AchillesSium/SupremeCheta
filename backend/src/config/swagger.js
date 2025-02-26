const swaggerJsdoc = require('swagger-jsdoc');
const YAML = require('yamljs');
const path = require('path');

// Load the YAML file
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

const options = {
  definition: {
    ...swaggerDocument,
    components: {
      ...swaggerDocument.components,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/controllers/*.js'
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
