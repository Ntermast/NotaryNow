import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create services
  const services = [
    { name: 'Deed Notarization', description: 'Notarization of property deeds', basePrice: 45 },
    { name: 'Power of Attorney', description: 'Legal document authorization', basePrice: 65 },
    { name: 'Mortgage Signing', description: 'Mortgage document signing', basePrice: 120 },
    { name: 'Affidavit', description: 'Written sworn statement', basePrice: 35 },
    { name: 'Will & Trust', description: 'Estate planning documents', basePrice: 95 },
    { name: 'Certified Copies', description: 'Certified document copies', basePrice: 25 }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }

  // Create certifications
  const certifications = [
    { name: 'NY State Notary License', description: 'Official state notary commission' },
    { name: 'NNA Certification', description: 'National Notary Association certification' },
    { name: 'Background Check', description: 'Comprehensive background verification' },
    { name: 'E&O Insurance', description: 'Errors & Omissions Insurance' }
  ];

  for (const cert of certifications) {
    await prisma.certification.upsert({
      where: { name: cert.name },
      update: {},
      create: cert,
    });
  }

  // Create sample admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@notarynow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@notarynow.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '555-123-4567'
    },
  });

  // Create sample notary user with profile in a separate step
  const notaryPassword = await hash('notary123', 10);
  const notary = await prisma.user.upsert({
    where: { email: 'john.smith@example.com' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      password: notaryPassword,
      role: 'NOTARY',
      phone: '555-987-6543',
    },
  });

  // Create or update notary profile
  const notaryProfile = await prisma.notaryProfile.upsert({
    where: { userId: notary.id },
    update: {
      isApproved: true,
      address: '123 Main St, Suite 101',
      city: 'Manhattan',
      state: 'NY',
      zip: '10001',
      hourlyRate: 75,
      averageRating: 4.9,
      bio: 'Experienced notary with 7 years in the industry.'
    },
    create: {
      userId: notary.id,
      isApproved: true,
      address: '123 Main St, Suite 101',
      city: 'Manhattan',
      state: 'NY',
      zip: '10001',
      hourlyRate: 75,
      averageRating: 4.9,
      bio: 'Experienced notary with 7 years in the industry.'
    },
  });

  // Get certifications
  const nyLicense = await prisma.certification.findUnique({
    where: { name: 'NY State Notary License' }
  });
  
  const nnaCert = await prisma.certification.findUnique({
    where: { name: 'NNA Certification' }
  });

  // Add certifications to notary
  if (nyLicense) {
    await prisma.notaryCertification.upsert({
      where: {
        notaryProfileId_certificationId: {
          notaryProfileId: notaryProfile.id,
          certificationId: nyLicense.id
        }
      },
      update: {
        dateObtained: new Date('2018-01-15')
      },
      create: {
        notaryProfileId: notaryProfile.id,
        certificationId: nyLicense.id,
        dateObtained: new Date('2018-01-15')
      }
    });
  }

  if (nnaCert) {
    await prisma.notaryCertification.upsert({
      where: {
        notaryProfileId_certificationId: {
          notaryProfileId: notaryProfile.id,
          certificationId: nnaCert.id
        }
      },
      update: {
        dateObtained: new Date('2019-03-20')
      },
      create: {
        notaryProfileId: notaryProfile.id,
        certificationId: nnaCert.id,
        dateObtained: new Date('2019-03-20')
      }
    });
  }

  // Get services
  const deedService = await prisma.service.findUnique({
    where: { name: 'Deed Notarization' }
  });
  
  const poaService = await prisma.service.findUnique({
    where: { name: 'Power of Attorney' }
  });
  
  const mortgageService = await prisma.service.findUnique({
    where: { name: 'Mortgage Signing' }
  });

  // Add services to notary
  if (deedService) {
    await prisma.notaryService.upsert({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId: deedService.id
        }
      },
      update: {},
      create: {
        notaryProfileId: notaryProfile.id,
        serviceId: deedService.id
      }
    });
  }

  if (poaService) {
    await prisma.notaryService.upsert({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId: poaService.id
        }
      },
      update: {},
      create: {
        notaryProfileId: notaryProfile.id,
        serviceId: poaService.id
      }
    });
  }

  if (mortgageService) {
    await prisma.notaryService.upsert({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId: mortgageService.id
        }
      },
      update: {},
      create: {
        notaryProfileId: notaryProfile.id,
        serviceId: mortgageService.id
      }
    });
  }

  // Create sample customer user
  const customerPassword = await hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'jane.doe@example.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '555-345-6789'
    },
  });

  console.log('Database seeded!');
  console.log('Admin:', admin.email);
  console.log('Notary:', notary.email);
  console.log('Customer:', customer.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });