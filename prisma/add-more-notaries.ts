import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function addMoreNotaries() {
  // Additional notaries with different Kigali locations
  const additionalNotaries = [
    {
      name: 'Marie Mukamana',
      email: 'marie.mukamana@example.rw',
      phone: '+250 788 234 567',
      address: 'KK 20 St, Office Complex',
      city: 'Nyarugenge',
      state: 'Kigali',
      zip: 'Kigali', // Sector
      hourlyRate: 58000,
      bio: 'Specialized in corporate and real estate notarization with 5 years of experience in Kigali.',
      services: ['Deed Notarization', 'Affidavit', 'Certified Copies']
    },
    {
      name: 'David Nkurunziza', 
      email: 'david.nkurunziza@example.rw',
      phone: '+250 788 345 678',
      address: 'KG 12 Ave, Business Center',
      city: 'Kicukiro',
      state: 'Kigali',
      zip: 'Gatenga', // Sector
      hourlyRate: 72000,
      bio: 'Expert in legal document authentication and estate planning, serving Kicukiro district.',
      services: ['Will & Trust', 'Power of Attorney', 'Mortgage Signing']
    },
    {
      name: 'Agnes Uwimana',
      email: 'agnes.uwimana@example.rw', 
      phone: '+250 788 456 789',
      address: 'KN 5 Rd, Professional Plaza',
      city: 'Gasabo',
      state: 'Kigali',
      zip: 'Remera', // Sector
      hourlyRate: 65000,
      bio: 'Bilingual notary (English/Kinyarwanda) with expertise in international documents.',
      services: ['Deed Notarization', 'Power of Attorney', 'Certified Copies', 'Affidavit']
    },
    {
      name: 'Paul Habimana',
      email: 'paul.habimana@example.rw',
      phone: '+250 788 567 890', 
      address: 'KG 8 Ave, Legal Hub',
      city: 'Nyarugenge',
      state: 'Kigali',
      zip: 'Muhima', // Sector
      hourlyRate: 55000,
      bio: 'Fast and reliable notary services for individuals and small businesses in central Kigali.',
      services: ['Affidavit', 'Certified Copies', 'Deed Notarization']
    },
    {
      name: 'Grace Mukamazimpaka',
      email: 'grace.mukamazimpaka@example.rw',
      phone: '+250 788 678 901',
      address: 'KK 15 St, Tower Building', 
      city: 'Kicukiro',
      state: 'Kigali',
      zip: 'Niboye', // Sector
      hourlyRate: 69000,
      bio: 'Senior notary with 10+ years experience, specializing in complex legal documents.',
      services: ['Mortgage Signing', 'Will & Trust', 'Power of Attorney', 'Deed Notarization']
    }
  ];

  // Get existing services and certifications
  const services = await prisma.service.findMany();
  const certifications = await prisma.certification.findMany();
  const rwandaLicense = certifications.find(c => c.name === 'Rwanda Notary License');
  const barCert = certifications.find(c => c.name === 'Rwanda Bar Association Certification');

  for (const notaryData of additionalNotaries) {
    console.log(`Creating notary: ${notaryData.name}`);
    
    // Create user
    const password = await hash('notary123', 10);
    const user = await prisma.user.create({
      data: {
        name: notaryData.name,
        email: notaryData.email,
        password: password,
        role: 'NOTARY',
        phone: notaryData.phone,
      },
    });

    // Create notary profile
    const notaryProfile = await prisma.notaryProfile.create({
      data: {
        userId: user.id,
        isApproved: true,
        address: notaryData.address,
        city: notaryData.city,
        state: notaryData.state,
        zip: notaryData.zip,
        hourlyRate: notaryData.hourlyRate,
        averageRating: Math.random() * 1.5 + 3.5, // Random rating between 3.5-5.0
        bio: notaryData.bio,
      },
    });

    // Add certifications
    if (rwandaLicense) {
      await prisma.notaryCertification.create({
        data: {
          notaryProfileId: notaryProfile.id,
          certificationId: rwandaLicense.id,
          dateObtained: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Random date within last 3 years
          status: 'APPROVED'
        }
      });
    }

    if (barCert) {
      await prisma.notaryCertification.create({
        data: {
          notaryProfileId: notaryProfile.id,
          certificationId: barCert.id,
          dateObtained: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2), // Random date within last 2 years
          status: 'APPROVED'
        }
      });
    }

    // Add services
    for (const serviceName of notaryData.services) {
      const service = services.find(s => s.name === serviceName);
      if (service) {
        await prisma.notaryService.create({
          data: {
            notaryProfileId: notaryProfile.id,
            serviceId: service.id,
          },
        });
      }
    }
  }

  console.log(`Added ${additionalNotaries.length} additional notaries to the database!`);
}

addMoreNotaries()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });