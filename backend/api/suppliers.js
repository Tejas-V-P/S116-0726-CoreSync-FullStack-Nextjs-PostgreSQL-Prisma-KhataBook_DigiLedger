import { db } from '../db.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

/**
 * GET /api/suppliers?shopkeeperId=...
 */
export async function listSuppliers(req, res) {
  const shopkeeperId = req.query.shopkeeperId || req.body?.shopkeeperId;
  if (!shopkeeperId) {
    throw new ValidationError({ shopkeeperId: 'Shopkeeper ID is required' });
  }

  const suppliers = await db.supplier.findMany({
    where: { shopkeeperId },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json({
    success: true,
    data: suppliers,
  });
}

/**
 * POST /api/suppliers
 */
export async function createSupplier(req, res) {
  const { shopkeeperId, name, email, phone, company, category, totalSupplied, status } = req.body;

  if (!shopkeeperId || !name || !email || !phone) {
    throw new ValidationError({
      shopkeeperId: !shopkeeperId ? 'Shopkeeper ID is required' : undefined,
      name: !name ? 'Supplier name is required' : undefined,
      email: !email ? 'Email is required' : undefined,
      phone: !phone ? 'Phone is required' : undefined,
    });
  }

  const supplier = await db.supplier.create({
    data: {
      shopkeeperId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company ? company.trim() : null,
      category: category ? category.trim() : 'General',
      totalSupplied: parseFloat(totalSupplied) || 0,
      status: status || 'Active',
    },
  });

  return res.status(201).json({
    success: true,
    data: supplier,
  });
}

/**
 * PATCH /api/suppliers/:id
 */
export async function updateSupplier(req, res) {
  const { id } = req.params;
  const { name, email, phone, company, category, totalSupplied, status } = req.body;

  const existing = await db.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Supplier not found');
  }

  const updated = await db.supplier.update({
    where: { id },
    data: {
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? email.trim() : existing.email,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      company: company !== undefined ? company.trim() : existing.company,
      category: category !== undefined ? category.trim() : existing.category,
      totalSupplied: totalSupplied !== undefined ? parseFloat(totalSupplied) : existing.totalSupplied,
      status: status !== undefined ? status : existing.status,
    },
  });

  return res.status(200).json({
    success: true,
    data: updated,
  });
}

/**
 * DELETE /api/suppliers/:id
 */
export async function deleteSupplier(req, res) {
  const { id } = req.params;

  const existing = await db.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Supplier not found');
  }

  await db.supplier.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: 'Supplier deleted successfully',
  });
}

export default {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
