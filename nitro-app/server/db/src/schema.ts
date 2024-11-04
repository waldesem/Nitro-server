import { z } from "zod";
import {
  boolean,
  date,
  index,
  integer,
  serial,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { createPasswordHash } from "~/utils";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullname: text("fullname").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passhash: text("passhash")
    .notNull()
    .$default(() => createPasswordHash("88888888")),
  pswd_create: timestamp("pswd_create")
    .notNull()
    .$default(() => sql`(CURRENT_TIMESTAMP)`),
  change_pswd: boolean("change_pswd").notNull().default(true),
  blocked: boolean("blocked").notNull().default(false),
  deleted: boolean("deleted").notNull().default(false),
  attempt: integer("attempt").notNull().default(0),
  role: text("role").notNull().default("guest"),
  region: text("region").notNull().default("Главный офис"),
  created: timestamp("created")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const userSchema = createInsertSchema(users);

export const persons = pgTable("persons", {
  id: serial("id").primaryKey(),
  surname: text("surname").notNull(),
  firstname: text("firstname").notNull(),
  patronymic: text("patronymic"),
  birthday: date("birthday").notNull(),
  birthplace: text("birthplace"),
  citizenship: text("citizenship"),
  dual: text("dual"),
  snils: text("snils"),
  inn: text("inn"),
  marital: text("marital"),
  addition: text("addition"),
  destination: text("destination"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  region: text("region"),
  editable: boolean("editable").default(false),
  user_id: integer("user_id").references(() => users.id),
});

export const personSchema = createInsertSchema(persons).extend({
  username: z.string(),
});

export const previous = pgTable("previous", {
  id: serial("id").primaryKey(),
  surname: text("surname").notNull(),
  firstname: text("firstname").notNull(),
  patronymic: text("patronymic"),
  changed: text("changed"),
  reason: text("reason"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const educations = pgTable("educations", {
  id: serial("id").primaryKey(),
  view: text("view").notNull(),
  institution: text("institution").notNull(),
  finished: text("finished").notNull(),
  specialty: text("specialty"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const staffs = pgTable("staffs", {
  id: serial("id").primaryKey(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const addresses = pgTable("documents", {
  id: serial("id").primaryKey(),
  view: text("view").notNull(),
  series: text("series"),
  digits: text("digits"),
  agency: text("agency"),
  issue: date("issue"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const contacts = pgTable("addresses", {
  id: serial("number").primaryKey(),
  view: text("text"),
  addresses: text("text"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("number").references(() => persons.id),
  user_id: integer("number").references(() => users.id),
});

export const documents = pgTable("contacts", {
  id: serial("id").primaryKey(),
  view: text("view").notNull(),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const workplaces = pgTable("workplaces", {
  id: serial("id").primaryKey(),
  now_work: boolean("now_work").default(false),
  starts: date("starts").notNull(),
  finished: date("finished"),
  workplace: text("workplace").notNull(),
  addresses: text("addresses"),
  position: text("position"),
  reason: text("reason"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const affilations = pgTable("affilations", {
  id: serial("id").primaryKey(),
  view: text("view").notNull(),
  organization: text("organization").notNull(),
  inn: text("inn"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const relations = pgTable("relations", {
  id: serial("id").primaryKey(),
  relation: text("relation").notNull(),
  relation_id: integer("relation_id").notNull(),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const checks = pgTable("checks", {
  id: serial("id").primaryKey(),
  workplace: text("workplace"),
  document: text("document"),
  inn: text("inn"),
  debt: text("debt"),
  bankruptcy: text("bankruptcy"),
  bki: text("bki"),
  courts: text("courts"),
  affilation: text("affilation"),
  terrorist: text("terrorist"),
  mvd: text("mvd"),
  internet: text("internet"),
  cronos: text("cronos"),
  cros: text("cros"),
  addition: text("addition"),
  comment: text("comment"),
  conclusion: text("conclusion"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const poligrafs = pgTable("poligrafs", {
  id: serial("id").primaryKey(),
  theme: text("theme"),
  results: text("results"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const investigations = pgTable("investigations", {
  id: serial("id").primaryKey(),
  theme: text("theme"),
  info: text("info"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  info: text("info"),
  initiator: text("initiator"),
  origins: text("origins"),
  created: timestamp("created").default(sql`(CURRENT_TIMESTAMP)`),
  person_id: integer("person_id").references(() => persons.id),
  user_id: integer("user_id").references(() => users.id),
});

export const itemsTables = {
  persons: persons,
  previous: previous,
  educations: educations,
  staffs: staffs,
  addresses: addresses,
  contacts: contacts,
  documents: documents,
  workplaces: workplaces,
  affilations: affilations,
  relations: relations,
  checks: checks,
  poligrafs: poligrafs,
  investigations: investigations,
  inquiries: inquiries,
};

export const itemsSchemas = {
  persons: personSchema,
  previous: createInsertSchema(previous),
  educations: createInsertSchema(educations),
  staffs: createInsertSchema(staffs),
  addresses: createInsertSchema(addresses),
  contacts: createInsertSchema(contacts),
  documents: createInsertSchema(documents),
  workplaces: createInsertSchema(workplaces),
  affilations: createInsertSchema(affilations),
  relations: createInsertSchema(relations),
  checks: createInsertSchema(checks),
  poligrafs: createInsertSchema(poligrafs),
  investigations: createInsertSchema(investigations),
  inquiries: createInsertSchema(inquiries),
};
