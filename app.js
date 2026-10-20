const app = document.getElementById("app");

const state = {
  view: "splash",
  showPass: false,
  email: "admin@mybusiness.com",
  password: "",
  errors: {},
  date: new Date(2026, 9, 19),
  beta: 1,
  orders: [],
  customers: [],
  drivers: [
    { name: "Riley Park", email: "riley@example.com", status: "Idle", speed: "Default", brk: "—" },
    { name: "Taylor Dunn", email: "taylor@example.com", status: "On route", speed: "Default", brk: "30m" },
  ],
  modal: null,
  mapZoom: 1,
  dropOver: false,
  routePlanned: false,
  range: "September 1 – September 30, 2026",
};

const NAV = [
  ["orders", "Orders"],
  ["customers", "Customers"],
  ["routes", "Routes"],
  ["drivers", "Drivers"],
  ["insights", "Insights"],
  ["prefs", "Route preferences"],
];

function go(view, extra = {}) {
  Object.assign(state, extra, { view, modal: extra.modal ?? null });
  render();
}

function fmt(d) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function icon(name) {
  const p = {
    orders: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11h14V8M10 12h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17.5 14c2.2 0 3.5 2 3.5 5"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 16V8a3 3 0 0 1 3-3h4M18 8v8a3 3 0 0 1-3 3h-4"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M3.5 14.5l5.5-2M20.5 14.5l-5.5-2"/>',
    chart: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
    sliders: '<path d="M3 8h6M15 8h6M3 16h3M12 16h9"/><rect x="9" y="5" width="6" height="6" rx="1"/><rect x="6" y="13" width="6" height="6" rx="1"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    box: '<circle cx="12" cy="12" r="9"/><path d="M8 9h8v6H8zM10 12h4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    dl: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    uadd: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M18 8v6M15 11h6"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
    form: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  };
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p[name] || ""}</svg>`;
}

function mark() {
  return `<span class="logo-mark" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

function mapSvg() {
  const z = state.mapZoom;
  const route = state.routePlanned
    ? `<path d="M180 420 C 260 300, 340 280, 420 340 S 620 430, 760 300" fill="none" stroke="#319795" stroke-width="4" stroke-linecap="round"/>
       <circle cx="180" cy="420" r="7" fill="#234e52"/><circle cx="760" cy="300" r="7" fill="#c05621"/>`
    : "";
  return `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="transform:scale(${z}); transform-origin:center; transition:transform 280ms cubic-bezier(0.22,1,0.36,1)">
    <rect width="1000" height="700" fill="#d7e6ec"/>
    <path d="M0 40 H1000 V700 H0 Z" fill="#c9dbe3"/>
    <path d="M0 0 H540 L500 150 380 250 280 340 200 400 90 350 0 380 Z" fill="#a8d4e6"/>
    <path d="M560 210 C640 180 760 230 840 240 L1000 230 V310 C900 340 760 310 640 300 600 280 580 250 560 210 Z" fill="#a8d4e6"/>
    <path d="M190 280 l36-28 28 36 -28 36 z" fill="#c6f6d5"/>
    <path d="M40 640 L980 540" stroke="#8aa4b0" stroke-width="6"/>
    <path d="M500 150 C580 220 640 380 640 700" stroke="#8aa4b0" stroke-width="6" fill="none"/>
    <g font-size="14" fill="#234e52" font-family="Segoe UI, sans-serif" text-anchor="middle">
      <text x="240" y="190">Outer Harbour</text>
      <text x="720" y="270">Inner Harbour</text>
      <text x="214" y="328" fill="#2f855a">City Park</text>
      <text x="520" y="510" font-size="22">Downtown</text>
      <text x="820" y="620">Eastside</text>
    </g>
    ${route}
  </svg>
  <div class="zoom">
    <button type="button" data-act="zoom-in" aria-label="Zoom in">${icon("plus")}</button>
    <button type="button" data-act="zoom-out" aria-label="Zoom out">${icon("search")}</button>
  </div>`;
}

