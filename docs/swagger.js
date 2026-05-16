const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Vaccination Appointment API',
    version: '1.0.0',
    description: 'API to manage vaccination appointments.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  tags: [
    {
      name: 'Appointments',
      description: 'Manage vaccination appointments',
    },
  ],
  components: {
    schemas: {
      Appointment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66456de6e3888f3c1f3bca98' },
          name: { type: 'string', example: 'Maria Silva' },
          cpf: { type: 'string', example: '12345678901' },
          email: { type: 'string', example: 'maria@email.com' },
          birthDate: { type: 'string', format: 'date-time' },
          appDate: { type: 'string', format: 'date-time' },
          appTime: { type: 'string', example: '10:30' },
          isSolved: { type: 'boolean', example: false },
          report: { type: 'string', example: '' },
        },
      },
      CreateAppointmentRequest: {
        type: 'object',
        required: ['name', 'cpf', 'email', 'birthDate', 'appDate', 'appTime'],
        properties: {
          name: { type: 'string', maxLength: 50 },
          cpf: { type: 'string', minLength: 11, maxLength: 11 },
          email: { type: 'string', maxLength: 30 },
          birthDate: { type: 'string', format: 'date-time' },
          appDate: { type: 'string', format: 'date-time' },
          appTime: {
            type: 'string',
            enum: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
          },
          report: { type: 'string', maxLength: 30 },
        },
      },
      UpdateAppointmentRequest: {
        type: 'object',
        required: ['isSolved', 'report'],
        properties: {
          isSolved: { type: 'boolean' },
          report: { type: 'string', maxLength: 30 },
        },
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/appointment': {
      get: {
        tags: ['Appointments'],
        summary: 'List all appointments',
        responses: {
          200: {
            description: 'Appointments found',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
          404: {
            description: 'No appointments in database',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Create a new appointment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAppointmentRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Appointment created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    app: { $ref: '#/components/schemas/Appointment' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation or scheduling conflict error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
          404: {
            description: 'Email or CPF already used',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
    },
    '/api/appointment/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get one appointment by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Appointment found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          404: {
            description: 'Appointment not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Appointments'],
        summary: 'Update appointment status/report by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAppointmentRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Appointment updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    app: { $ref: '#/components/schemas/Appointment' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Appointment not found or report too long',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Appointments'],
        summary: 'Delete appointment by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Appointment removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
          404: {
            description: 'Appointment not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
