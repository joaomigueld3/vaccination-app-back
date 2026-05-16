import test from 'node:test';
import assert from 'node:assert/strict';

import AppointmentController from '../src/controller/AppointmentController.js';
import AppointmentModel from '../src/model/AppointmentModel.js';

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(data) {
      this.payload = data;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
}

function restoreModelMethods(originalMethods) {
  Object.assign(AppointmentModel, originalMethods);
}

function modelMethodsSnapshot() {
  return {
    find: AppointmentModel.find,
    findOne: AppointmentModel.findOne,
    findById: AppointmentModel.findById,
    findByIdAndUpdate: AppointmentModel.findByIdAndUpdate,
    create: AppointmentModel.create,
  };
}

test('index returns 404 when there are no appointments', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.find = async () => [];

  await controller.index({}, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.payload, { message: 'No appointments found in database' });

  restoreModelMethods(originalMethods);
});

test('store returns 404 when email is already being used', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = {
    body: {
      name: 'Maria',
      cpf: '12345678901',
      email: 'maria@email.com',
      birthDate: '1990-10-10',
      appDate: '2030-05-10',
      appTime: '10:00',
      report: '',
    },
  };

  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.findOne = async (query) => {
    if (query.email) {
      return { _id: 'existing-id' };
    }
    return null;
  };

  await controller.store(request, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.payload, { message: 'email or CPF already being used' });

  restoreModelMethods(originalMethods);
});

test('store returns 400 when appointment date and time are already booked', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = {
    body: {
      name: 'Joao',
      cpf: '10987654321',
      email: 'joao@email.com',
      birthDate: '1992-09-09',
      appDate: '2030-05-10',
      appTime: '10:00',
      report: '',
    },
  };

  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.findOne = async () => null;
  AppointmentModel.find = async () => [{ appTime: '10:00' }];

  await controller.store(request, response);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.payload, {
    message: 'another appointment is already booked for this day and time',
  });

  restoreModelMethods(originalMethods);
});

test('store creates appointment successfully when no conflict exists', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = {
    body: {
      name: 'Carlos',
      cpf: '11122233344',
      email: 'carlos@email.com',
      birthDate: '1995-05-05',
      appDate: '2030-06-20',
      appTime: '11:00',
      report: '',
    },
  };

  const originalMethods = modelMethodsSnapshot();
  let createdPayload = null;

  AppointmentModel.findOne = async () => null;
  AppointmentModel.find = async () => [];
  AppointmentModel.create = async (payload) => {
    createdPayload = payload;
    return { _id: 'app-1', ...payload };
  };

  await controller.store(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.message, 'Appointment registred with success');
  assert.deepEqual(createdPayload, {
    name: 'Carlos',
    cpf: '11122233344',
    email: 'carlos@email.com',
    birthDate: '1995-05-05',
    appDate: '2030-06-20',
    appTime: '11:00',
    isSolved: false,
    report: '',
  });

  restoreModelMethods(originalMethods);
});

test('getOne returns appointment when it exists', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = { params: { id: 'abc123' } };
  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.findById = async () => ({ _id: 'abc123', name: 'Ana' });

  await controller.getOne(request, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, { _id: 'abc123', name: 'Ana' });

  restoreModelMethods(originalMethods);
});

test('getOne returns 404 when appointment does not exist', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = { params: { id: 'not-found' } };
  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.findById = async () => null;

  await controller.getOne(request, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.payload, { message: 'appointment not found!' });

  restoreModelMethods(originalMethods);
});

test('remove returns 200 when appointment exists', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = { params: { id: 'to-delete' } };
  const originalMethods = modelMethodsSnapshot();
  let removed = false;

  AppointmentModel.findById = async () => ({
    remove: async () => {
      removed = true;
    },
  });

  await controller.remove(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(removed, true);
  assert.deepEqual(response.payload, { message: 'Appointment removed' });

  restoreModelMethods(originalMethods);
});

test('remove returns 404 when appointment does not exist', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = { params: { id: 'missing' } };
  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.findById = async () => null;

  await controller.remove(request, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.payload, {
    message: "Appointment not found, therefore can't be removed",
  });

  restoreModelMethods(originalMethods);
});

test('update returns 404 when report exceeds 30 characters', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = {
    params: { id: '123' },
    body: {
      isSolved: true,
      report: 'this report has more than thirty characters',
    },
  };

  await controller.update(request, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.payload, { message: 'Report exceeds maximum length of 30' });
});

test('update returns 200 when appointment exists and payload is valid', async () => {
  const controller = new AppointmentController();
  const response = createResponse();
  const request = {
    params: { id: 'app-2' },
    body: {
      isSolved: true,
      report: 'Done',
    },
  };
  const originalMethods = modelMethodsSnapshot();

  AppointmentModel.findById = async () => ({ _id: 'app-2' });
  AppointmentModel.findByIdAndUpdate = async () => ({
    _id: 'app-2',
    isSolved: true,
    report: 'Done',
  });

  await controller.update(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.message, 'Appointment updated with success');
  assert.deepEqual(response.payload.app, {
    _id: 'app-2',
    isSolved: true,
    report: 'Done',
  });

  restoreModelMethods(originalMethods);
});
