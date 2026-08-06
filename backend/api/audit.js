import { db } from '../db.js';
import { NotFoundError } from '../middleware/errorHandler.js';

/**
 * Endpoint: Get complete audit history for a transaction or connected party name
 * GET /api/transactions/:id/audit
 */
export async function getAuditEndpoint(req, res) {
  const { id } = req.params;

  // Check if transaction exists (including soft-deleted ones)
  const transaction = await db.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  let auditLogs = [];
  let relatedCount = 1;
  const partyName = transaction.partyName ? transaction.partyName.trim() : null;

  if (partyName) {
    // Retrieve all transactions for this shopkeeper matching the same party / org name
    const relatedTransactions = await db.transaction.findMany({
      where: {
        shopkeeperId: transaction.shopkeeperId,
      },
    });

    const matchingTxs = relatedTransactions.filter(
      (t) => t.partyName && t.partyName.trim().toLowerCase() === partyName.toLowerCase()
    );

    relatedCount = matchingTxs.length || 1;
    const matchingTxIds = matchingTxs.map((t) => t.id);

    // Fetch combined audit logs sorted chronologically descending
    auditLogs = await db.auditLog.findMany({
      where: {
        transactionId: { in: matchingTxIds },
      },
      orderBy: { timestamp: 'desc' },
    });
  } else {
    // Single transaction fallback
    auditLogs = await db.auditLog.findMany({
      where: { transactionId: id },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Sort chronologically descending
  auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return res.status(200).json({
    success: true,
    partyName,
    relatedTransactionsCount: relatedCount,
    data: auditLogs,
  });
}

export default {
  getAuditEndpoint,
};