function sampleOrders() {
  return [
    { id: "RF-1042", name: "Harbour Bakery", addr: "12 Quay St", window: "08:00–10:00", status: "Ready" },
    { id: "RF-1043", name: "City Park Clinic", addr: "88 Grove Ave", window: "10:30–12:00", status: "Ready" },
    { id: "RF-1044", name: "Eastside Depot", addr: "401 Rail Rd", window: "13:00–16:00", status: "Hold" },
  ];
}

function rail() {
  const keys = { orders: "orders", customers: "users", routes: "route", drivers: "wheel", insights: "chart", prefs: "sliders" };
  return `<nav class="rail" aria-label="Main">
    <button class="wordmark" data-go="orders" title="Routeflow" style="border:0;background:none;height:56px">${mark()}</button>
    <button class="ws" data-go="settings" title="Workspaces">DW</button>
    ${NAV.map(([k, t]) => `<button class="nav-btn ${state.view === k ? "on" : ""}" data-go="${k}" title="${t}">${icon(keys[k])}</button>`).join("")}
    <div class="sp"></div>
    <button class="nav-btn ${state.view === "whatsnew" ? "on" : ""}" data-go="whatsnew" title="What's new">${icon("box")}</button>
    <button class="nav-btn ${state.view === "help" ? "on" : ""}" data-go="help" title="Help">${icon("help")}</button>
    <button class="nav-btn ${state.view === "settings" ? "on" : ""}" data-go="settings" title="Company settings">${icon("gear")}</button>
    <button class="nav-btn" data-go="login" title="Log out"><span class="ini" style="margin:0">R</span></button>
  </nav>`;
}

function shell(top, body, foot = "") {
  return `<div class="shell">${rail()}<div class="workspace"><div class="top">${top}</div><div class="body">${body}</div>${foot}</div></div>${modalHtml()}`;
}

function modalHtml() {
  if (!state.modal) return "";
  if (state.modal === "manual") {
    return `<div class="modal-bg" data-act="close-modal"><div class="modal card" onclick="event.stopPropagation()">
      <h3 class="h3">Create order</h3>
      <label>Customer</label><div class="field"><input id="m-name" placeholder="Harbour Bakery"></div>
      <label>Address</label><div class="field"><input id="m-addr" placeholder="12 Quay St"></div>
      <label>Time window</label><div class="field"><input id="m-win" placeholder="08:00–10:00"></div>
      <div style="height:14px"></div>
      <button class="solid" data-act="save-order">Add order</button>
    </div></div>`;
  }
  if (state.modal === "customer") {
    return `<div class="modal-bg" data-act="close-modal"><div class="modal card" onclick="event.stopPropagation()">
      <h3 class="h3">Add customer</h3>
      <label>Name</label><div class="field"><input id="c-name" placeholder="North Pier Co."></div>
      <label>Email</label><div class="field"><input id="c-mail" placeholder="ops@northpier.com"></div>
      <div style="height:14px"></div>
      <button class="solid" data-act="save-customer">Save customer</button>
    </div></div>`;
  }
  if (state.modal === "invite") {
    return `<div class="modal-bg" data-act="close-modal"><div class="modal card" onclick="event.stopPropagation()">
      <h3 class="h3">Invite driver</h3>
      <label>Name</label><div class="field"><input id="d-name" placeholder="Jordan Lee"></div>
      <label>Email</label><div class="field"><input id="d-mail" placeholder="jordan@example.com"></div>
      <div style="height:14px"></div>
      <button class="solid" data-act="save-driver">Send invite</button>
    </div></div>`;
  }
  if (state.modal === "shopify" || state.modal === "api") {
    const t = state.modal === "shopify" ? "Connect to Shopify" : "Connect via API";
    const d = state.modal === "shopify"
      ? "Import open orders from your Shopify store. This prototype only stores the connection locally."
      : "Paste a REST endpoint. No network call is made in this prototype.";
    return `<div class="modal-bg" data-act="close-modal"><div class="modal card" onclick="event.stopPropagation()">
      <h3 class="h3">${t}</h3>
      <p style="color:var(--mute);margin-bottom:12px">${d}</p>
      <div class="field"><input id="ext" placeholder="${state.modal === "shopify" ? "my-store.myshopify.com" : "https://api.mybusiness.com/orders"}"></div>
      <div style="height:14px"></div>
      <button class="solid" data-act="connect-ext">Connect</button>
    </div></div>`;
  }
  return "";
}

