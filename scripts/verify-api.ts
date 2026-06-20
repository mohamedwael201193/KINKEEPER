import "dotenv/config";
import { SignJWT, importPKCS8 } from "jose";
import { prisma } from "@kinkeeper/db";
import { loadEnv } from "../apps/api/src/config/env.js";
import { AuthService } from "../apps/api/src/services/auth.service.js";

const API = "http://localhost:3000";
const email = "ben.felix2001193@gmail.com";

const user = await prisma.user.findUniqueOrThrow({ where: { email: email.toLowerCase() } });
const auth = new AuthService(prisma);
const payload = await auth.buildJwtPayload(user);
const env = loadEnv();
const privateKey = await importPKCS8(env.jwtPrivateKey, "RS256");
const token = await new SignJWT(payload as Record<string, unknown>)
  .setProtectedHeader({ alg: "RS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(privateKey);

const headers = { Authorization: `Bearer ${token}` };
const chain = await fetch(`${API}/families/current/evidence/chain`, { headers }).then((r) => r.json());
const timeline = await fetch(`${API}/families/current/timeline`, { headers }).then((r) => r.json());
const alerts = await fetch(`${API}/families/current/alerts`, { headers }).then((r) => r.json());
const packets = await fetch(`${API}/families/current/evidence/packets`, { headers }).then((r) => r.json());

console.log("chain", chain);
console.log("timeline count", timeline.length);
console.log("alerts count", alerts.length);
console.log("packets count", packets.length);
const dashboard = await fetch(`${API}/families/current/dashboard`, { headers }).then((r) => r.json());
console.log("dashboard", dashboard);

await prisma.$disconnect();
