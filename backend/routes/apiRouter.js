import express from 'express';
import {
  register,
  login,
  getCurrentUser,
} from '../api/auth.js';
import {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
} from '../api/transactions.js';
import {
  acquireLockEndpoint,
  releaseLockEndpoint,
} from '../api/locks.js';
import {
  getAuditEndpoint,
} from '../api/audit.js';
import {
  getBalanceEndpoint,
} from '../api/balance.js';
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../api/customers.js';
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../api/suppliers.js';
import {
  asyncHandler,
} from '../middleware/errorHandler.js';

export const router = express.Router();

// Auth Endpoints
router.post('/auth/register', asyncHandler(register));
router.post('/auth/login', asyncHandler(login));
router.get('/auth/me', asyncHandler(getCurrentUser));
router.put('/auth/profile', asyncHandler(updateProfile));

// Transaction Endpoints
router.post('/transactions', asyncHandler(createTransaction));
router.get('/transactions', asyncHandler(listTransactions));
router.patch('/transactions/:id', asyncHandler(updateTransaction));
router.delete('/transactions/:id', asyncHandler(deleteTransaction));

// Lock Endpoints
router.get('/transactions/:id/lock', asyncHandler(acquireLockEndpoint));
router.delete('/transactions/:id/lock', asyncHandler(releaseLockEndpoint));

// Audit Endpoints
router.get('/transactions/:id/audit', asyncHandler(getAuditEndpoint));

// Balance Endpoints
router.get('/balance', asyncHandler(getBalanceEndpoint));

// Customer Endpoints
router.get('/customers', asyncHandler(listCustomers));
router.post('/customers', asyncHandler(createCustomer));
router.patch('/customers/:id', asyncHandler(updateCustomer));
router.delete('/customers/:id', asyncHandler(deleteCustomer));

// Supplier Endpoints
router.get('/suppliers', asyncHandler(listSuppliers));
router.post('/suppliers', asyncHandler(createSupplier));
router.patch('/suppliers/:id', asyncHandler(updateSupplier));
router.delete('/suppliers/:id', asyncHandler(deleteSupplier));

export default router;