function ordersView() {
  const n = state.orders.length;
  const drop = n
    ? `<div class="list">${state.orders.map((o) => `<button class="module order-row" type="button">
        <span class="dot" style="background:${o.status === "Hold" ? "var(--warn)" : "var(--teal)"}"></span>
        <span><b>${o.name}</b><small style="display:block;color:var(--mute)">${o.id} · ${o.addr}</small></span>
        <span class="vis-text-small">${o.window}</span>
      </button>`).join("")}</div>`
    : `<div class="drop ${state.dropOver ? "over" : ""}" data-drop="1">
        <div>${icon("dl")}<b>Select a CSV, XLS, or XLSX file to upload</b><span>or drag and drop your file here</span></div>
      </div>`;
  return shell(
    `<h1>Orders</h1>
     <div class="field search">${icon("search")}<input data-filter="orders" placeholder="Search orders"></div>
     <button class="ghost" type="button">Status ${icon("down")}</button>
     <button class="ghost" type="button" style="border-color:#81e6d9">Created date <span class="ini" style="margin:0;width:18px;height:18px;font-size:10px">1</span></button>
     <button class="icon-btn sq" type="button" aria-label="Filters">${icon("filter")}</button>
     <button class="soft" data-modal="manual" style="margin-left:auto">${icon("plus")} Add orders</button>`,
    `<div class="orders-col">
        ${drop}
        <div style="display:flex;justify-content:space-between">
          <button class="ghost" data-act="template">${icon("dl")} Download template</button>
          <button class="ghost" data-act="reset-map">Reset column mapping</button>
        </div>
        <div style="color:var(--mute);font-size:13px">Other ways to add orders</div>
        <div class="ways">
          <button class="module way" data-modal="manual"><i>${icon("form")}</i><span>Create orders manually<small>Add orders one at a time using a form</small></span></button>
          <button class="module way" data-modal="shopify"><i>${icon("bag")}</i><span>Connect to Shopify<small>Import your orders from Shopify</small></span></button>
          <button class="module way" data-modal="api"><i>${icon("link")}</i><span>Connect via API<small>Link your system using our REST API</small></span></button>
        </div>
     </div>
     <div class="map">${mapSvg()}</div>`,
    `<div class="foot">
       <div class="pager">${n} – ${n} of ${n}
         <button class="icon-btn sq" disabled>${icon("left")}</button>
         <button class="icon-btn sq" style="background:#e6fffa;border-color:#81e6d9;color:var(--teal-deep)">1</button>
         <button class="icon-btn sq" disabled>${icon("right")}</button>
       </div>
       <button class="solid right" style="width:auto;padding:0 18px" data-go="routes" ${n ? "" : "disabled"}>Schedule (${n})</button>
     </div>`
  );
}

function customersView() {
  const body = state.customers.length
    ? `<div style="flex:1;overflow:auto"><table><tr><th>NAME</th><th>EMAIL</th></tr>${state.customers.map((c) =>
        `<tr><td><span class="ini">${c.name.slice(0, 1)}</span>${c.name}</td><td>${c.email}</td></tr>`
      ).join("")}</table></div>`
    : `<div class="empty"><div style="width:88px;height:88px;border-radius:24px;background:#e6fffa;display:grid;place-items:center;margin:0 auto 8px;color:var(--teal-deep)">${icon("users")}</div>
        <b style="color:var(--ink);font-size:18px">No customers yet</b>
        <span>Add your first customer to get started</span>
        <button class="ghost" data-modal="customer">${icon("uadd")} Add customer</button></div>`;
  return shell(
    `<h1>Customers</h1><div class="field search" style="margin:0 auto">${icon("search")}<input placeholder="Search customers"></div>
     <button class="solid" style="width:auto;padding:0 16px" data-modal="customer">${icon("uadd")} Add customer</button>`,
    body
  );
}

