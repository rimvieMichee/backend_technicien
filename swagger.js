import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API technicien',
      version: '1.0.0',
      description: 'Documentation de toutes les routes du backend',
    },
  servers: [
  { url: 'http://localhost:3000' },
  // { url: 'https://frais.onrender.com' },
],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./auth/route/*.js', './mission/roue/*.js', './schemas/*.js'  ], // <-- Cible tous les fichiers .js dans routes et sous-dossiers
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  // UI Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Endpoint JSON brut
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  }); 
};
