import { db } from '../db.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

/**
 * GET /api/customers?shopkeeperId=...
 */
export async function listCustomers(req, res) {
  const shopkeeperId = req.query.shopkeeperId || req.body?.shopkeeperId;
  if (!shopkeeperId) {
    throw new ValidationError({ shopkeeperId: 'Shopkeeper ID is required' });
  }

  const customers = await db.customer.findMany({
    where: { shopkeeperId },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json({
    success: true,
    data: customers,
  });
}

/**
 * POST /api/customers
 */
export async function createCustomer(req, res) {
  const { shopkeeperId, name, email, phone, address, totalPurchased } = req.body;

  if (!shopkeeperId || !name || !email || !phone) {
    throw new ValidationError({
      shopkeeperId: !shopkeeperId ? 'Shopkeeper ID is required' : undefined,
      name: !name ? 'Customer name is required' : undefined,
      email: !email ? 'Email is required' : undefined,
      phone: !phone ? 'Phone is required' : undefined,
    });
  }

  const customer = await db.customer.create({
    data: {
      shopkeeperId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address ? address.trim() : null,
      totalPurchased: parseFloat(totalPurchased) || 0,
      lastOrder: new Date(),
    },
  });

  return res.status(201).json({
    success: true,
    data: customer,
  });
}

/**
 * PATCH /api/customers/:id
 */
export async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, email, phone, address, totalPurchased } = req.body;

  const existing = await db.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Customer not found');
  }

  const updated = await db.customer.update({
    where: { id },
    data: {
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? email.trim() : existing.email,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      address: address !== undefined ? address.trim() : existing.address,
      totalPurchased: totalPurchased !== undefined ? parseFloat(totalPurchased) : existing.totalPurchased,
    },
  });

  return res.status(200).json({
    success: true,
    data: updated,
  });
}

/**
 * DELETE /api/customers/:id
 */
export async function deleteCustomer(req, res) {
  const { id } = req.params;

  const existing = await db.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Customer not found');
  }

  await db.customer.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: 'Customer deleted successfully',
  });
}

export default {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};