function routesView() {
  const n = state.orders.length;
  return shell(
    `<h1>Routes</h1>
     <div class="datebar">
       <button type="button" data-act="day-prev">${icon("left")}</button>
       <span>${fmt(state.date)}</span>
       <button type="button" data-act="day-next">${icon("right")}</button>
     </div>
     <button class="ghost" style="margin-left:auto">Orders list ${icon("down")}</button>
     <button class="icon-btn sq">${icon("search")}</button>
     <button class="icon-btn sq" disabled>${icon("undo")}</button>
     <button class="icon-btn sq" disabled>${icon("redo")}</button>
     <button class="icon-btn sq" data-act="template">${icon("dl")}</button>
     <button class="icon-btn sq" data-modal="manual">${icon("plus")}</button>
     <button class="soft" data-act="plan">${icon("cal")} Plan routes</button>`,
    `<div class="panel"><h2>Orders</h2><div class="inner">
        ${n ? state.orders.map((o) => `<div class="module order-row"><span class="dot"></span><span><b>${o.name}</b><small style="display:block;color:var(--mute)">${o.addr}</small></span><span>${o.window}</span></div>`).join("")
          : `<div class="drop"><div>${icon("dl")}<b>Select a CSV, XLS, or XLSX file to upload</b><span>or drag and drop your file here</span></div></div>
             <p>Need to remap columns?<br><button class="link" data-go="settings">Reset in Company settings</button></p>
             <p>Not sure how to structure your spreadsheet?<br><button class="link" data-act="template">Download our template</button></p>`}
     </div></div>
     <div class="map">${mapSvg()}${state.beta ? `<div class="pop">
        <div class="hd"><span class="tag">NOW IN BETA</span>
          <div style="font-size:20px;font-weight:700;margin-top:8px;max-width:14ch">${state.beta === 1 ? "Connect to the apps you use" : "Automate your orders"}</div>
        </div>
        <div style="padding:14px 16px 16px">
          <b>${state.beta === 1 ? "Connect Routeflow to apps you already use" : "Send orders in automatically"}</b>
          <p style="color:var(--mute);margin:6px 0 12px;font-size:13px">No code needed, and we're looking for beta testers.</p>
          <div style="display:flex;justify-content:space-between;align-items:center;color:var(--mute);font-size:12px">
            ${state.beta} / 2
            <button class="solid" style="width:auto;height:34px;padding:0 16px" data-act="beta-next">${state.beta === 1 ? "Next" : "Done"}</button>
          </div>
        </div>
      </div>` : ""}</div>`,
    `<div class="foot"><div class="stats">
        <span>${icon("route")} ${state.routePlanned ? 1 : 0}</span>
        <span>${icon("orders")} ${n}</span>
        <span>${icon("pin")} ${state.routePlanned ? "18 km" : "0 km"}</span>
        <span>${icon("clock")} ${state.routePlanned ? "2 h 10 m" : "0 m"}</span>
        <span>${icon("box")} ${n}</span>
      </div>
      <button class="solid right" style="width:auto;padding:0 16px" ${state.routePlanned ? "" : "disabled"}>Schedule all</button>
    </div>`
  );
}

