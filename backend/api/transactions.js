import { db } from '../db.js';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '../middleware/errorHandler.js';
import { isLockedByOther, releaseLock } from './locks.js';

/**
 * Validate transaction payload
 */
function validateTransactionInput({ amount, type, description, shopkeeperId }) {
  const errors = {};
  
  if (!shopkeeperId) {
    errors.shopkeeperId = 'Shopkeeper ID is required';
  }
  
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.amount = 'Amount must be a positive number';
  }
  
  if (!type || !['CREDIT', 'DEBIT'].includes(type.toUpperCase())) {
    errors.type = 'Type must be CREDIT or DEBIT';
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (description.length > 500) {
    errors.description = 'Description must be under 500 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Endpoint: Create a new transaction
 * POST /api/transactions
 */
export async function createTransaction(req, res) {
  const { shopkeeperId, amount, type, partyName, description, userId } = req.body;
  const actingUserId = userId || shopkeeperId; // Fallback if shopkeeper performs change

  validateTransactionInput({ amount, type, description, shopkeeperId });

  const numAmount = parseFloat(amount);
  const formattedType = type.toUpperCase();
  const cleanPartyName = partyName ? partyName.trim() : null;

  // Execute creation and audit logging atomically inside a DB transaction
  const newTransaction = await db.$transaction(async (prisma) => {
    // 1. Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        shopkeeperId,
        amount: numAmount,
        type: formattedType,
        partyName: cleanPartyName,
        description: description.trim(),
        version: 1,
      },
    });

    // 2. Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        transactionId: transaction.id,
        userId: actingUserId,
        changeType: 'CREATE',
        oldValues: null,
        newValues: {
          amount: numAmount,
          type: formattedType,
          partyName: cleanPartyName,
          description: description.trim(),
          version: 1,
        },
        fieldsChanged: ['amount', 'type', 'partyName', 'description'],
      },
    });

    return transaction;
  });

  return res.status(201).json({
    success: true,
    data: newTransaction,
  });
}

/**
 * Endpoint: List paginated transactions for a shopkeeper
 * GET /api/transactions?shopkeeperId=...&page=1&limit=10
 */
export async function listTransactions(req, res) {
  const shopkeeperId = req.query.shopkeeperId || req.body?.shopkeeperId;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  if (!shopkeeperId) {
    throw new ValidationError({ shopkeeperId: 'Shopkeeper ID is required' });
  }

  // Count total non-deleted transactions
  const totalRecords = await db.transaction.count({
    where: {
      shopkeeperId,
      deletedAt: null,
    },
  });

  // Fetch paginated transactions
  const transactions = await db.transaction.findMany({
    where: {
      shopkeeperId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

  return res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
    },
  });
}

/**
 * Endpoint: Update an existing transaction (with lock & OCC checks)
 * PATCH /api/transactions/:id
 */
