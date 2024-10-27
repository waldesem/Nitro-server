import { z } from "zod";

const previousJson = z.object({
  firstNameBeforeChange: z.string().optional(),
  lastNameBeforeChange: z.string().optional(),
  midNameBeforeChange: z.string().optional(),
  yearOfChange: z.string().optional(),
  reason: z.string().optional(),
});

const educationJson = z.object({
  educationType: z.string().optional(),
  institutionName: z.string().optional(),
  endYear: z.string().optional(),
  specialty: z.string().optional(),
});

const experienceJson = z.object({
  beginDate: z.date().optional(),
  endDate: z.date().optional(),
  currentJob: z.boolean().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  fireReason: z.string().optional(),
});

const organizationsJson = z.object({
  view: z.literal("Участвует в деятельности коммерческих организаций"),
  name: z.string().optional(),
  inn: z.string().optional(),
});

const relatedPersonsOrganizationsJson = z.object({
  view: z.literal("Связанные лица работают в государственных организациях"),
  name: z.string().optional(),
  inn: z.string().optional(),
});

const stateOrganizationsJson = z.object({
  view: z.literal("Являлся государственным должностным лицом"),
  name: z.string().optional(),
});

const publicOfficeOrganizationsJson = z.object({
  view: z.literal("Являлся государственным или муниципальным служащим"),
  name: z.string().optional(),
});

export const anketaSchema = z.object({
  lastName: z.string().max(255),
  firstName: z.string().max(255),
  midName: z.string().max(255).optional(),
  birthday: z.date(),
  birthplace: z.string(),
  citizen: z.string().optional(),
  additionalCitizenship: z.string().optional(),
  maritalStatus: z.string().optional(),
  inn: z.string().optional(),
  snils: z.string().optional(),
  positionName: z.string().optional(),
  department: z.string().optional(),
  passportSerial: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  validAddress: z.string().optional(),
  regAddress: z.string().optional(),
  email: z.string().optional(),
  contactPhone: z.string().optional(),
  educations: z.array(educationJson),
  workplaces: z.array(experienceJson),
  previous: z.array(previousJson),
  organizations: z.array(organizationsJson),
  relatedPersonsOrganizations: z.array(relatedPersonsOrganizationsJson),
  stateOrganizations: z.array(stateOrganizationsJson),
  publicOfficeOrganizations: z.array(publicOfficeOrganizationsJson),
});
