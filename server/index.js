import { createEmailCheckApp } from "./emailCheckApp.js";
import { startDisposableDomainRefresh } from "./disposableDomains.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

startDisposableDomainRefresh();

const app = createEmailCheckApp();

app.listen(PORT, HOST, () => {
  console.log(`Email check API listening on http://${HOST}:${PORT}`);
});
