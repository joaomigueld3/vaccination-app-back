import express from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './swagger.js';

const docsRouter = express.Router();

docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default docsRouter;