function driversView() {
  return shell(
    `<h1>Drivers</h1><button class="solid" style="width:auto;margin-left:auto;padding:0 16px" data-modal="invite">Invite driver</button>`,
    `<div style="flex:1;overflow:auto"><table>
      <tr>${["NAME", "EMAIL", "STATUS", "SPEED", "BREAK TIME"].map((h) => `<th>${h}</th>`).join("")}</tr>
      ${state.drivers.map((d) => `<tr>
        <td><span class="ini">${d.name.split(" ").map((x) => x[0]).join("")}</span>${d.name}</td>
        <td>${d.email}</td>
        <td class="${d.status === "On route" ? "status-ok" : ""}">${d.status}</td>
        <td style="color:var(--mute)">${d.speed}</td>
        <td>${d.brk}</td>
      </tr>`).join("")}
    </table></div>`,
    `<div class="foot" style="justify-content:flex-end;padding-right:24px">1–${state.drivers.length} of ${state.drivers.length}
      <button class="icon-btn sq" style="background:#e6fffa;border-color:#81e6d9">1</button></div>`
  );
}

function insightsView() {
  const n = state.orders.length;
  const cards = [
    ["Completed routes", state.routePlanned ? "1" : "0"],
    ["Orders", String(n)],
    ["Estimated distance", state.routePlanned ? "18 km" : "0 km"],
    ["Working time", state.routePlanned ? "130 m" : "0 m"],
  ];
  return shell(
    `<h1>Insights <span style="color:var(--mute);vertical-align:middle">${icon("info")}</span></h1>
     <button class="ghost" style="margin-left:auto">${icon("cal")} ${state.range}</button>`,
    `<div style="flex:1;background:var(--page);padding:16px"><div class="module" style="overflow:hidden">
      <h2 style="padding:18px 22px;border-bottom:1px solid var(--line);font-size:18px">Route data</h2>
      <div class="kpis">${cards.map(([t, v]) => `<div class="kpi">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span>${t} <span style="color:var(--mute)">${icon("info")}</span></span>
          <button class="ghost" style="height:28px;font-size:12px">Driver stats</button>
        </div>
        <strong>${v}</strong>
        <svg class="spark" viewBox="0 0 120 36" aria-hidden="true"><path d="M0 28 L20 24 L40 26 L60 16 L80 18 L100 10 L120 12" fill="none" stroke="#319795" stroke-width="2"/></svg>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mute)"><span>Aug 31</span><span>Sep 29</span></div>
      </div>`).join("")}</div>
    </div></div>`
  );
}

function simple(title, copy) {
  return shell(`<h1>${title}</h1>`, `<div class="empty"><b style="color:var(--ink);font-size:18px">${title}</b><span>${copy}</span></div>`);
}

function authShell(inner, cta) {
  return `<div class="auth">
    <section class="stage">
      <div>
        <div class="wordmark" style="color:#e6fffa">${mark()} routeflow</div>
        <div class="tiles">
          <div class="tile">North loop<small>12 stops · on time</small></div>
          <div class="tile">Harbour run<small>7 stops · staged</small></div>
          <div class="tile">Hill circuit<small>9 stops · idle</small></div>
        </div>
      </div>
      <div>
        <h2>Dispatch that stays quiet under load.</h2>
        <p>Modular boards for orders, routes, and drivers — ice-toned, built for the desk, not the mood board.</p>
      </div>
    </section>
    <section class="auth-panel"><div class="card">
      <div class="card-head">
        <div class="wordmark">${mark()} routeflow</div>
        ${cta}
      </div>
      ${inner}
    </div></section>
  </div>`;
}

function loginView() {
  return authShell(
    `<h3 class="h3">Log in</h3>
     <div class="row-2">
       <button class="ghost oauth" data-act="oauth"><b style="color:#4285f4">G</b> Google</button>
       <button class="ghost oauth" data-act="oauth">Apple</button>
     </div>
     <div class="divider">or</div>
     <label>Email <em>*</em></label>
     <div class="field ${state.errors.email ? "bad" : ""}"><input id="email" value="${state.email}" autocomplete="username"></div>
     <div class="err">${state.errors.email || ""}</div>
     <label>Password <em>*</em></label>
     <div class="field ${state.errors.password ? "bad" : ""}">
       <input id="password" type="${state.showPass ? "text" : "password"}" value="${state.password}" autocomplete="current-password">
       <button class="link" data-act="toggle-pass" aria-label="Show password">${icon("eye")}</button>
     </div>
     <div class="err">${state.errors.password || ""}</div>
     <div style="margin:8px 0 4px"><button class="link" data-go="forgot">Forgot password?</button></div>
     <div class="banner"><span>Looking for the old <b>Routeflow</b>?</span><button class="link" data-go="old">Log in here</button></div>
     <button class="solid" data-act="login">Log in</button>`,
    `<button class="ghost" data-go="signup">Sign up</button>`
  );
}

function signupView() {
  return authShell(
    `<h3 class="h3">Create account</h3>
     <div class="row-2">
       <button class="ghost oauth" data-act="oauth"><b style="color:#4285f4">G</b> Google</button>
       <button class="ghost oauth" data-act="oauth">Apple</button>
     </div>
     <div class="divider">or</div>
     <label>Email <em>*</em></label>
     <div class="field ${state.errors.email ? "bad" : ""}"><input id="email" value="${state.email}"></div>
     <div class="err">${state.errors.email || ""}</div>
     <button class="solid" data-act="signup">Sign up</button>
     <p class="legal">By creating an account, you are agreeing to Routeflow's <button class="link">Terms and conditions</button> and <button class="link">Privacy policy</button>.</p>`,
    `<button class="ghost" data-go="login">Log in</button>`
  );
}

function forgotView() {
  return authShell(
    `<h3 class="h3">Forgot password</h3>
     <p style="color:var(--mute);margin-bottom:12px">We’ll send a reset link to this address. Nothing leaves this prototype.</p>
     <label>Email <em>*</em></label>
     <div class="field"><input id="email" value="${state.email}"></div>
     <div style="height:16px"></div>
     <button class="solid" data-act="reset-mail">Send reset link</button>
     <div style="margin-top:12px"><button class="link" data-go="login">Back to log in</button></div>`,
    `<button class="ghost" data-go="login">Log in</button>`
  );
}

function oldView() {
  return authShell(
    `<h3 class="h3">Classic log in</h3>
     <p style="color:var(--mute);margin-bottom:16px">The previous Routeflow desk is retired in this prototype. Use the same account on the new board.</p>
     <button class="solid" data-go="login">Use new log in</button>`,
    `<button class="ghost" data-go="signup">Sign up</button>`
  );
}

function splashView() {
  return `<div class="splash"><div class="orbits" aria-label="Routeflow"><b></b><b></b><b></b></div></div>`;
}

function render() {
  const v = state.view;
  const pages = {
    splash: splashView,
    login: loginView,
    signup: signupView,
    forgot: forgotView,
    old: oldView,
    orders: ordersView,
    customers: customersView,
    routes: routesView,
    drivers: driversView,
    insights: insightsView,
    prefs: () => simple("Route preferences", "Keep stops, windows, and vehicle rules as modular pieces. Send a frame and this board fills in."),
    settings: () => simple("Company settings", "Workspace DW, column mapping, and account details live here."),
    help: () => simple("Help", "Guides for upload templates, planning, and dispatch."),
    whatsnew: () => simple("What's new", "Beta app connections and automatic order intake."),
  };
  app.innerHTML = (pages[v] || pages.orders)();
}

function readFields() {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  if (email) state.email = email.value;
  if (password) state.password = password.value;
}

function login() {
  readFields();
  const errors = {};
  if (!/\S+@\S+\.\S+/.test(state.email)) errors.email = "Please enter a valid email";
  if (!state.password) errors.password = "Please enter a password";
  state.errors = errors;
  if (!errors.email && !errors.password) {
    state.view = "orders";
    state.errors = {};
  }
  render();
}

