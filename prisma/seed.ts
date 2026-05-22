import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\ud83c\udf31 Starting database seed...");

  // Clean existing data (for development)
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.document.deleteMany();
  await prisma.client.deleteMany();
  await prisma.userOrganization.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash("demo123456", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@docsflow.app",
      name: "Demo User",
      passwordHash,
    },
  });

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: "Acme Solutions Sdn Bhd",
      email: "hello@acmesolutions.my",
      phone: "+60 12-345 6789",
      address: "Level 12, Menara UOA Bangsar, 59000 Kuala Lumpur",
      taxId: "202301234567",
      defaultCurrency: "MYR",
      defaultTaxRate: 0,
      invoicePrefix: "INV",
      quotePrefix: "QT",
      receiptPrefix: "REC",
      nextInvoiceNo: 1001,
      nextQuoteNo: 5001,
      nextReceiptNo: 3001,
    },
  });

  // Link user to organization as OWNER
  await prisma.userOrganization.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: "OWNER",
    },
  });

  // Create two demo clients
  const client1 = await prisma.client.create({
    data: {
      orgId: org.id,
      name: "TechNova Sdn Bhd",
      email: "procurement@technova.my",
      phone: "+60 3-2287 1122",
      billingAddress: "Unit 8-3, The Gardens, Mid Valley City, 59200 Kuala Lumpur",
      taxId: "201901234567",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      orgId: org.id,
      name: "Pixel & Co.",
      email: "accounts@pixelco.my",
      phone: "+60 17-888 3344",
      billingAddress: "No. 45, Jalan SS15/4, 47500 Subang Jaya, Selangor",
    },
  });

  console.log("\u2705 Seed completed successfully!");
  console.log(`\nLogin with:\n  Email: demo@docsflow.app\n  Password: demo123456\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });