-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('CASH', 'CARD');

-- CreateEnum
CREATE TYPE "cost_type" AS ENUM ('PERSON', 'LEADER');

-- CreateTable
CREATE TABLE "brand" (
    "id" SERIAL NOT NULL,
    "brandCode" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax" (
    "id" SERIAL NOT NULL,
    "taxCode" TEXT NOT NULL,
    "taxRate" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "departmentName" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_category" (
    "id" SERIAL NOT NULL,
    "expenseName" TEXT NOT NULL,
    "expenseCode" TEXT NOT NULL,
    "defaultPaymentType" "payment_type" NOT NULL DEFAULT 'CASH',
    "disablePaymentType" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "expense_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency" (
    "id" SERIAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencyName" TEXT NOT NULL,
    "currencyRate" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "companyCode" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessCode" TEXT,
    "businessName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "productCode" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),
    "duration" INTEGER,
    "productName" TEXT NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget" (
    "id" SERIAL NOT NULL,
    "dayNumber" INTEGER,
    "expenseTitle" TEXT NOT NULL,
    "currencyId" INTEGER,
    "paymentTypeId" INTEGER,
    "paymentType" "payment_type" NOT NULL,
    "taxId" INTEGER,
    "departmentId" INTEGER,
    "isActive" BOOLEAN NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "productId" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),
    "expenseCode" TEXT NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" SERIAL NOT NULL,
    "costType" "cost_type" NOT NULL,
    "costAmount" DECIMAL(65,30) DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),
    "budgetId" INTEGER NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "leader" TEXT NOT NULL,
    "tripCode" TEXT NOT NULL,
    "startingDate" TIMESTAMP(3) NOT NULL,
    "endingDate" TIMESTAMP(3) NOT NULL,
    "noOfPax" INTEGER NOT NULL,
    "noOfLeaders" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "noOfPacks" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" SERIAL NOT NULL,
    "expenseTitle" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "noOfPax" INTEGER NOT NULL,
    "noOfLeaders" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "expenseCategoryId" INTEGER NOT NULL,
    "paymentType" "payment_type" NOT NULL,
    "comment" TEXT,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "invoiceNumner" TEXT,
    "departmentId" INTEGER,
    "status" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),
    "recieptInfoId" INTEGER NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reciept_info" (
    "id" SERIAL NOT NULL,
    "uploadFilePath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedDate" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedDate" TIMESTAMP(3),

    CONSTRAINT "reciept_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_brandCode_key" ON "brand"("brandCode");

-- CreateIndex
CREATE UNIQUE INDEX "tax_taxCode_key" ON "tax"("taxCode");

-- CreateIndex
CREATE UNIQUE INDEX "department_departmentCode_key" ON "department"("departmentCode");

-- CreateIndex
CREATE UNIQUE INDEX "expense_category_expenseCode_key" ON "expense_category"("expenseCode");

-- CreateIndex
CREATE UNIQUE INDEX "currency_currencyCode_key" ON "currency"("currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "company_companyCode_key" ON "company"("companyCode");

-- CreateIndex
CREATE UNIQUE INDEX "product_productCode_key" ON "product"("productCode");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "expense_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_recieptInfoId_fkey" FOREIGN KEY ("recieptInfoId") REFERENCES "reciept_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
