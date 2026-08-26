import { prisma } from '../utils/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

type StudentProfileInput = {
  fullName: string;
  phone?: string;
  nationality?: string;
  universityId?: string | null;
  organizationId?: string | null;
  programmeId?: string | null;
  countryId?: string | null;
};

export async function getStudentForUser(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { university: true, organization: true, programme: true, country: true },
  });
  if (!student) throw new NotFoundError('Student profile not found');
  return student;
}

export async function updateStudentProfile(userId: string, input: StudentProfileInput) {
  const student = await getStudentForUser(userId);

  if (student.source === 'UNIVERSITY' && !input.universityId) {
    throw new ValidationError([{ message: 'University affiliation is required for university students' }]);
  }
  if (student.source === 'ORGANIZATION' && !input.organizationId) {
    throw new ValidationError([{ message: 'Organization affiliation is required for organization students' }]);
  }
  if (student.source === 'INDEPENDENT' && (input.universityId || input.organizationId)) {
    throw new ValidationError([{ message: 'Independent students cannot have a university or organization affiliation' }]);
  }
  if (input.universityId && input.organizationId) {
    throw new ValidationError([{ message: 'University and organization affiliations cannot both be set' }]);
  }

  if (input.universityId) {
    const university = await prisma.university.findUnique({ where: { id: input.universityId } });
    if (!university) throw new NotFoundError('University not found');
  }
  if (input.organizationId) {
    const organization = await prisma.organization.findUnique({ where: { id: input.organizationId } });
    if (!organization) throw new NotFoundError('Organization not found');
  }
  if (input.programmeId) {
    const programme = await prisma.programme.findUnique({ where: { id: input.programmeId } });
    if (!programme) throw new NotFoundError('Programme not found');
  }
  if (input.countryId) {
    const country = await prisma.country.findUnique({ where: { id: input.countryId } });
    if (!country) throw new NotFoundError('Country not found');
  }

  return prisma.student.update({
    where: { userId },
    data: { ...input, profileCompleted: true },
    include: { university: true, organization: true, programme: true, country: true },
  });
}