export async function updateTransaction(req, res) {
  const { id } = req.params;
  const { amount, type, partyName, description, userId, version: expectedVersion } = req.body;
  const actingUserId = userId || req.body.shopkeeperId;

  if (!actingUserId) {
    throw new ValidationError({ userId: 'User ID is required to update a transaction' });
  }

  // 1. Check pessimistic concurrency edit lock
  if (isLockedByOther(id, actingUserId)) {
    throw new ConflictError('Transaction is currently being edited by another shopkeeper');
  }

  // 2. Fetch existing transaction
  const existingTx = await db.transaction.findUnique({
    where: { id },
  });

  if (!existingTx || existingTx.deletedAt) {
    throw new NotFoundError('Transaction not found or has been deleted');
  }

  // 3. Optimistic Concurrency Control (OCC) version check
  if (expectedVersion !== undefined && expectedVersion !== null) {
    if (existingTx.version !== parseInt(expectedVersion, 10)) {
      throw new ConflictError('Transaction was updated by another user while you were editing. Please reload.', {
        currentVersion: existingTx.version,
        providedVersion: expectedVersion,
      });
    }
  }

  // Validate fields if provided
  const updatedAmount = amount !== undefined ? parseFloat(amount) : parseFloat(existingTx.amount);
  const updatedType = type ? type.toUpperCase() : existingTx.type;
  const updatedPartyName = partyName !== undefined ? (partyName ? partyName.trim() : null) : existingTx.partyName;
  const updatedDescription = description !== undefined ? description.trim() : existingTx.description;

  validateTransactionInput({
    amount: updatedAmount,
    type: updatedType,
    description: updatedDescription,
    shopkeeperId: existingTx.shopkeeperId,
  });

  // Track changed fields
  const fieldsChanged = [];
  const oldValues = {};
  const newValues = {};

  if (parseFloat(existingTx.amount) !== updatedAmount) {
    fieldsChanged.push('amount');
    oldValues.amount = parseFloat(existingTx.amount);
    newValues.amount = updatedAmount;
  }
  if (existingTx.type !== updatedType) {
    fieldsChanged.push('type');
    oldValues.type = existingTx.type;
    newValues.type = updatedType;
  }
  if (existingTx.partyName !== updatedPartyName) {
    fieldsChanged.push('partyName');
    oldValues.partyName = existingTx.partyName;
    newValues.partyName = updatedPartyName;
  }
  if (existingTx.description !== updatedDescription) {
    fieldsChanged.push('description');
    oldValues.description = existingTx.description;
    newValues.description = updatedDescription;
  }

  // If nothing changed, return existing
  if (fieldsChanged.length === 0) {
    releaseLock(id, actingUserId);
    return res.status(200).json({
      success: true,
      data: existingTx,
      message: 'No changes detected',
    });
  }

  // Execute update & audit logging inside atomic DB transaction
  const updatedTransaction = await db.$transaction(async (prisma) => {
    const transaction = await prisma.transaction.update({
      where: { 
        id,
        version: existingTx.version, // Enforce OCC at DB level
      },
      data: {
        amount: updatedAmount,
        type: updatedType,
        partyName: updatedPartyName,
        description: updatedDescription,
        version: { increment: 1 },
      },
    });

    await prisma.auditLog.create({
      data: {
        transactionId: id,
        userId: actingUserId,
        changeType: 'UPDATE',
        oldValues,
        newValues,
        fieldsChanged,
      },
    });

    return transaction;
  });

  // Release edit lock after successful update
  releaseLock(id, actingUserId);

  return res.status(200).json({
    success: true,
    data: updatedTransaction,
  });
}

/**
 * Endpoint: Soft-delete a transaction (with lock check & audit log)
 * DELETE /api/transactions/:id
 */
export async function deleteTransaction(req, res) {
  const { id } = req.params;
  const userId = req.body?.userId || req.query.userId || req.body?.shopkeeperId;

  if (!userId) {
    throw new ValidationError({ userId: 'User ID is required to delete a transaction' });
  }

  // 1. Check lock
  if (isLockedByOther(id, userId)) {
    throw new ConflictError('Transaction is currently being edited by another shopkeeper');
  }

  // 2. Find existing transaction
  const existingTx = await db.transaction.findUnique({
    where: { id },
  });

  if (!existingTx || existingTx.deletedAt) {
    throw new NotFoundError('Transaction not found or already deleted');
  }

  // Execute soft-delete and audit log atomically
  await db.$transaction(async (prisma) => {
    const deletedTimestamp = new Date();

    await prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: deletedTimestamp,
      },
    });

    await prisma.auditLog.create({
      data: {
        transactionId: id,
        userId,
        changeType: 'DELETE',
        oldValues: {
          amount: parseFloat(existingTx.amount),
          type: existingTx.type,
          description: existingTx.description,
          version: existingTx.version,
        },
        newValues: {
          deletedAt: deletedTimestamp,
        },
        fieldsChanged: ['deletedAt'],
      },
    });
  });

  // Release lock if held
  releaseLock(id, userId);

  return res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully',
  });
}

export default {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
};