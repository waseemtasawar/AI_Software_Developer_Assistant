const includesAny = (items, technologies) => {
  return technologies.some((technology) => items.includes(technology));
};

const detectFrontend = (allDependencies, files) => {
  if (allDependencies.includes("next")) {
    return "Next.js";
  }

  if (allDependencies.includes("react")) {
    return "React";
  }

  if (allDependencies.includes("vue")) {
    return "Vue.js";
  }

  if (
    allDependencies.includes("@angular/core") ||
    allDependencies.includes("@angular/cli")
  ) {
    return "Angular";
  }

  if (allDependencies.includes("svelte")) {
    return "Svelte";
  }

  if (allDependencies.includes("nuxt")) {
    return "Nuxt.js";
  }

  if (allDependencies.includes("vite")) {
    return "Vite-based frontend";
  }

  const hasHtmlFiles = files.some((file) =>
    file.fileName?.toLowerCase().endsWith(".html")
  );

  if (hasHtmlFiles) {
    return "HTML/CSS/JavaScript";
  }

  return "Not detected";
};

const detectBackend = (allDependencies, files) => {
  if (allDependencies.includes("@nestjs/core")) {
    return "NestJS";
  }

  if (allDependencies.includes("express")) {
    return "Express.js";
  }

  if (allDependencies.includes("fastify")) {
    return "Fastify";
  }

  if (allDependencies.includes("koa")) {
    return "Koa.js";
  }

  if (allDependencies.includes("hapi")) {
    return "Hapi.js";
  }

  const pythonContents = files
    .filter((file) => file.fileName?.toLowerCase().endsWith(".py"))
    .map((file) => file.content || "")
    .join("\n")
    .toLowerCase();

  if (
    pythonContents.includes("from django") ||
    pythonContents.includes("import django")
  ) {
    return "Django";
  }

  if (
    pythonContents.includes("from flask") ||
    pythonContents.includes("import flask")
  ) {
    return "Flask";
  }

  if (
    pythonContents.includes("from fastapi") ||
    pythonContents.includes("import fastapi")
  ) {
    return "FastAPI";
  }

  const hasNodeServerFile = files.some((file) => {
    const name = file.fileName?.toLowerCase();

    return (
      name === "server.js" ||
      name === "app.js" ||
      name === "index.js"
    );
  });

  if (hasNodeServerFile) {
    return "Node.js";
  }

  return "Not detected";
};

const detectDatabase = (allDependencies, files) => {
  if (
    includesAny(allDependencies, [
      "mongoose",
      "mongodb",
      "mongodb-memory-server",
    ])
  ) {
    return "MongoDB";
  }

  if (
    includesAny(allDependencies, [
      "pg",
      "postgres",
      "sequelize",
      "typeorm",
    ])
  ) {
    return "PostgreSQL";
  }

  if (
    includesAny(allDependencies, [
      "mysql",
      "mysql2",
      "sequelize",
    ])
  ) {
    return "MySQL";
  }

  if (
    includesAny(allDependencies, [
      "sqlite3",
      "better-sqlite3",
    ])
  ) {
    return "SQLite";
  }

  if (
    includesAny(allDependencies, [
      "firebase",
      "firebase-admin",
    ])
  ) {
    return "Firebase";
  }

  if (
    includesAny(allDependencies, [
      "@prisma/client",
      "prisma",
    ])
  ) {
    return "Prisma ORM";
  }

  if (
    includesAny(allDependencies, [
      "redis",
      "ioredis",
    ])
  ) {
    return "Redis";
  }

  const combinedContent = files
    .map((file) => file.content || "")
    .join("\n")
    .toLowerCase();

  if (combinedContent.includes("mongodb://")) {
    return "MongoDB";
  }

  if (combinedContent.includes("postgresql://")) {
    return "PostgreSQL";
  }

  if (combinedContent.includes("mysql://")) {
    return "MySQL";
  }

  return "Not detected";
};

const detectFramework = ({ frontend, backend }) => {
  if (
    frontend !== "Not detected" &&
    backend !== "Not detected"
  ) {
    return `${frontend} + ${backend}`;
  }

  if (frontend !== "Not detected") {
    return frontend;
  }

  if (backend !== "Not detected") {
    return backend;
  }

  return "Not detected";
};

const detectTechnologies = ({
  dependencies = [],
  devDependencies = [],
  files = [],
}) => {
  const allDependencies = [
    ...new Set([...dependencies, ...devDependencies]),
  ];

  const frontend = detectFrontend(allDependencies, files);
  const backend = detectBackend(allDependencies, files);
  const database = detectDatabase(allDependencies, files);
  const framework = detectFramework({ frontend, backend });

  return {
    frontend,
    backend,
    database,
    framework,
  };
};

module.exports = detectTechnologies;