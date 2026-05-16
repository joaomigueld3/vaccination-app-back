# Testing Guide

This project uses Node's native test runner with mocked `AppointmentModel` methods.

## Run tests

```sh
npm test
```

## What is covered

- `index`: empty list behavior
- `store`: duplicate email/CPF, date-time conflict, success creation
- `getOne`: found and not found
- `remove`: found and not found
- `update`: report length validation and success update

## Notes

- Tests do not require a running MongoDB instance.
- Model methods are mocked and restored for each scenario.
