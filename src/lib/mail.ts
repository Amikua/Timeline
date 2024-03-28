import Imap from "imap";
import {
  type AddressObject,
  type ParsedMail,
  simpleParser,
  type Source,
} from "mailparser";
import { db } from "~/server/db";

const processEmail = async (parsed: ParsedMail, username: string) => {
  const to: AddressObject[] = [];
  if (!parsed.to) {
    console.error("No 'to' field found in email");
    return;
  }

  if (Array.isArray(parsed.to)) {
    to.push(...parsed.to);
  } else {
    to.push(parsed.to);
  }

  const recipients = to.map((recipient) => recipient.value);

  const from = parsed.from!.value;
  const fromEmail = from[0]!.address!;
  const usernamePrefix = username.split("@")[0]!;
  const AuthorsWithProjectIds: {
    author: string;
    projectId: string;
  }[] = [];

  recipients.forEach((recipient) => {
    recipient
      .filter((address) => address.address?.startsWith(usernamePrefix))
      .map((address) => address.address)
      .filter((it) => it !== undefined)
      .forEach((address) => {
        const projectId = address.split("@")[0]?.split("+")[1];
        if (!projectId) {
          console.error("No projectId found in email address");
          return;
        }
        AuthorsWithProjectIds.push({ author: fromEmail, projectId });
      });
  });

  const content = parsed.text;
  if (!AuthorsWithProjectIds.length || !content) {
    console.error("No author or projectId or content found in email");
    return;
  }
  console.log(AuthorsWithProjectIds, content);

  for (const it of AuthorsWithProjectIds) {
    try {
      const user = await db.user.findFirst({
        where: {
          email: it.author,
          projects: {
            some: {
              id: it.projectId,
            },
          },
        },
      });
      if (!user) {
        console.error(
          `Did not find user with email ${it.author} that is part of project ${it.projectId}`,
        );
        return;
      }
      await db.projectEvent.create({
        data: {
          author: {
            connect: {
              id: user.id,
            },
          },
          content,
          category: "SPEECH",
          Project: {
            connect: {
              id: it.projectId,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error while creating project event", error);
    }
  }
};

export async function readEmails(username: string, password: string) {
  console.log("Reading emails...");
  const imapConfig = {
    user: username,
    password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };
  const imap = new Imap(imapConfig);

  return new Promise((resolve, reject) => {
    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, _) => {
        if (err) throw err;

        const criteria = ["UNSEEN"];
        const fetchOptions = { bodies: "", markSeen: true };

        imap.search(criteria, (err, results) => {
          if (err || !results.length) {
            imap.end();
            return reject(new Error("No unseen emails found."));
          }

          const f = imap.fetch(results, fetchOptions);
          f.on("message", (msg) => {
            msg.on("body", (stream: Source) => {
              simpleParser(stream, (err: Error, parsed: ParsedMail) => {
                if (err) throw err;

                processEmail(parsed, username).catch((error) => {
                  console.error("Error while processing email", error);
                });
              });
            });
          });

          f.once("error", (err) => reject(err));
          f.once("end", () => {
            imap.end();
          });
        });
      });
    });

    imap.once("error", (err: Error) => reject(err));
    imap.once("end", () => resolve("Connection ended."));
    imap.connect();
  });
}