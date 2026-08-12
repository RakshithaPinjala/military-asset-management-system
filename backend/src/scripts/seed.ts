import prisma from '../config/db';
import bcrypt from 'bcrypt';
import { createPurchaseTransaction } from '../services/purchaseService';
import { createTransferTransaction } from '../services/transferService';
import { createAssignmentTransaction } from '../services/assignmentService';
import { createExpenditureTransaction } from '../services/expenditureService';

async function main() {
  console.log('Seeding database with realistic scenario...');
  
  // Clean DB first to avoid duplicates
  await prisma.auditLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.base.deleteMany();

  // Create Bases
  const baseAlpha = await prisma.base.create({ data: { name: 'Alpha Command', location: 'Sector 7' } });
  const baseBravo = await prisma.base.create({ data: { name: 'Bravo Outpost', location: 'Sector 9' } });

  console.log(`Created bases: ${baseAlpha.name}, ${baseBravo.name}`);

  // Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mams.local',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      baseId: baseAlpha.id, // Admin assigned to Alpha conceptually
    }
  });

  // Create Logistics Officer for Alpha
  const logOfficer = await prisma.user.create({
    data: {
      email: 'logistics@mams.local',
      name: 'Alpha Logistics Officer',
      password: hashedPassword,
      role: 'LOGISTICS_OFFICER',
      baseId: baseAlpha.id,
    }
  });

  // Create Equipment Types
  const eqM4A1 = await prisma.equipmentType.create({ data: { name: 'M4A1 Carbine', category: 'WEAPON' } });
  const eqAmmo = await prisma.equipmentType.create({ data: { name: '5.56mm Standard NATO (Crate)', category: 'AMMUNITION' } });
  const eqHmmwv = await prisma.equipmentType.create({ data: { name: 'HMMWV M1114', category: 'VEHICLE' } });

  console.log('Created equipment types.');

  // Scenario 1: Initial Purchases at Alpha Command
  await createPurchaseTransaction(admin.id, {
    baseId: baseAlpha.id,
    equipmentTypeId: eqM4A1.id,
    quantity: 500,
    supplier: 'Colt Defense',
    notes: 'Initial stocking'
  });

  await createPurchaseTransaction(admin.id, {
    baseId: baseAlpha.id,
    equipmentTypeId: eqAmmo.id,
    quantity: 1000,
    supplier: 'Lake City AAP',
    notes: 'Initial stocking'
  });

  await createPurchaseTransaction(admin.id, {
    baseId: baseAlpha.id,
    equipmentTypeId: eqHmmwv.id,
    quantity: 50,
    supplier: 'AM General',
    notes: 'Initial stocking'
  });

  console.log('Purchases completed.');

  // Scenario 2: Transfer some equipment from Alpha to Bravo
  await createTransferTransaction(logOfficer.id, {
    sourceBaseId: baseAlpha.id,
    destinationBaseId: baseBravo.id,
    equipmentTypeId: eqM4A1.id,
    quantity: 100,
    notes: 'Reinforce Bravo Outpost'
  });

  await createTransferTransaction(logOfficer.id, {
    sourceBaseId: baseAlpha.id,
    destinationBaseId: baseBravo.id,
    equipmentTypeId: eqAmmo.id,
    quantity: 200,
    notes: 'Ammunition for Bravo'
  });

  console.log('Transfers completed.');

  // Scenario 3: Assign weapons to troops at Alpha
  await createAssignmentTransaction(logOfficer.id, {
    baseId: baseAlpha.id,
    equipmentTypeId: eqM4A1.id,
    quantity: 50,
    assignedTo: 'Platoon 1',
    notes: 'Standard deployment issue'
  });

  await createAssignmentTransaction(logOfficer.id, {
    baseId: baseAlpha.id,
    equipmentTypeId: eqHmmwv.id,
    quantity: 5,
    assignedTo: 'Platoon 1',
    notes: 'Recon team vehicles'
  });

  console.log('Assignments completed.');

  // Scenario 4: Expend some ammunition in training at Alpha
  await createExpenditureTransaction(logOfficer.id, {
    baseId: baseAlpha.id,
    equipmentTypeId: eqAmmo.id,
    quantity: 15,
    reason: 'Live Fire Exercise',
    notes: 'Platoon 1 qualification range'
  });

  console.log('Expenditures completed.');
  console.log('Database successfully seeded with scenario data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