function downloadTemplate() {
  const csv = "name,address,window\nHarbour Bakery,12 Quay St,08:00-10:00\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "routeflow-orders-template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

app.addEventListener("click", (e) => {
  const t = e.target.closest("[data-go],[data-act],[data-modal]");
  if (!t) return;
  if (t.dataset.go) {
    if (t.dataset.go === "login") state.password = "";
    go(t.dataset.go);
    return;
  }
  if (t.dataset.modal) {
    state.modal = t.dataset.modal;
    render();
    return;
  }
  const act = t.dataset.act;
  if (act === "login") login();
  if (act === "signup") {
    readFields();
    if (/\S+@\S+\.\S+/.test(state.email)) go("orders");
    else {
      state.errors = { email: "Please enter a valid email" };
      render();
    }
  }
  if (act === "oauth") go("orders");
  if (act === "toggle-pass") {
    readFields();
    state.showPass = !state.showPass;
    render();
  }
  if (act === "reset-mail") go("login");
  if (act === "template") downloadTemplate();
  if (act === "reset-map") {
    state.orders = [];
    state.routePlanned = false;
    render();
  }
  if (act === "zoom-in") {
    state.mapZoom = Math.min(1.6, state.mapZoom + 0.12);
    render();
  }
  if (act === "zoom-out") {
    state.mapZoom = Math.max(0.8, state.mapZoom - 0.12);
    render();
  }
  if (act === "day-prev") {
    state.date = new Date(state.date.getTime() - 864e5);
    render();
  }
  if (act === "day-next") {
    state.date = new Date(state.date.getTime() + 864e5);
    render();
  }
  if (act === "beta-next") {
    state.beta = state.beta === 1 ? 2 : 0;
    render();
  }
  if (act === "plan") {
    if (state.orders.length) state.routePlanned = true;
    render();
  }
  if (act === "close-modal") {
    state.modal = null;
    render();
  }
  if (act === "save-order") {
    const name = document.getElementById("m-name").value || "Manual stop";
    const addr = document.getElementById("m-addr").value || "Unspecified";
    const window = document.getElementById("m-win").value || "Open";
    state.orders.push({ id: "RF-" + (1040 + state.orders.length + 1), name, addr, window, status: "Ready" });
    state.modal = null;
    render();
  }
  if (act === "save-customer") {
    state.customers.push({
      name: document.getElementById("c-name").value || "New customer",
      email: document.getElementById("c-mail").value || "ops@example.com",
    });
    state.modal = null;
    render();
  }
  if (act === "save-driver") {
    state.drivers.push({
      name: document.getElementById("d-name").value || "New driver",
      email: document.getElementById("d-mail").value || "driver@example.com",
      status: "Invited",
      speed: "Default",
      brk: "—",
    });
    state.modal = null;
    render();
  }
  if (act === "connect-ext") {
    if (!state.orders.length) state.orders = sampleOrders();
    state.modal = null;
    render();
  }
});

app.addEventListener("input", () => readFields());

app.addEventListener("submit", (e) => e.preventDefault());

["dragenter", "dragover"].forEach((ev) => {
  app.addEventListener(ev, (e) => {
    if (!e.target.closest("[data-drop]")) return;
    e.preventDefault();
    if (!state.dropOver) {
      state.dropOver = true;
      render();
    }
  });
});
app.addEventListener("dragleave", (e) => {
  if (e.target.closest("[data-drop]") && state.dropOver) {
    state.dropOver = false;
    render();
  }
});
app.addEventListener("drop", (e) => {
  if (!e.target.closest("[data-drop]")) return;
  e.preventDefault();
  state.dropOver = false;
  state.orders = sampleOrders();
  render();
});
app.addEventListener("click", (e) => {
  if (e.target.closest("[data-drop]") && !state.orders.length) {
    state.orders = sampleOrders();
    render();
  }
});

render();
setTimeout(() => {
  if (state.view === "splash") go("login");
}, 1100);
