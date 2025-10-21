import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create services (prices in RWF)
  const services = [
    { name: 'Deed Notarization', description: 'Notarization of property deeds', basePrice: 38000 },
    { name: 'Power of Attorney', description: 'Legal document authorization', basePrice: 55000 },
    { name: 'Mortgage Signing', description: 'Mortgage document signing', basePrice: 102000 },
    { name: 'Affidavit', description: 'Written sworn statement', basePrice: 30000 },
    { name: 'Will & Trust', description: 'Estate planning documents', basePrice: 81000 },
    { name: 'Certified Copies', description: 'Certified document copies', basePrice: 21000 }
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
    { name: 'Rwanda Notary License', description: 'Official Rwanda notary commission' },
    { name: 'Rwanda Bar Association Certification', description: 'Rwanda Bar Association notary certification' },
    { name: 'Background Check', description: 'Comprehensive background verification' },
    { name: 'Professional Indemnity Insurance', description: 'Professional liability insurance coverage' }
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
    where: { email: 'admin@notaryavailability.rw' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@notaryavailability.rw',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+250 788 000 001'
    },
  });

  // Create sample notary user with profile in a separate step
  const notaryPassword = await hash('notary123', 10);
  const notary = await prisma.user.upsert({
    where: { email: 'jean.uwimana@example.rw' },
    update: {},
    create: {
      name: 'Jean Uwimana',
      email: 'jean.uwimana@example.rw',
      password: notaryPassword,
      role: 'NOTARY',
      phone: '+250 788 123 456',
    },
  });

  // Create or update notary profile
  const notaryProfile = await prisma.notaryProfile.upsert({
    where: { userId: notary.id },
    update: {
      isApproved: true,
      approvalStatus: 'APPROVED',
      address: 'KG 15 Ave, Building #23',
      city: 'Gasabo',
      state: 'Kigali',
      zip: 'Kimironko',
      hourlyRate: 64000,
      averageRating: 4.9,
      bio: 'Experienced notary with 7 years in the industry, serving clients across Kigali.'
    },
    create: {
      userId: notary.id,
      isApproved: true,
      approvalStatus: 'APPROVED',
      address: 'KG 15 Ave, Building #23',
      city: 'Gasabo',
      state: 'Kigali',
      zip: 'Kimironko',
      hourlyRate: 64000,
      averageRating: 4.9,
      bio: 'Experienced notary with 7 years in the industry, serving clients across Kigali.'
    },
  });

  // Get certifications
  const rwandaLicense = await prisma.certification.findUnique({
    where: { name: 'Rwanda Notary License' }
  });
  
  const barCert = await prisma.certification.findUnique({
    where: { name: 'Rwanda Bar Association Certification' }
  });

  // Add certifications to notary
  if (rwandaLicense) {
    await prisma.notaryCertification.upsert({
      where: {
        notaryProfileId_certificationId: {
          notaryProfileId: notaryProfile.id,
          certificationId: rwandaLicense.id
        }
      },
      update: {
        dateObtained: new Date('2018-01-15'),
        status: 'APPROVED'
      },
      create: {
        notaryProfileId: notaryProfile.id,
        certificationId: rwandaLicense.id,
        dateObtained: new Date('2018-01-15'),
        status: 'APPROVED'
      }
    });
  }

  if (barCert) {
    await prisma.notaryCertification.upsert({
      where: {
        notaryProfileId_certificationId: {
          notaryProfileId: notaryProfile.id,
          certificationId: barCert.id
        }
      },
      update: {
        dateObtained: new Date('2019-03-20'),
        status: 'APPROVED'
      },
      create: {
        notaryProfileId: notaryProfile.id,
        certificationId: barCert.id,
        dateObtained: new Date('2019-03-20'),
        status: 'APPROVED'
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
